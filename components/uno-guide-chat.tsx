"use client";

import { FormEvent, useRef, useState } from "react";
import { playUiSound } from "@/lib/ui-sounds";

type UnoGuideChatProps = {
  isOpen: boolean;
  onClose: () => void;
};

const chatEndpoint = process.env.NEXT_PUBLIC_UNO_CHAT_API_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const MAX_INPUT_LENGTH = 280;
const MAX_HISTORY_MESSAGES = 8;
const UNO_FAILURE_MESSAGE =
  "Uno is out for a swim, sorry. Email Rock at mailto:rvguitard@gmail.com or DM him on X/LinkedIn.";

type UnoMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

const linkPattern = /(https?:\/\/[^\s)]+|mailto:[^\s)]+)/g;

function renderLinkedText(text: string) {
  return text.split(linkPattern).map((part, index) => {
    if (!part.match(linkPattern)) return part;

    return (
      <a href={part} key={`${part}-${index}`} target="_blank" rel="noreferrer">
        {part.replace(/^mailto:/, "")}
      </a>
    );
  });
}

export function UnoGuideChat({ isOpen, onClose }: UnoGuideChatProps) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<UnoMessage[]>([]);
  const [isSending, setIsSending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const canSend = input.trim().length > 0 && !isSending;

  const getSessionId = () => {
    const storageKey = "rvg-uno-session-id";
    const existingId = window.localStorage.getItem(storageKey);
    if (existingId) return existingId;

    const nextId = crypto.randomUUID();
    window.localStorage.setItem(storageKey, nextId);
    return nextId;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = input.trim().slice(0, MAX_INPUT_LENGTH);
    await sendPrompt(text);
  };

  const sendPrompt = async (text: string) => {
    if (!text || isSending) return;

    const nextMessages: UnoMessage[] = [
      ...messages.slice(-MAX_HISTORY_MESSAGES + 1),
      { id: crypto.randomUUID(), role: "user", content: text },
    ];

    setInput("");
    setIsSending(true);
    setMessages(nextMessages);

    try {
      if (!chatEndpoint) {
        console.error("Uno guide request failed", "Missing NEXT_PUBLIC_UNO_CHAT_API_URL");
        throw new Error(UNO_FAILURE_MESSAGE);
      }

      const response = await fetch(chatEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-uno-session-id": getSessionId(),
          ...(supabaseAnonKey
            ? {
                apikey: supabaseAnonKey,
                Authorization: `Bearer ${supabaseAnonKey}`,
              }
            : {}),
        },
        body: JSON.stringify({
          messages: nextMessages
            .slice(-MAX_HISTORY_MESSAGES)
            .map(({ role, content }) => ({ role, content: content.slice(0, MAX_INPUT_LENGTH) })),
        }),
      });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        console.error("Uno guide request failed", data?.error || data?.message || response.statusText);
        throw new Error(data?.error === "UNO_UNAVAILABLE" && data?.message ? data.message : UNO_FAILURE_MESSAGE);
      }

      setMessages([
        ...nextMessages,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: data?.text || "I got a little lost there. Try asking me again.",
        },
      ]);
      void playUiSound("message");
    } catch (requestError) {
      console.error("Uno guide request failed", requestError);
      setMessages([
        ...nextMessages,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: UNO_FAILURE_MESSAGE,
        },
      ]);
      void playUiSound("message");
    } finally {
      setIsSending(false);
    }
  };

  const suggestionPrompts = [
    { label: "Want to work with Rock?", prompt: "What should I know if I want to work with Rock?" },
    { label: "Who is Rock?", prompt: "Tell me about Rock." },
    { label: "What's new lately?", prompt: "What's Rock focused on lately?" },
  ];

  return (
    <aside className={`uno-guide-chat${isOpen ? " is-open" : ""}`} aria-label="Uno portfolio guide">
      <div className="uno-guide-chat-header">
        <div>
          <p>
            <strong>Uno</strong>
            <span>Rock&apos;s penguin</span>
          </p>
        </div>
        <button className="uno-guide-chat-close" type="button" onClick={onClose} aria-label="Close Uno guide">
          <svg aria-hidden="true" viewBox="0 0 16 16">
            <path d="M4.2 4.2 11.8 11.8M11.8 4.2 4.2 11.8" />
          </svg>
        </button>
      </div>

      <div className="uno-guide-chat-log" aria-live="polite">
        {messages.length === 0 ? (
          <div className="uno-guide-message is-assistant">
            Hi, I&apos;m Uno. Ask me about Rock&apos;s work, tools, background, or weird little web experiments.
          </div>
        ) : (
          messages.map((message) => (
            <div className={`uno-guide-message is-${message.role}`} key={message.id}>
              {renderLinkedText(message.content)}
            </div>
          ))
        )}
        {isSending ? (
          <div className="uno-guide-message is-assistant is-thinking">hmm...</div>
        ) : null}
      </div>

      {messages.length === 0 ? (
        <div className="uno-guide-suggestions" aria-label="Suggested questions">
          {suggestionPrompts.map((suggestion) => (
            <button
              key={suggestion.label}
              type="button"
              onClick={() => sendPrompt(suggestion.prompt)}
              disabled={isSending}
            >
              {suggestion.label}
            </button>
          ))}
        </div>
      ) : null}

      <p className="uno-guide-privacy">
        Do not share private info. Uno chat may be sent to an AI endpoint.
      </p>

      <form className="uno-guide-chat-form" onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          value={input}
          onChange={(event) => setInput(event.target.value.slice(0, MAX_INPUT_LENGTH))}
          placeholder="Ask Uno..."
          maxLength={MAX_INPUT_LENGTH}
        />
        <button type="submit" disabled={!canSend} aria-label="Send message">
          <svg aria-hidden="true" viewBox="0 0 16 16">
            <path d="M3 8h9M8.5 4 12.5 8 8.5 12" />
          </svg>
        </button>
      </form>
    </aside>
  );
}
