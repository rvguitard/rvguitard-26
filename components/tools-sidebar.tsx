"use client";

import Link from "next/link";
import { RLogoMark } from "@/components/r-logo-mark";

type ToolsSidebarProps = {
  activePage: "tools" | "design-system" | "keyframe-slicer" | "web-tools";
};

const pageLinks = [
  { href: "/tools", label: "All Tools", page: "tools", description: "Browse the tool workspace." },
  { href: "/tools/keyframe-slicer", label: "CSS Spritesheet Editor", page: "keyframe-slicer", description: "Build CSS keyframes from sprite maps." },
  { href: "/tools/web-tools", label: "Useful Tools", page: "web-tools", description: "Collect web tools and saved references." },
] as const;

export function ToolsSidebar({ activePage }: ToolsSidebarProps) {
  return (
    <header className="tools-sidebar" aria-label="Tools navigation">
      <div className="tools-sidebar-top">
        <Link className="tools-back-link" href="/" title="Home">
          <RLogoMark className="tools-back-logo" gradientId="tools-back-logo-gradient" />
          <span className="sr-only">Home</span>
        </Link>
      </div>

      <nav className="tools-nav">
        <div className={`tools-nav-menu${activePage === "tools" || activePage === "keyframe-slicer" || activePage === "web-tools" ? " is-active" : ""}`}>
          <button aria-haspopup="true" type="button">
            Tools
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="m4 6 4 4 4-4" />
            </svg>
          </button>
          <div className="tools-nav-dropdown">
            {pageLinks.map((link) => (
              <Link className={link.page === activePage ? "is-active" : ""} href={link.href} key={link.href}>
                <span>{link.label}</span>
                <small>{link.description}</small>
              </Link>
            ))}
          </div>
        </div>
        <Link className={activePage === "design-system" ? "is-active" : ""} href="/tools/design-system">
          Design System
        </Link>
      </nav>
    </header>
  );
}
