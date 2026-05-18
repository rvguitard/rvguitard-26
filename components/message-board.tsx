"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getVisitorId } from "@/lib/visitor-id";
import {
  MESSAGE_MAX_LENGTH,
  validateMessage,
} from "@/lib/message-rules";

type BoardMessage = {
  id: string;
  body: string;
  createdAt: string;
};

type MessageRow = {
  id: string;
  body: string;
  created_at: string;
};

const submittedDayKey = "rvg-message-board-submitted-day";
const messagesCacheKey = "rvg-message-board-cache";
const showMessageReset = process.env.NODE_ENV !== "production";
const starterMessages: BoardMessage[] = [
  {
    id: "starter-1",
    body: "Yo, love you.",
    createdAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "starter-2",
    body: "Whatcha been watching lately?",
    createdAt: "2026-01-02T00:00:00.000Z",
  },
];

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function getSubmittedDay() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage?.getItem(submittedDayKey) ?? null;
  } catch {
    return null;
  }
}

function saveSubmittedDay(submittedDay: string) {
  try {
    window.localStorage?.setItem(submittedDayKey, submittedDay);
  } catch {
    return;
  }
}

function resetMessageState() {
  try {
    window.localStorage?.removeItem(submittedDayKey);
  } catch {
    return;
  }
}

function getCachedMessages() {
  if (typeof window === "undefined") {
    return starterMessages;
  }

  try {
    const savedMessages = window.localStorage?.getItem(messagesCacheKey);

    if (!savedMessages) {
      return starterMessages;
    }

    const messages = JSON.parse(savedMessages) as BoardMessage[];
    return messages.length > 0 ? messages : starterMessages;
  } catch {
    return starterMessages;
  }
}

function saveCachedMessages(messages: BoardMessage[]) {
  try {
    window.localStorage?.setItem(messagesCacheKey, JSON.stringify(messages));
  } catch {
    return;
  }
}

function mapMessageRow(row: MessageRow): BoardMessage {
  return {
    id: row.id,
    body: row.body,
    createdAt: row.created_at,
  };
}

function sortMessages(messages: BoardMessage[]) {
  return [...messages].sort(
    (firstMessage, secondMessage) =>
      new Date(firstMessage.createdAt).getTime() -
      new Date(secondMessage.createdAt).getTime(),
  );
}

function dedupeMessages(messages: BoardMessage[]) {
  return Array.from(
    new Map(messages.map((message) => [message.id, message])).values(),
  );
}

export function MessageBoard() {
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<BoardMessage[]>(getCachedMessages);
  const [submittedDay, setSubmittedDay] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSyncedMessages, setHasSyncedMessages] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const historyRef = useRef<HTMLDivElement>(null);
  const todayKey = useMemo(() => getTodayKey(), []);
  const hasSubmittedToday = submittedDay === todayKey;
  const remainingCharacters = MESSAGE_MAX_LENGTH - draft.length;

  useEffect(() => {
    setSubmittedDay(getSubmittedDay());

    if (!supabase) {
      return;
    }

    const client = supabase;
    let isMounted = true;

    async function loadMessages() {
      const { data, error } = await client
        .from("messages")
        .select("id,body,created_at")
        .order("created_at", { ascending: true })
        .limit(40);

      if (!isMounted || error || !data) {
        return;
      }

      const remoteMessages = (data as MessageRow[]).map(mapMessageRow);
      const nextMessages = remoteMessages.length > 0 ? remoteMessages : starterMessages;

      saveCachedMessages(nextMessages);
      setMessages(nextMessages);
      setHasSyncedMessages(true);
    }

    loadMessages();

    const channel = client
      .channel("message-board")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          const row = payload.new as MessageRow | null;

          if (!row?.id) {
            loadMessages();
            return;
          }

          setMessages((currentMessages) => {
            const nextMessages = sortMessages(
              dedupeMessages([...currentMessages, mapMessageRow(row)]),
            );

            saveCachedMessages(nextMessages);
            return nextMessages;
          });
        },
      )
      .subscribe();

    return () => {
      isMounted = false;
      client.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    historyRef.current?.scrollTo({
      top: historyRef.current.scrollHeight,
    });
  }, [messages]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (hasSubmittedToday || isSubmitting) {
      return;
    }

    const visitorId = getVisitorId();
    const form = event.currentTarget;
    const result = validateMessage(String(new FormData(form).get("message") ?? ""));

    if (!result.ok) {
      setFeedback(result.message);
      return;
    }

    const body = result.body;
    const optimisticMessage = {
      id: `local-${todayKey}-${Date.now()}`,
      body,
      createdAt: new Date().toISOString(),
    };

    setIsSubmitting(true);
    setMessages((currentMessages) => {
      const nextMessages = sortMessages(
        dedupeMessages([...currentMessages, optimisticMessage]),
      );

      saveCachedMessages(nextMessages);
      return nextMessages;
    });
    setSubmittedDay(todayKey);
    saveSubmittedDay(todayKey);
    setFeedback(null);
    setDraft("");
    form.reset();

    if (!supabase || !visitorId) {
      setIsSubmitting(false);
      return;
    }

    const client = supabase;

    const { data, error } = await client
      .from("messages")
      .insert({
        visitor_id: visitorId,
        body,
      })
      .select("id,body,created_at")
      .single();

    setIsSubmitting(false);

    if (error || !data) {
      setFeedback("That message did not go through.");
      setSubmittedDay(null);
      resetMessageState();
      setMessages((currentMessages) =>
        currentMessages.filter((message) => message.id !== optimisticMessage.id),
      );
      return;
    }

    setMessages((currentMessages) => {
      const nextMessages = sortMessages(
        dedupeMessages([
          ...currentMessages.filter((message) => message.id !== optimisticMessage.id),
          mapMessageRow(data as MessageRow),
        ]),
      );

      saveCachedMessages(nextMessages);
      return nextMessages;
    });
  }

  function handleResetMessages() {
    resetMessageState();
    setSubmittedDay(null);
  }

  return (
    <section className="chat-card" aria-label="Message board">
      {showMessageReset && (
        <button
          aria-label="Reset messages for testing"
          className="message-reset"
          onClick={handleResetMessages}
          type="button"
        >
          ↺
        </button>
      )}

      <div
        className={`message-history ${hasSyncedMessages ? "is-synced" : "is-syncing"}`}
        ref={historyRef}
      >
        {messages.map((message, index) => (
          <div
            className={`bubble ${index % 2 === 0 ? "incoming" : "outgoing"}`}
            key={message.id}
          >
            {message.body}
          </div>
        ))}
      </div>

      {hasSubmittedToday ? (
        <p className="message-sent">Message sent for today.</p>
      ) : (
        <form className="message-form" onSubmit={handleSubmit}>
          <input
            aria-label="Share a message"
            className="message-input"
            disabled={isSubmitting}
            maxLength={MESSAGE_MAX_LENGTH}
            name="message"
            onChange={(event) => {
              setDraft(event.target.value);
              setFeedback(null);
            }}
            placeholder="Share a message..."
            type="text"
            value={draft}
          />
          <button
            className="message-submit"
            disabled={isSubmitting || draft.trim().length === 0}
            type="submit"
          >
            Submit
          </button>
          <span className="message-meter" aria-live="polite">
            {remainingCharacters}
          </span>
          {feedback && (
            <p className="message-feedback" role="status">
              {feedback}
            </p>
          )}
        </form>
      )}
    </section>
  );
}
