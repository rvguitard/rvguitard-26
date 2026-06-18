import type { Metadata } from "next";
import Link from "next/link";
import { ToolsSidebar } from "@/components/tools-sidebar";

export const metadata: Metadata = {
  title: "Tools | Rock Vincent Guitard",
  description: "Personal tool workspace for experiments and utilities.",
};

const tools = [
  {
    name: "CSS Spritesheet Editor",
    href: "/tools/keyframe-slicer",
    status: "WIP",
    type: "Animation",
    description: "Slice spritesheets into precise CSS keyframes.",
  },
  {
    name: "Prompt Counter",
    href: null,
    status: "Live",
    type: "Site utility",
    description: "Track build prompts and publish count updates.",
  },
  {
    name: "Realtime Cursor Presence",
    href: null,
    status: "Experiment",
    type: "Supabase",
    description: "Show subtle visitor cursors across the portfolio.",
  },
  {
    name: "Useful Tools Directory",
    href: "/tools/web-tools",
    status: "WIP",
    type: "Reference",
    description: "Collect web tools, Agent Skills, and posts worth revisiting.",
  },
];

const activity = [
  "Added video modal previews",
  "Tuned mobile reaction scrolling",
  "Cleaned realtime cursor presence",
  "Connected recently played Spotify data",
];

export default function ToolsPage() {
  return (
    <main className="tools-shell">
      <ToolsSidebar activePage="tools" />

      <section className="tools-workspace">
        <header className="tools-header">
          <div>
            <p className="tools-kicker">Personal UI</p>
            <h1>Tools</h1>
          </div>
          <button type="button">New tool</button>
        </header>

        <section className="tools-summary" aria-label="Tool summary">
          <article>
            <span>Active</span>
            <strong>3</strong>
          </article>
          <article>
            <span>Live</span>
            <strong>1</strong>
          </article>
          <article>
            <span>Experiments</span>
            <strong>2</strong>
          </article>
        </section>

        <section className="tools-grid" id="tools">
          <div className="tools-list" aria-label="Tool list">
            {tools.map((tool) => (
              <article className="tool-row" key={tool.name}>
                <div>
                  <span className="tool-status">{tool.status}</span>
                  <h2>
                    {tool.href ? <Link href={tool.href}>{tool.name}</Link> : tool.name}
                  </h2>
                  <p>{tool.description}</p>
                </div>
                <span>{tool.type}</span>
              </article>
            ))}
          </div>

          <aside className="tool-preview" aria-label="Selected tool preview">
            <div className="tool-preview-window">
              <div className="tool-preview-bar">
                <span />
                <span />
                <span />
              </div>
              <div className="tool-preview-body">
                <p>CSS Spritesheet Editor</p>
                <div className="tool-preview-strip">
                  {Array.from({ length: 8 }, (_, index) => (
                    <span key={index} />
                  ))}
                </div>
                <Link className="tool-preview-link" href="/tools/keyframe-slicer">Open workspace</Link>
              </div>
            </div>
          </aside>
        </section>

        <section className="tools-activity" id="activity">
          <h2>Recent activity</h2>
          <ul>
            {activity.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

      </section>
    </main>
  );
}
