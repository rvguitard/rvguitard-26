"use client";

import { useMemo } from "react";
import type { CSSProperties } from "react";

const letterPatterns: Record<string, string[]> = {
  W: [
    "1100011",
    "1100011",
    "1100011",
    "1101011",
    "1101011",
    "1111111",
    "0111110",
  ],
  O: [
    "0111110",
    "1100011",
    "1100011",
    "1100011",
    "1100011",
    "1100011",
    "0111110",
  ],
  R: [
    "1111100",
    "1100110",
    "1100110",
    "1111100",
    "1101100",
    "1100110",
    "1100011",
  ],
  K: [
    "1100110",
    "1101100",
    "1111000",
    "1110000",
    "1111000",
    "1101100",
    "1100110",
  ],
};

function LedLetter({ character, offset }: { character: string; offset: number }) {
  const pattern = letterPatterns[character.toUpperCase()] ?? [];
  const shimmerSpeeds = useMemo(
    () => Array.from({ length: 49 }, (_, index) => `${(0.9 + ((index + offset) % 11) * 0.12).toFixed(2)}s`),
    [offset],
  );

  return (
    <span className="led-letter" aria-hidden="true">
      {pattern.flatMap((row) => row.split("")).map((active, index) => (
        <span
          className={`led-dot${active === "1" ? " active" : ""}`}
          key={index}
          style={{ "--shimmer-speed": shimmerSpeeds[index] } as CSSProperties}
        />
      ))}
    </span>
  );
}

export function LedWord({ text }: { text: string }) {
  return (
    <div className="led-word" aria-label={text}>
      {Array.from(text).map((character, index) => (
        <LedLetter character={character} key={`${character}-${index}`} offset={index * 7} />
      ))}
    </div>
  );
}
