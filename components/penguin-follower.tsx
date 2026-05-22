"use client";

import { useEffect, useState } from "react";

const PENGUIN_SIZE = 64;
const VIEWPORT_PADDING = 12;
const REACTION_DURATION_MS = 900;
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

export function PenguinFollower() {
  const [y, setY] = useState(132);
  const [isReacting, setIsReacting] = useState(false);

  useEffect(() => {
    let frame = 0;
    let reactionTimeout = 0;
    const clickListenerOptions: AddEventListenerOptions = { capture: true, passive: true };

    const updateY = (clientY: number) => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const min = VIEWPORT_PADDING;
        const max = Math.max(min, window.innerHeight - PENGUIN_SIZE - VIEWPORT_PADDING);
        setY(Math.min(Math.max(clientY - PENGUIN_SIZE / 2, min), max));
      });
    };

    const handlePointerMove = (event: PointerEvent) => updateY(event.clientY);
    const handleMouseMove = (event: MouseEvent) => updateY(event.clientY);
    const handlePointerDown = () => {
      window.clearTimeout(reactionTimeout);
      setIsReacting(true);
      reactionTimeout = window.setTimeout(() => setIsReacting(false), REACTION_DURATION_MS);
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("pointerdown", handlePointerDown, clickListenerOptions);
    window.addEventListener("mousedown", handlePointerDown, clickListenerOptions);
    window.addEventListener("click", handlePointerDown, clickListenerOptions);
    document.addEventListener("pointerdown", handlePointerDown, clickListenerOptions);
    document.addEventListener("mousedown", handlePointerDown, clickListenerOptions);
    document.addEventListener("click", handlePointerDown, clickListenerOptions);

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(reactionTimeout);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("pointerdown", handlePointerDown, clickListenerOptions);
      window.removeEventListener("mousedown", handlePointerDown, clickListenerOptions);
      window.removeEventListener("click", handlePointerDown, clickListenerOptions);
      document.removeEventListener("pointerdown", handlePointerDown, clickListenerOptions);
      document.removeEventListener("mousedown", handlePointerDown, clickListenerOptions);
      document.removeEventListener("click", handlePointerDown, clickListenerOptions);
    };
  }, []);

  return (
    <div
      className="penguin-follower spritesheet-container"
      style={{ transform: `translateY(${Math.round(y)}px)` }}
      aria-hidden="true"
    >
      <div
        className={isReacting ? "penguin-animator is-reacting" : "penguin-animator"}
        style={{ backgroundImage: `url("${basePath}/assets/penguin.png")` }}
      />
    </div>
  );
}
