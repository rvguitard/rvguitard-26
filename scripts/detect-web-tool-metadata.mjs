import { readFile } from "node:fs/promises";

const source = await readFile(new URL("../lib/tools/web-tools.ts", import.meta.url), "utf8");
const tools = [...source.matchAll(/name:\s*"([^"]+)"[\s\S]*?url:\s*"([^"]+)"/g)].map((match) => ({
  name: match[1],
  url: match[2],
}));

async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      "user-agent": "rvguitard-web-tools-detector/1.0",
    },
    redirect: "follow",
    signal: AbortSignal.timeout(7000),
  });

  if (!response.ok) {
    return null;
  }

  return response.text();
}

async function detectLlmsTxt(url) {
  const parsedUrl = new URL(url);
  if (parsedUrl.hostname === "github.com") {
    return null;
  }

  const origin = parsedUrl.origin;
  const candidates = [`${origin}/llms.txt`, `${origin}/llms-full.txt`];

  for (const candidate of candidates) {
    try {
      const body = await fetchText(candidate);
      if (body && body.trim().length > 20) {
        return candidate;
      }
    } catch {
      // Keep probing other candidates.
    }
  }

  return null;
}

function detectNpmCommand(html) {
  const text = html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&");

  const patterns = [
    /\bpnpm\s+dlx\s+shadcn@latest\s+(?:init|add)(?:\s+[\w@./[\]-]+)*/i,
    /\bnpx\s+shadcn@latest\s+(?:init|add)(?:\s+[\w@./[\]-]+)*/i,
    /\bnpx\s+motion-primitives@latest\s+add\s+[\w-]+/i,
    /\bnpm\s+(?:install|i)\s+[\w@./-]+/i,
    /\bpnpm\s+add\s+[\w@./-]+/i,
    /\byarn\s+add\s+[\w@./-]+/i,
    /\bbun\s+add\s+[\w@./-]+/i,
  ];

  const snippet = patterns.map((pattern) => text.match(pattern)?.[0]).find(Boolean);

  return snippet?.replace(/\s+/g, " ").trim() ?? null;
}

function detectAgentSkillCommand(html) {
  const snippets = html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .match(/\bnpx\s+skills\s+add\s+[\w./-]+/gi);

  return snippets?.[0]?.replace(/\s+/g, " ").trim() ?? null;
}

const results = [];

for (const tool of tools) {
  const metadata = {
    name: tool.name,
    url: tool.url,
    agentSkillCommand: null,
    llmsTxtUrl: null,
    terminalCommand: null,
  };

  try {
    const [llmsTxtUrl, html] = await Promise.all([detectLlmsTxt(tool.url), fetchText(tool.url)]);
    metadata.llmsTxtUrl = llmsTxtUrl;
    metadata.agentSkillCommand = html ? detectAgentSkillCommand(html) : null;
    metadata.terminalCommand = html ? detectNpmCommand(html) : null;
  } catch (error) {
    metadata.error = error instanceof Error ? error.message : String(error);
  }

  results.push(metadata);
}

console.log(JSON.stringify(results, null, 2));
