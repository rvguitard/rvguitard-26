"use client";

export type CursorProfile = {
  color: string;
  emoji: string;
  id: string;
  label: string;
};

export type CursorPoint = {
  at: number;
  x: number;
  y: number;
};

export type RemoteCursorState = CursorProfile & {
  lastSeen: number;
  trail: CursorPoint[];
  x: number;
  y: number;
};

type RemoteCursorProps = {
  cursor: RemoteCursorState;
};

export function RemoteCursor({ cursor }: RemoteCursorProps) {
  const isFading = Date.now() - cursor.lastSeen > 7000;

  return (
    <div
      className="remote-cursor"
      style={{
        "--cursor-color": cursor.color,
        opacity: isFading ? 0.22 : 0.92,
        transform: `translate3d(${cursor.x}px, ${cursor.y}px, 0)`,
      } as React.CSSProperties}
    >
      <span className="remote-cursor-pointer" />
      <span className="remote-cursor-badge">
        <span aria-hidden="true">{cursor.emoji}</span>
        <span>{cursor.label}</span>
      </span>
    </div>
  );
}
