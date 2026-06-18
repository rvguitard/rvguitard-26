"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { useEffect, useState } from "react";

type ShellVariant = {
  id: "shimmer" | "wipe" | "cascade" | "logo" | "blur";
  label: string;
  description: string;
};

const shellVariants: ShellVariant[] = [
  {
    id: "shimmer",
    label: "Soft shimmer",
    description: "A calm skeleton pass that resolves into the portfolio frame.",
  },
  {
    id: "wipe",
    label: "Section wipe",
    description: "Rows reveal top-to-bottom like the page is being assembled.",
  },
  {
    id: "cascade",
    label: "Tile cascade",
    description: "Content blocks settle in with a staggered grid rhythm.",
  },
  {
    id: "logo",
    label: "R pulse",
    description: "A tiny branded loader before the shell appears.",
  },
  {
    id: "blur",
    label: "Progressive blur",
    description: "The whole shell sharpens in layered passes.",
  },
];

export function LoadingStateLab() {
  return (
    <main className="loading-lab">
      <header className="loading-lab-header">
        <div>
          <Link href="/" className="loading-lab-back">
            Home
          </Link>
          <p>Prototype</p>
          <h1>Portfolio shell loading states</h1>
        </div>
      </header>

      <section className="loading-lab-grid" aria-label="Portfolio shell loading state prototypes">
        {shellVariants.map((variant, index) => (
          <ShellLoadingCard key={variant.id} index={index} variant={variant} />
        ))}
      </section>
    </main>
  );
}

function ShellLoadingCard({ index, variant }: { index: number; variant: ShellVariant }) {
  const [phase, setPhase] = useState<"loading" | "revealed">("loading");
  const [replayKey, setReplayKey] = useState(0);

  useEffect(() => {
    setPhase("loading");
    const timer = window.setTimeout(() => setPhase("revealed"), 1800);

    return () => window.clearTimeout(timer);
  }, [replayKey]);

  return (
    <article
      className={`loading-prototype loading-prototype-shell loading-shell-${variant.id} is-${phase}`}
      style={{ "--loading-index": index } as CSSProperties}
    >
      <div className="loading-prototype-meta">
        <span>{String(index + 1).padStart(2, "0")}</span>
        <div>
          <h2>{variant.label}</h2>
          <p>{variant.description}</p>
        </div>
        <button type="button" onClick={() => setReplayKey((current) => current + 1)}>
          Replay
        </button>
      </div>

      <PortfolioShellPreview key={`${variant.id}-${replayKey}`} variant={variant.id} />
    </article>
  );
}

function PortfolioShellPreview({ variant }: { variant: ShellVariant["id"] }) {
  return (
    <div className={`loading-shell-preview loading-shell-preview-${variant}`}>
      {variant === "logo" ? (
        <div className="loading-r-mark" aria-hidden="true">
          R
        </div>
      ) : null}
      <div className="loading-shell-clock" />
      <div className="loading-shell-intro">
        <span />
        <span />
      </div>
      <div className="loading-shell-band" />
      <div className="loading-shell-panels">
        <span />
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}
