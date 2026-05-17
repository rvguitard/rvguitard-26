"use client";

import { FormEvent, useSyncExternalStore } from "react";
import { useMemo, useRef, useState } from "react";

type BoardMessage = {
  id: string;
  body: string;
  createdAt: string;
};

const messagesKey = "rvg-message-board-messages";
const submittedDayKey = "rvg-message-board-submitted-day";
const messageStoreEvent = "rvg-message-board-store-change";
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

function normalizeMessage(body: string) {
  return body.trim().replace(/\s+/g, " ").slice(0, 180);
}

function getStoredMessages() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage?.getItem(messagesKey) ?? null;
  } catch {
    return null;
  }
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

function parseMessages(savedMessages: string | null) {
  if (!savedMessages) {
    return starterMessages;
  }

  try {
    const messages = JSON.parse(savedMessages) as BoardMessage[];
    return messages.length > 0 ? messages : starterMessages;
  } catch {
    return starterMessages;
  }
}

function getMessageSnapshot() {
  return JSON.stringify({
    messages: parseMessages(getStoredMessages()),
    submittedDay: getSubmittedDay(),
  });
}

function getServerMessageSnapshot() {
  return JSON.stringify({
    messages: starterMessages,
    submittedDay: null,
  });
}

function subscribeToMessageStore(callback: () => void) {
  window.addEventListener(messageStoreEvent, callback);
  window.addEventListener("storage", callback);

  return () => {
    window.removeEventListener(messageStoreEvent, callback);
    window.removeEventListener("storage", callback);
  };
}

function saveMessageState(messages: BoardMessage[], submittedDay: string) {
  try {
    window.localStorage?.setItem(messagesKey, JSON.stringify(messages));
    window.localStorage?.setItem(submittedDayKey, submittedDay);
    window.dispatchEvent(new Event(messageStoreEvent));
  } catch {
    return;
  }
}

function resetMessageState() {
  try {
    window.localStorage?.removeItem(messagesKey);
    window.localStorage?.removeItem(submittedDayKey);
    window.dispatchEvent(new Event(messageStoreEvent));
  } catch {
    return;
  }
}

export function MessageBoard() {
  const [draft, setDraft] = useState("");
  const historyRef = useRef<HTMLDivElement>(null);
  const snapshot = useSyncExternalStore(
    subscribeToMessageStore,
    getMessageSnapshot,
    getServerMessageSnapshot,
  );
  const { messages, submittedDay } = JSON.parse(snapshot) as {
    messages: BoardMessage[];
    submittedDay: string | null;
  };
  const todayKey = useMemo(() => getTodayKey(), []);
  const hasSubmittedToday = submittedDay === todayKey;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (hasSubmittedToday) {
      return;
    }

    const form = event.currentTarget;
    const body = normalizeMessage(String(new FormData(form).get("message") ?? ""));

    if (!body) {
      return;
    }

    const nextMessages = [
      ...messages,
      {
        id: `local-${todayKey}-${messages.length}`,
        body,
        createdAt: todayKey,
      },
    ];

    saveMessageState(nextMessages, todayKey);
    setDraft("");
    form.reset();
    requestAnimationFrame(() => {
      historyRef.current?.scrollTo({
        top: historyRef.current.scrollHeight,
        behavior: "smooth",
      });
    });
  }

  return (
    <section className="chat-card" aria-label="Message board">
      {showMessageReset && (
        <button
          aria-label="Reset messages for testing"
          className="message-reset"
          onClick={resetMessageState}
          type="button"
        >
          ↺
        </button>
      )}

      <div className="message-history" ref={historyRef}>
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
            maxLength={180}
            name="message"
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Share a message..."
            type="text"
            value={draft}
          />
          <button className="message-submit" type="submit">
            Submit
          </button>
        </form>
      )}
    </section>
  );
}
