"use client";

import { useMemo, useState } from "react";
import type { CSSProperties } from "react";
import type { WebTool } from "@/lib/tools/web-tools";
import { getFaviconUrl, groupWebToolsByCategory } from "@/lib/tools/web-tools";

type WebToolsDirectoryProps = {
  tools: WebTool[];
};

type ToolFilter = "all" | "with-skill";
type ToolSort = "category" | "az" | "newest";

const filters: Array<{ label: string; value: ToolFilter }> = [
  { label: "All", value: "all" },
  { label: "AI-ready", value: "with-skill" },
];

const sorts: Array<{ label: string; value: ToolSort }> = [
  { label: "Category", value: "category" },
  { label: "A-Z", value: "az" },
  { label: "Newest", value: "newest" },
];

function CommandIcon({ copied }: { copied: boolean }) {
  return (
    <span className="web-tool-command-icons" aria-hidden="true">
      <svg className="web-tool-command-icon is-idle" viewBox="0 0 16 16">
        <path d="M8 1.8 9.3 6.4 14 8l-4.7 1.6L8 14.2 6.7 9.6 2 8l4.7-1.6L8 1.8Z" />
      </svg>
      <svg className="web-tool-command-icon is-hover" viewBox="0 0 16 16">
        <path d="M5 2.5h6v1.4H5V2.5ZM3.5 4h9v9.5h-9V4Zm1.5 1.5V12h6V5.5H5Z" />
      </svg>
      <svg className={`web-tool-command-icon is-copied${copied ? " is-visible" : ""}`} viewBox="0 0 16 16">
        <path d="M6.7 10.8 3.8 7.9 2.5 9.2l4.2 4.2 7-8.3-1.4-1.1-5.6 6.8Z" />
      </svg>
    </span>
  );
}

function toCategorySlug(category: string) {
  return category.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function WebToolsDirectory({ tools }: WebToolsDirectoryProps) {
  const [filter, setFilter] = useState<ToolFilter>("all");
  const [sort, setSort] = useState<ToolSort>("category");
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);

  const visibleTools = useMemo(() => {
    const filteredTools = filter === "all" ? tools : tools.filter((tool) => Boolean(tool.agentSkillCommand || tool.llmsTxtUrl));

    return [...filteredTools].sort((first, second) => {
      if (sort === "az") {
        return first.name.localeCompare(second.name);
      }

      if (sort === "newest") {
        return second.addedAt.localeCompare(first.addedAt);
      }

      return first.category.localeCompare(second.category) || first.name.localeCompare(second.name);
    });
  }, [filter, sort, tools]);

  const webToolsByCategory = groupWebToolsByCategory(visibleTools);

  function copyWithTextarea(text: string) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.setAttribute("readonly", "");
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    textArea.style.top = "0";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const didCopy = document.execCommand("copy");
    textArea.remove();

    if (!didCopy) {
      throw new Error("Fallback copy command failed.");
    }
  }

  async function copyCommand(command: string) {
    try {
      if (navigator.clipboard?.writeText) {
        try {
          await navigator.clipboard.writeText(command);
        } catch {
          copyWithTextarea(command);
        }
      } else {
        copyWithTextarea(command);
      }

      setCopiedCommand(command);
      window.setTimeout(() => setCopiedCommand(null), 1200);
    } catch (error) {
      console.error("Copy failed", error);
      setCopiedCommand(null);
    }
  }

  return (
    <section className="web-tools-directory" id="web-tools">
      <header className="web-tools-heading">
        <div>
          <p className="tools-kicker">Found on the web</p>
          <h1>Useful tools</h1>
        </div>
        <p>References, utilities, and interface tools I want close by.</p>
      </header>

      <div className="web-tools-controls" aria-label="Directory controls">
        <div aria-label="Filter tools" className="web-tools-control-group">
          {filters.map((item) => (
            <button className={filter === item.value ? "is-active" : ""} key={item.value} onClick={() => setFilter(item.value)} type="button">
              {item.label}
            </button>
          ))}
        </div>
        <div aria-label="Sort tools" className="web-tools-control-group">
          {sorts.map((item) => (
            <button className={sort === item.value ? "is-active" : ""} key={item.value} onClick={() => setSort(item.value)} type="button">
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="web-tools-sections" key={`${filter}-${sort}`}>
        {Object.entries(webToolsByCategory).map(([category, categoryTools], categoryIndex) => (
          <section className="web-tools-section" data-category={toCategorySlug(category)} key={category} style={{ "--web-tool-index": categoryIndex } as CSSProperties}>
            <h2>{category}</h2>
            <div className="web-tools-list">
              {categoryTools.map((tool, toolIndex) => (
                <div className="web-tool-item" key={tool.url} style={{ "--web-tool-index": toolIndex } as CSSProperties}>
                  <a className="web-tool-link" data-description={tool.description} href={tool.url} rel="noreferrer" target="_blank">
                    <img alt="" height="16" src={getFaviconUrl(tool.url)} width="16" />
                    <span>{tool.name}</span>
                    <span className="web-tool-format">{tool.format}</span>
                  </a>
                  {tool.agentSkillCommand ? (
                    <button
                      className={`web-tool-skill-link${copiedCommand === tool.agentSkillCommand ? " is-copied" : ""}`}
                      onClick={() => void copyCommand(tool.agentSkillCommand ?? "")}
                      title={tool.agentSkillCommand}
                      type="button"
                    >
                      <CommandIcon copied={copiedCommand === tool.agentSkillCommand} />
                      <span className="sr-only">{copiedCommand === tool.agentSkillCommand ? "Copied" : `Copy Agent Skill command for ${tool.name}`}</span>
                    </button>
                  ) : null}
                  {tool.terminalCommand ? (
                    <button
                      className={`web-tool-skill-link${copiedCommand === tool.terminalCommand ? " is-copied" : ""}`}
                      onClick={() => void copyCommand(tool.terminalCommand ?? "")}
                      title={tool.terminalCommand}
                      type="button"
                    >
                      <CommandIcon copied={copiedCommand === tool.terminalCommand} />
                      <span className="sr-only">{copiedCommand === tool.terminalCommand ? "Copied" : `Copy terminal command for ${tool.name}`}</span>
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </section>
  );
}
