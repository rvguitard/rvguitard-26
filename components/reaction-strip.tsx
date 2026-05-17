"use client";

import { useSyncExternalStore, type CSSProperties } from "react";
import { useEffect, useMemo, useRef, useState } from "react";

type Reaction = {
  id: string;
  emoji: string;
};

const reactions: Reaction[] = [
  { id: "grin-1", emoji: "😁" },
  { id: "poop", emoji: "💩" },
  { id: "wow", emoji: "😮" },
  { id: "skull", emoji: "💀" },
  { id: "smile", emoji: "😊" },
  { id: "anguished", emoji: "😖" },
  { id: "sweat", emoji: "😅" },
  { id: "grin-2", emoji: "😁" },
  { id: "thumbs-up", emoji: "👍" },
  { id: "money", emoji: "🤑" },
  { id: "eyes", emoji: "👀" },
  { id: "happy", emoji: "😄" },
  { id: "clap", emoji: "👏" },
  { id: "angry", emoji: "😠" },
  { id: "laugh", emoji: "🤣" },
  { id: "pray", emoji: "🙏" },
  { id: "teary", emoji: "🥹" },
  { id: "kiss", emoji: "😘" },
  { id: "mind-blown", emoji: "🤯" },
  { id: "peace", emoji: "✌️" },
  { id: "heart-eyes", emoji: "😍" },
  { id: "point-up", emoji: "☝️" },
  { id: "rage", emoji: "😡" },
];

const countsKey = "rvg-reaction-counts";
const selectedKey = "rvg-reaction-selected-visit";
const reactionStoreEvent = "rvg-reaction-store-change";
const showReactionReset = process.env.NODE_ENV !== "production";
const reactionBaseSlot = 24;
const reactionGap = 2;

function getInitialCounts() {
  return Object.fromEntries(
    reactions.map((reaction) => [reaction.id, 0]),
  );
}

function getReactionScale(count: number) {
  return Math.min(1 + count * 0.045, 1.7);
}

function parseCounts(savedCounts: string | null) {
  if (!savedCounts) {
    return getInitialCounts();
  }

  try {
    return { ...getInitialCounts(), ...JSON.parse(savedCounts) };
  } catch {
    return getInitialCounts();
  }
}

function getStoredCounts() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage?.getItem(countsKey) ?? null;
  } catch {
    return null;
  }
}

function getStoredSelectedReaction() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.sessionStorage?.getItem(selectedKey) ?? null;
  } catch {
    return null;
  }
}

function saveReactionState(reactionId: string, counts: Record<string, number>) {
  try {
    window.localStorage?.setItem(countsKey, JSON.stringify(counts));
    window.sessionStorage?.setItem(selectedKey, reactionId);
    window.dispatchEvent(new Event(reactionStoreEvent));
  } catch {
    return;
  }
}

function resetReactionState() {
  try {
    window.localStorage?.removeItem(countsKey);
    window.sessionStorage?.removeItem(selectedKey);
    window.dispatchEvent(new Event(reactionStoreEvent));
  } catch {
    return;
  }
}

function getReactionSnapshot() {
  return JSON.stringify({
    counts: parseCounts(getStoredCounts()),
    selectedReaction: getStoredSelectedReaction(),
  });
}

function getServerReactionSnapshot() {
  return JSON.stringify({
    counts: getInitialCounts(),
    selectedReaction: null,
  });
}

function subscribeToReactionStore(callback: () => void) {
  window.addEventListener(reactionStoreEvent, callback);
  window.addEventListener("storage", callback);

  return () => {
    window.removeEventListener(reactionStoreEvent, callback);
    window.removeEventListener("storage", callback);
  };
}

export function ReactionStrip() {
  const reactionListRef = useRef<HTMLDivElement>(null);
  const [reactionListWidth, setReactionListWidth] = useState(0);
  const snapshot = useSyncExternalStore(
    subscribeToReactionStore,
    getReactionSnapshot,
    getServerReactionSnapshot,
  );
  const { counts, selectedReaction } = JSON.parse(snapshot) as {
    counts: Record<string, number>;
    selectedReaction: string | null;
  };
  const rawScales = useMemo(
    () => reactions.map((reaction) => getReactionScale(counts[reaction.id] ?? 0)),
    [counts],
  );
  const totalDesiredWidth = rawScales.reduce(
    (total, scale) => total + reactionBaseSlot * scale,
    reactionGap * (reactions.length - 1),
  );
  const fitRatio = reactionListWidth > 0
    ? Math.min(1, reactionListWidth / totalDesiredWidth)
    : 1;

  useEffect(() => {
    const reactionList = reactionListRef.current;

    if (!reactionList) {
      return;
    }

    const observer = new ResizeObserver(([entry]) => {
      setReactionListWidth(entry.contentRect.width);
    });

    observer.observe(reactionList);

    return () => observer.disconnect();
  }, []);

  function handleReactionClick(reactionId: string) {
    if (selectedReaction) {
      return;
    }

    const nextCounts = {
      ...counts,
      [reactionId]: (counts[reactionId] ?? 0) + 1,
    };

    saveReactionState(reactionId, nextCounts);
  }

  return (
    <div className="reaction-strip" aria-label="Reactions">
      {showReactionReset && (
        <button
          aria-label="Reset reactions for testing"
          className="reaction-reset"
          onClick={resetReactionState}
          type="button"
        >
          ↺
        </button>
      )}
      <div className="reaction-list" ref={reactionListRef}>
      {reactions.map((reaction, index) => {
        const count = counts[reaction.id] ?? 0;
        const isSelected = selectedReaction === reaction.id;
        const reactionScale = rawScales[index] * fitRatio;
        const reactionSlotSize = reactionBaseSlot * reactionScale;
        const buttonStyle = {
          "--reaction-scale": reactionScale,
          "--reaction-slot-size": `${reactionSlotSize}px`,
        } as CSSProperties;

        return (
          <button
            key={reaction.id}
            aria-label={`${reaction.emoji} reaction${count > 0 ? `, ${count}` : ""}`}
            aria-pressed={isSelected}
            className="reaction-button"
            disabled={Boolean(selectedReaction)}
            onClick={() => handleReactionClick(reaction.id)}
            style={buttonStyle}
            type="button"
          >
            {count > 0 && <span className="reaction-count">{count}</span>}
            <span className="reaction-emoji" aria-hidden="true">
              {reaction.emoji}
            </span>
          </button>
        );
      })}
      </div>
    </div>
  );
}
