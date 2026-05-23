"use client";

import { useEffect, useRef, useState } from "react";

const PENGUIN_SIZE = 64;
const VIEWPORT_PADDING = 12;
const REACTION_DURATION_MS = 900;
const FOLLOW_EASE = 0.08;
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
type ReactionFrame = "page" | "uno" | null;

export function PenguinFollower() {
  const [y, setY] = useState(132);
  const [reactionFrame, setReactionFrame] = useState<ReactionFrame>(null);
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const followerRef = useRef<HTMLDivElement>(null);
  const currentYRef = useRef(132);
  const targetYRef = useRef(132);
  const reactionTimeoutRef = useRef(0);

  const triggerPenguinReaction = (frame: Exclude<ReactionFrame, null>) => {
    window.clearTimeout(reactionTimeoutRef.current);
    setReactionFrame(frame);
    reactionTimeoutRef.current = window.setTimeout(() => setReactionFrame(null), REACTION_DURATION_MS);
  };

  useEffect(() => {
    let animationFrame = 0;
    const clickListenerOptions: AddEventListenerOptions = { capture: true, passive: true };

    const clampY = (clientY: number) => {
      const min = VIEWPORT_PADDING;
      const max = Math.max(min, window.innerHeight - PENGUIN_SIZE - VIEWPORT_PADDING);
      return Math.min(Math.max(clientY - PENGUIN_SIZE / 2, min), max);
    };

    const updateTargetY = (clientY: number) => {
      targetYRef.current = clampY(clientY);
    };

    const followTarget = () => {
      const nextY = currentYRef.current + (targetYRef.current - currentYRef.current) * FOLLOW_EASE;
      currentYRef.current = Math.abs(nextY - targetYRef.current) < 0.1 ? targetYRef.current : nextY;
      setY(currentYRef.current);
      animationFrame = window.requestAnimationFrame(followTarget);
    };

    const updateTooltip = (clientX: number, clientY: number) => {
      const rect = followerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const hoverPadding = 12;
      setIsTooltipVisible(
        clientX >= rect.left - hoverPadding &&
          clientX <= rect.right + hoverPadding &&
          clientY >= rect.top - hoverPadding &&
          clientY <= rect.bottom + hoverPadding,
      );
    };

    const handlePointerMove = (event: PointerEvent) => {
      updateTargetY(event.clientY);
      updateTooltip(event.clientX, event.clientY);
    };
    const handleMouseMove = (event: MouseEvent) => {
      updateTargetY(event.clientY);
      updateTooltip(event.clientX, event.clientY);
    };
    const handleDocumentPointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && followerRef.current?.contains(event.target)) return;
      triggerPenguinReaction("page");
    };
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("pointerdown", handleDocumentPointerDown, clickListenerOptions);
    animationFrame = window.requestAnimationFrame(followTarget);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.clearTimeout(reactionTimeoutRef.current);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("pointerdown", handleDocumentPointerDown, clickListenerOptions);
    };
  }, []);

  const handlePenguinPointerDown = () => {
    triggerPenguinReaction("uno");
  };

  const reactionClass = reactionFrame ? ` is-reacting-${reactionFrame}` : "";

  return (
    <div
      ref={followerRef}
      className={isTooltipVisible ? "penguin-follower is-tooltip-visible" : "penguin-follower"}
      data-tooltip="Hi I'm Rock's Codex pet, Uno"
      style={{ transform: `translateY(${Math.round(y)}px)` }}
      onPointerDown={handlePenguinPointerDown}
      onPointerEnter={() => setIsTooltipVisible(true)}
      onPointerLeave={() => setIsTooltipVisible(false)}
      onMouseEnter={() => setIsTooltipVisible(true)}
      onMouseLeave={() => setIsTooltipVisible(false)}
      aria-hidden="true"
    >
      <div
        className={`penguin-animator${reactionClass}`}
        style={{ backgroundImage: `url("${basePath}/assets/penguin.png")` }}
      />
    </div>
  );
}
