"use client";

import { CSSProperties, FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { playUiSound } from "@/lib/ui-sounds";
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

type MessageBubbleStyle = CSSProperties & {
  "--message-bg": string;
  "--message-color": string;
  "--message-border": string;
};

const submittedDayKey = "rvg-message-board-submitted-day";
const messagesCacheKey = "rvg-message-board-cache";
const messagePalettes = [
  { background: "oklch(94.5% 0.032 185)", color: "oklch(31% 0.04 190)", border: "oklch(72% 0.055 185 / 0.26)" },
  { background: "oklch(95% 0.03 292)", color: "oklch(32% 0.05 292)", border: "oklch(74% 0.06 292 / 0.24)" },
  { background: "oklch(95.2% 0.034 92)", color: "oklch(33% 0.045 82)", border: "oklch(76% 0.06 88 / 0.24)" },
  { background: "oklch(94.6% 0.032 34)", color: "oklch(33% 0.045 32)", border: "oklch(75% 0.055 36 / 0.24)" },
  { background: "oklch(95% 0.03 325)", color: "oklch(33% 0.052 320)", border: "oklch(76% 0.058 322 / 0.24)" },
  { background: "oklch(94.4% 0.03 225)", color: "oklch(32% 0.045 225)", border: "oklch(73% 0.055 220 / 0.24)" },
  { background: "oklch(94.8% 0.032 145)", color: "oklch(31% 0.045 145)", border: "oklch(72% 0.055 145 / 0.24)" },
  { background: "oklch(94.8% 0.03 70)", color: "oklch(32% 0.04 68)", border: "oklch(75% 0.055 72 / 0.24)" },
];

function getMessageBubbleStyle(index: number): MessageBubbleStyle {
  const palette = messagePalettes[index % messagePalettes.length];

  return {
    "--message-bg": palette.background,
    "--message-color": palette.color,
    "--message-border": palette.border,
  };
}

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
  const [messages, setMessages] = useState<BoardMessage[]>(starterMessages);
  const [submittedDay, setSubmittedDay] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSyncedMessages, setHasSyncedMessages] = useState(false);
  const [hasConfirmedPublicPost, setHasConfirmedPublicPost] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const historyRef = useRef<HTMLDivElement>(null);
  const todayKey = useMemo(() => getTodayKey(), []);
  const hasSubmittedToday = submittedDay === todayKey;
  const remainingCharacters = MESSAGE_MAX_LENGTH - draft.length;

  useEffect(() => {
    setSubmittedDay(getSubmittedDay());
    setMessages(getCachedMessages());

    if (!supabase) {
      return;
    }

    const client = supabase;
    let isMounted = true;

    async function loadMessages() {
      const { data, error } = await client
        .from("messages")
        .select("id,body,created_at")
        .order("created_at", { ascending: false })
        .limit(40);

      if (!isMounted || error || !data) {
        return;
      }

      const remoteMessages = sortMessages((data as MessageRow[]).map(mapMessageRow));
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

    if (!hasConfirmedPublicPost) {
      void playUiSound("error");
      setHasConfirmedPublicPost(true);
      setFeedback("Heads up: everything you write here is public. Do not share private info.");
      return;
    }

    if (!result.ok) {
      void playUiSound("error");
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
      void playUiSound("success");
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
      void playUiSound("error");
      setFeedback("That message did not go through.");
      setSubmittedDay(null);
      resetMessageState();
      setMessages((currentMessages) =>
        currentMessages.filter((message) => message.id !== optimisticMessage.id),
      );
      return;
    }

    void playUiSound("success");
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

  return (
    <section className="chat-card" aria-label="Message board">
      <div
        className={`message-history ${hasSyncedMessages ? "is-synced" : "is-syncing"}`}
        ref={historyRef}
      >
        {messages.map((message, index) => (
          <div
            className={`bubble ${index % 2 === 0 ? "incoming" : "outgoing"}`}
            key={message.id}
            suppressHydrationWarning
            style={getMessageBubbleStyle(index)}
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
              setHasConfirmedPublicPost(false);
            }}
            placeholder="Share a message..."
            type="text"
            value={draft}
          />
          <button
            className="message-submit"
            data-sound-ignore
            disabled={isSubmitting || draft.trim().length === 0}
            type="submit"
          >
            {hasConfirmedPublicPost ? "Post publicly" : "Submit"}
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
