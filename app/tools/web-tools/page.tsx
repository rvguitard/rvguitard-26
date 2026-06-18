import type { Metadata } from "next";
import { ToolsSidebar } from "@/components/tools-sidebar";
import { WebToolsDirectory } from "@/components/web-tools-directory";
import { webTools } from "@/lib/tools/web-tools";

export const metadata: Metadata = {
  title: "Useful Tools | Rock Vincent Guitard",
  description: "A personal directory of web tools, Agent Skills, and useful references.",
};

export default function WebToolsPage() {
  return (
    <main className="tools-shell">
      <ToolsSidebar activePage="web-tools" />

      <section className="tools-workspace">
        <WebToolsDirectory tools={webTools} />
      </section>
    </main>
  );
}
