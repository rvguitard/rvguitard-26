"use client";

import { useEffect, useRef } from "react";

import type { RemoteCursorState } from "@/components/experiments/RemoteCursor";

type CursorTrailCanvasProps = {
  cursors: RemoteCursorState[];
  disabled?: boolean;
};

function hexToRgb(color: string) {
  const hex = color.replace("#", "");
  const value = Number.parseInt(hex.length === 3 ? hex.replace(/(.)/g, "$1$1") : hex, 16);

  return {
    blue: value & 255,
    green: (value >> 8) & 255,
    red: (value >> 16) & 255,
  };
}

export function CursorTrailCanvas({ cursors, disabled = false }: CursorTrailCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cursorsRef = useRef(cursors);

  useEffect(() => {
    cursorsRef.current = cursors;
  }, [cursors]);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas || disabled) {
      return;
    }

    const context = canvas.getContext("2d");

    if (!context) {
      return;
    }

    let animationFrame = 0;

    const resize = () => {
      const ratio = window.devicePixelRatio || 1;

      canvas.width = window.innerWidth * ratio;
      canvas.height = window.innerHeight * ratio;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const draw = () => {
      context.clearRect(0, 0, window.innerWidth, window.innerHeight);

      cursorsRef.current.forEach((cursor) => {
        const points = cursor.trail;

        if (points.length < 2) {
          return;
        }

        const rgb = hexToRgb(cursor.color);

        for (let index = 1; index < points.length; index += 1) {
          const previous = points[index - 1];
          const current = points[index];
          const alpha = (index / points.length) * 0.12;

          context.strokeStyle = `rgba(${rgb.red}, ${rgb.green}, ${rgb.blue}, ${alpha})`;
          context.lineWidth = 0.75 + (index / points.length) * 0.85;
          context.lineCap = "round";
          context.beginPath();
          context.moveTo(previous.x, previous.y);
          context.lineTo(current.x, current.y);
          context.stroke();
        }
      });

      animationFrame = window.requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    animationFrame = window.requestAnimationFrame(draw);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);
    };
  }, [disabled]);

  if (disabled) {
    return null;
  }

  return <canvas ref={canvasRef} className="cursor-trail-canvas" aria-hidden="true" />;
}
