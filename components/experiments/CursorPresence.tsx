"use client";

import { useEffect, useRef, useState } from "react";

import { CursorTrailCanvas } from "@/components/experiments/CursorTrailCanvas";
import {
  RemoteCursor,
  type CursorProfile,
  type RemoteCursorState,
} from "@/components/experiments/RemoteCursor";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type CursorPayload = CursorProfile & {
  x: number;
  y: number;
};

const channelName = "portfolio-cursors";
const guestStorageKey = "rvg-cursor-presence-guest";
const inactiveAfterMs = 10_000;
const sendIntervalMs = 50;
const maxTrailPoints = 6;
const showDebugCounter = false;

const cursorProfiles = [
  { color: "#7c5cff", emoji: "🪩" },
  { color: "#0f9f8f", emoji: "🌊" },
  { color: "#d65c7a", emoji: "✨" },
  { color: "#b87900", emoji: "🍿" },
  { color: "#3f7edb", emoji: "🎮" },
  { color: "#6f8f2f", emoji: "🌿" },
];

function getGuestProfile(): CursorProfile {
  try {
    const savedProfile = window.localStorage.getItem(guestStorageKey);

    if (savedProfile) {
      return JSON.parse(savedProfile) as CursorProfile;
    }
  } catch {
    window.localStorage.removeItem(guestStorageKey);
  }

  const profile = cursorProfiles[Math.floor(Math.random() * cursorProfiles.length)];
  const guestProfile = {
    ...profile,
    id: crypto.randomUUID?.() ?? `guest-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    label: "Guest",
  };

  try {
    window.localStorage.setItem(guestStorageKey, JSON.stringify(guestProfile));
  } catch {
    return guestProfile;
  }

  return guestProfile;
}

function shouldEnableCursorPresence() {
  return (
    window.innerWidth >= 700 &&
    window.matchMedia("(pointer: fine)").matches &&
    !window.matchMedia("(hover: none)").matches
  );
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function CursorPresence() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [remoteCursors, setRemoteCursors] = useState<RemoteCursorState[]>([]);
  const profileRef = useRef<CursorProfile | null>(null);
  const cursorsRef = useRef(new Map<string, RemoteCursorState>());
  const lastSentAtRef = useRef(0);
  const isSubscribedRef = useRef(false);

  useEffect(() => {
    const updateSupport = () => {
      setIsEnabled(shouldEnableCursorPresence());
      setReduceMotion(prefersReducedMotion());
    };

    updateSupport();
    window.addEventListener("resize", updateSupport);

    return () => {
      window.removeEventListener("resize", updateSupport);
    };
  }, []);

  useEffect(() => {
    if (!isEnabled) {
      return;
    }

    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      return;
    }

    const profile = getGuestProfile();
    profileRef.current = profile;

    const channel = supabase.channel(channelName, {
      config: {
        broadcast: { self: false },
        presence: { key: profile.id },
      },
    });

    const publishCursor = (event: PointerEvent) => {
      if (!isSubscribedRef.current) {
        return;
      }

      const now = window.performance.now();

      if (now - lastSentAtRef.current < sendIntervalMs) {
        return;
      }

      lastSentAtRef.current = now;

      const payload: CursorPayload = {
        ...profile,
        x: Math.min(Math.max(event.clientX / window.innerWidth, 0), 1),
        y: Math.min(Math.max(event.clientY / window.innerHeight, 0), 1),
      };

      channel.send({
        type: "broadcast",
        event: "cursor",
        payload,
      });
    };

    const refreshVisibleCursors = () => {
      const now = Date.now();
      let didChange = false;

      cursorsRef.current.forEach((cursor, id) => {
        if (now - cursor.lastSeen > inactiveAfterMs) {
          cursorsRef.current.delete(id);
          didChange = true;
        }
      });

      setRemoteCursors(Array.from(cursorsRef.current.values()));
    };

    const inactiveInterval = window.setInterval(refreshVisibleCursors, 1000);

    channel
      .on("broadcast", { event: "cursor" }, ({ payload }) => {
        const cursor = payload as CursorPayload;

        if (!cursor?.id || cursor.id === profile.id) {
          return;
        }

        const x = cursor.x * window.innerWidth;
        const y = cursor.y * window.innerHeight;
        const previous = cursorsRef.current.get(cursor.id);
        const trail = [
          ...(previous?.trail ?? []),
          { at: Date.now(), x, y },
        ].slice(-maxTrailPoints);

        cursorsRef.current.set(cursor.id, {
          color: cursor.color,
          emoji: cursor.emoji,
          id: cursor.id,
          label: cursor.label,
          lastSeen: Date.now(),
          trail,
          x,
          y,
        });

        setRemoteCursors(Array.from(cursorsRef.current.values()));
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          isSubscribedRef.current = true;
          channel.track({
            color: profile.color,
            emoji: profile.emoji,
            id: profile.id,
            label: profile.label,
            onlineAt: new Date().toISOString(),
          });
        } else {
          isSubscribedRef.current = false;
        }
      });

    window.addEventListener("pointermove", publishCursor, { passive: true });

    return () => {
      window.clearInterval(inactiveInterval);
      window.removeEventListener("pointermove", publishCursor);
      cursorsRef.current.clear();
      isSubscribedRef.current = false;
      setRemoteCursors([]);
      supabase.removeChannel(channel);
    };
  }, [isEnabled]);

  if (!isEnabled) {
    return null;
  }

  return (
    <>
      <CursorTrailCanvas cursors={remoteCursors} disabled={reduceMotion} />
      <div className="cursor-presence-layer" aria-hidden="true">
        {remoteCursors.map((cursor) => (
          <RemoteCursor cursor={cursor} key={cursor.id} />
        ))}
      </div>
      {showDebugCounter ? (
        <div className="cursor-presence-debug">Visitors: {remoteCursors.length + 1}</div>
      ) : null}
    </>
  );
}
