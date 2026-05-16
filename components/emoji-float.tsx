"use client";

import { useEffect, useRef, useState } from "react";

type Floatie = {
  emoji: string;
  color: string;
  radius: number;
  x: number;
  y: number;
  baseX: number;
  speed: number;
  angle: number;
  wobbleSpeed: number;
  wobbleRange: number;
};

type Particle = {
  x: number;
  y: number;
  color: string;
  size: number;
  speedX: number;
  speedY: number;
  life: number;
  decay: number;
};

const FLOATIES = [
  { emoji: "🐶", color: "rgba(244, 226, 222, 0.78)", x: 0.25, y: 0.16, radius: 36 },
  { emoji: "✈️", color: "rgba(226, 245, 255, 0.86)", x: 0.72, y: 0.12, radius: 29 },
  { emoji: "🏸", color: "rgba(248, 246, 228, 0.8)", x: 0.54, y: 0.42, radius: 28 },
  { emoji: "🐰", color: "rgba(226, 247, 229, 0.82)", x: 0.82, y: 0.38, radius: 30 },
  { emoji: "🥋", color: "rgba(226, 249, 246, 0.8)", x: 0.18, y: 0.64, radius: 27 },
  { emoji: "🍿", color: "rgba(226, 240, 255, 0.84)", x: 0.39, y: 0.79, radius: 40 },
  { emoji: "🌧", color: "rgba(241, 230, 252, 0.82)", x: 0.72, y: 0.8, radius: 24 },
  { emoji: "🥊", color: "rgba(237, 228, 244, 0.85)", x: 0.99, y: 0.63, radius: 28 },
  { emoji: "🕺", color: "rgba(228, 244, 231, 0.85)", x: 0.05, y: 0.3, radius: 28 },
  { emoji: "🎮", color: "rgba(230, 228, 244, 0.85)", x: 0.16, y: 0.5, radius: 28 },
];

function createFloaties(width: number, height: number): Floatie[] {
  return FLOATIES.map((item, index) => ({
    ...item,
    x: item.x * width,
    y: item.y * height,
    baseX: item.x * width,
    speed: 0.1 + index * 0.008,
    angle: index * 0.9,
    wobbleSpeed: 0.008 + index * 0.0008,
    wobbleRange: 0.18 + (index % 3) * 0.08,
  }));
}

function createParticles(floatie: Floatie): Particle[] {
  return Array.from({ length: 12 }, (_, index) => {
    const angle = (Math.PI * 2 * index) / 12;
    const push = 2.2 + (index % 4) * 0.45;

    return {
      x: floatie.x,
      y: floatie.y,
      color: floatie.color,
      size: 2.2 + (index % 3),
      speedX: Math.cos(angle) * push,
      speedY: Math.sin(angle) * push,
      life: 1,
      decay: 0.022 + (index % 3) * 0.004,
    };
  });
}

export function EmojiFloat({ initialCount = 0 }: { initialCount?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fieldRef = useRef<HTMLDivElement>(null);
  const floatiesRef = useRef<Floatie[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number | null>(null);
  const [count, setCount] = useState(initialCount);

  useEffect(() => {
    const canvas = canvasRef.current;
    const field = fieldRef.current;

    if (!canvas || !field) {
      return;
    }

    const context = canvas.getContext("2d");

    if (!context) {
      return;
    }

    const resize = () => {
      const rect = field.getBoundingClientRect();
      const ratio = window.devicePixelRatio || 1;

      canvas.width = rect.width * ratio;
      canvas.height = rect.height * ratio;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      floatiesRef.current = createFloaties(rect.width, rect.height);
      particlesRef.current = [];
    };

    const popFloatie = (floatie: Floatie) => {
      particlesRef.current.push(...createParticles(floatie));
      floatie.y = field.clientHeight + floatie.radius;
      floatie.x = floatie.baseX;
      setCount((current) => current + 1);
    };

    const handlePointerDown = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const pointerX = event.clientX - rect.left;
      const pointerY = event.clientY - rect.top;

      floatiesRef.current.forEach((floatie) => {
        const distance = Math.hypot(pointerX - floatie.x, pointerY - floatie.y);

        if (distance <= floatie.radius) {
          popFloatie(floatie);
        }
      });
    };

    const draw = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;

      context.clearRect(0, 0, width, height);

      particlesRef.current = particlesRef.current.filter((particle) => {
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        particle.life -= particle.decay;

        if (particle.life <= 0) {
          return false;
        }

        context.save();
        context.globalAlpha = particle.life;
        context.fillStyle = particle.color;
        context.beginPath();
        context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        context.fill();
        context.restore();

        return true;
      });

      floatiesRef.current.forEach((floatie) => {
        floatie.y -= floatie.speed;
        floatie.angle += floatie.wobbleSpeed;
        floatie.x = floatie.baseX + Math.sin(floatie.angle) * floatie.radius * floatie.wobbleRange;

        if (floatie.y < -floatie.radius) {
          floatie.y = height + floatie.radius;
        }

        context.save();
        context.fillStyle = floatie.color;
        context.beginPath();
        context.arc(floatie.x, floatie.y, floatie.radius, 0, Math.PI * 2);
        context.fill();
        context.font = `${floatie.radius * 0.78}px serif`;
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillText(floatie.emoji, floatie.x, floatie.y + floatie.radius * 0.04);
        context.restore();
      });

      animationRef.current = requestAnimationFrame(draw);
    };

    resize();
    canvas.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("resize", resize);
    animationRef.current = requestAnimationFrame(draw);

    return () => {
      canvas.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("resize", resize);

      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div ref={fieldRef} className="emoji-field" aria-label="My life in emojis">
      <canvas ref={canvasRef} className="emoji-canvas" />
      <h2>My life in emojis</h2>
      <span className="boxing-score">{count}</span>
    </div>
  );
}
