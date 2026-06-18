"use client";

import { useEffect, useRef } from "react";
import { playUiSound } from "@/lib/ui-sounds";

function shouldIgnoreSound(target: HTMLElement) {
  return Boolean(target.closest("[data-sound-ignore]"));
}

export function UiSoundLayer() {
  const lastRangeTick = useRef(0);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      const target = event.target;

      if (!(target instanceof HTMLElement) || shouldIgnoreSound(target)) {
        return;
      }

      const clickable = target.closest("button, a, [role='button']");

      if (!clickable || !(clickable instanceof HTMLElement)) {
        return;
      }

      if (clickable.getAttribute("aria-disabled") === "true" || clickable.hasAttribute("disabled")) {
        return;
      }

      void playUiSound("click");
    }

    function handleChange(event: Event) {
      const target = event.target;

      if (!(target instanceof HTMLInputElement) || shouldIgnoreSound(target)) {
        return;
      }

      if (target.type === "checkbox" || target.type === "radio") {
        void playUiSound(target.checked ? "toggleOn" : "toggleOff");
      }
    }

    function handleInput(event: Event) {
      const target = event.target;

      if (!(target instanceof HTMLInputElement) || shouldIgnoreSound(target) || target.type !== "range") {
        return;
      }

      const now = window.performance.now();

      if (now - lastRangeTick.current < 85) {
        return;
      }

      lastRangeTick.current = now;
      void playUiSound("tick");
    }

    document.addEventListener("click", handleClick, true);
    document.addEventListener("change", handleChange, true);
    document.addEventListener("input", handleInput, true);

    return () => {
      document.removeEventListener("click", handleClick, true);
      document.removeEventListener("change", handleChange, true);
      document.removeEventListener("input", handleInput, true);
    };
  }, []);

  return null;
}
