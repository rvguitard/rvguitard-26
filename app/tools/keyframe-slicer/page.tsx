import type { Metadata } from "next";
import { KeyframeSlicerTool } from "@/components/keyframe-slicer-tool";
import { ToolsSidebar } from "@/components/tools-sidebar";

export const metadata: Metadata = {
  title: "CSS Spritesheet Editor | Rock Vincent Guitard",
  description: "Slice spritesheets into CSS keyframe animations.",
};

export default function KeyframeSlicerPage() {
  return (
    <main className="tools-shell">
      <ToolsSidebar activePage="keyframe-slicer" />

      <section className="tools-workspace slicer-workspace">
        <header className="tools-header">
          <div>
            <p className="tools-kicker">Animation Tool</p>
            <h1>CSS Spritesheet Editor</h1>
          </div>
        </header>

        <KeyframeSlicerTool />
      </section>
    </main>
  );
}
