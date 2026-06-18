"use client";

import Link from "next/link";
import { RLogoMark } from "@/components/r-logo-mark";

type ToolsSidebarProps = {
  activePage: "tools" | "design-system" | "keyframe-slicer" | "web-tools";
};

export function ToolsSidebar({ activePage }: ToolsSidebarProps) {
  void activePage;

  return (
    <header className="tools-sidebar is-logo-only" aria-label="Tools navigation">
      <div className="tools-sidebar-top">
        <Link className="tools-back-link" href="/" title="Home">
          <RLogoMark className="tools-back-logo" gradientId="tools-back-logo-gradient" />
          <span className="sr-only">Home</span>
        </Link>
      </div>
    </header>
  );
}
