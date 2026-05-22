"use client";

import { type CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getVisitorId } from "@/lib/visitor-id";

type Reaction = {
  id: string;
  emoji: string;
};

type ReactionCountRow = {
  reaction_id: string;
  count: number;
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

const selectedKey = "rvg-reaction-selected-visit";
const reactionBaseSlot = 24;
const reactionGap = 2;

function getInitialCounts() {
  return Object.fromEntries(
    reactions.map((reaction) => [reaction.id, 0]),
  ) as Record<string, number>;
}

function getReactionScale(count: number) {
  return Math.min(1 + count * 0.045, 1.7);
}

function getStoredSelectedReaction() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage?.getItem(selectedKey) ?? null;
  } catch {
    return null;
  }
}

function saveSelectedReaction(reactionId: string) {
  try {
    window.localStorage?.setItem(selectedKey, reactionId);
  } catch {
    return;
  }
}

function resetReactionState() {
  try {
    window.localStorage?.removeItem(selectedKey);
  } catch {
    return;
  }
}

function rowsToCounts(rows: ReactionCountRow[]) {
  return rows.reduce(
    (nextCounts, row) => ({
      ...nextCounts,
      [row.reaction_id]: row.count,
    }),
    getInitialCounts(),
  );
}

export function ReactionStrip() {
  const reactionListRef = useRef<HTMLDivElement>(null);
  const [counts, setCounts] = useState<Record<string, number>>(getInitialCounts);
  const [selectedReaction, setSelectedReaction] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reactionListWidth, setReactionListWidth] = useState(0);
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
    setSelectedReaction(getStoredSelectedReaction());

    if (!supabase) {
      return;
    }

    const client = supabase;
    let isMounted = true;

    async function loadReactionCounts() {
      const { data, error } = await client
        .from("reaction_counts")
        .select("reaction_id,count");

      if (!isMounted || error || !data) {
        return;
      }

      setCounts(rowsToCounts(data as ReactionCountRow[]));
    }

    loadReactionCounts();

    const channel = client
      .channel("reaction-counts")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "reaction_counts",
        },
        (payload) => {
          const row = payload.new as ReactionCountRow | null;

          if (!row?.reaction_id) {
            loadReactionCounts();
            return;
          }

          setCounts((currentCounts) => ({
            ...currentCounts,
            [row.reaction_id]: row.count,
          }));
        },
      )
      .subscribe();

    return () => {
      isMounted = false;
      client.removeChannel(channel);
    };
  }, []);

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

  async function handleReactionClick(reactionId: string) {
    if (selectedReaction || isSubmitting) {
      return;
    }

    const visitorId = getVisitorId();

    if (!supabase || !visitorId) {
      setSelectedReaction(reactionId);
      saveSelectedReaction(reactionId);
      setCounts((currentCounts) => ({
        ...currentCounts,
        [reactionId]: (currentCounts[reactionId] ?? 0) + 1,
      }));
      return;
    }

    const client = supabase;

    setIsSubmitting(true);
    setSelectedReaction(reactionId);
    saveSelectedReaction(reactionId);
    setCounts((currentCounts) => ({
      ...currentCounts,
      [reactionId]: (currentCounts[reactionId] ?? 0) + 1,
    }));

    const { data, error } = await client.rpc("submit_reaction", {
      p_reaction_id: reactionId,
      p_visitor_id: visitorId,
    });

    setIsSubmitting(false);

    if (error || !data) {
      resetReactionState();
      setSelectedReaction(null);
      setCounts((currentCounts) => ({
        ...currentCounts,
        [reactionId]: Math.max((currentCounts[reactionId] ?? 1) - 1, 0),
      }));
      if (process.env.NODE_ENV !== "production") {
        console.error("Reaction submit failed", error);
      }
      return;
    }

    setCounts(rowsToCounts(data as ReactionCountRow[]));
  }

  return (
    <div className="reaction-strip" aria-label="Reactions">
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
              disabled={Boolean(selectedReaction) || isSubmitting}
              onClick={() => handleReactionClick(reaction.id)}
              style={buttonStyle}
              type="button"
            >
              {count > 0 && (
                <span className="reaction-count" key={`${reaction.id}-${count}`}>
                  {count}
                </span>
              )}
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
