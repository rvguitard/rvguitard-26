export type WebTool = {
  name: string;
  url: string;
  description: string;
  category: string;
  format: "tool" | "article" | "reference" | "skill" | "library" | "course";
  addedAt: string;
  agentSkillCommand?: string;
  llmsTxtUrl?: string;
  terminalCommand?: string;
  xPostUrl?: string;
  previewImage?: string;
  previewVideo?: string;
};

export const webTools: WebTool[] = [
  {
    name: "Design Engineer Tools",
    url: "https://designengineer.tools/",
    description: "A quiet directory of useful tools for design engineers.",
    category: "Reference",
    format: "reference",
    addedAt: "2026-06-11",
  },
  {
    name: "shadcn/ui",
    url: "https://ui.shadcn.com/",
    description: "Composable component patterns for building clean app interfaces.",
    category: "Components",
    format: "library",
    addedAt: "2026-06-11",
    llmsTxtUrl: "https://ui.shadcn.com/llms.txt",
    terminalCommand: "pnpm dlx shadcn@latest init",
  },
  {
    name: "Motion Primitives",
    url: "https://motion-primitives.com/",
    description: "Small motion components and interaction patterns for React.",
    category: "Motion",
    format: "library",
    addedAt: "2026-06-11",
    terminalCommand: "npx motion-primitives@latest add text-effect",
  },
  {
    name: "OKLCH Color Picker",
    url: "https://oklch.com/",
    description: "A practical picker for modern perceptual color work.",
    category: "Color",
    format: "tool",
    addedAt: "2026-06-11",
  },
  {
    name: "oklch-skill",
    url: "https://www.skills.sh/jakubkrehel/oklch-skill/oklch-skill",
    description: "Agent skill for OKLCH color conversion, palettes, contrast checks, gamut handling, and Tailwind color work.",
    category: "Color",
    format: "skill",
    addedAt: "2026-06-12",
    agentSkillCommand: "npx skills add https://github.com/jakubkrehel/oklch-skill --skill oklch-skill",
  },
  {
    name: "SVGOMG",
    url: "https://jakearchibald.github.io/svgomg/",
    description: "A focused SVG optimizer for cleaning up exported vectors.",
    category: "Utility",
    format: "tool",
    addedAt: "2026-06-11",
  },
  {
    name: "Easing Wizard",
    url: "https://easingwizard.com/",
    description: "A visual playground for tuning easing curves.",
    category: "Motion",
    format: "tool",
    addedAt: "2026-06-11",
  },
  {
    name: "transitions.dev",
    url: "https://transitions.dev/",
    description: "Portable transition references for polished interface motion.",
    category: "Motion",
    format: "skill",
    addedAt: "2026-06-11",
    agentSkillCommand: "npx skills add Jakubantalik/transitions.dev",
  },
  {
    name: "Textmotion",
    url: "https://textmotion.dev/",
    description: "A focused reference for animated text patterns and motion ideas.",
    category: "Motion",
    format: "library",
    addedAt: "2026-06-12",
    terminalCommand: "npm i slot-text",
  },
  {
    name: "Building Glass for the Web",
    url: "https://aave.com/design/building-glass-for-the-web",
    description: "Aave's deep dive on building cross-browser glass and refraction effects for real web interfaces.",
    category: "Design Engineering",
    format: "article",
    addedAt: "2026-06-12",
  },
  {
    name: "SVG Pattern Generator",
    url: "https://nucleoapp.com/svg-patterns/",
    description: "Create and customize seamless SVG patterns, then copy production-ready SVG for web interfaces.",
    category: "Utility",
    format: "tool",
    addedAt: "2026-06-12",
  },
  {
    name: "Fragments",
    url: "https://www.fragments.supply/",
    description: "A shader course for design engineers and creative coders, covering Three.js, TSL, shader patterns, utilities, and breakdowns.",
    category: "Shaders",
    format: "course",
    addedAt: "2026-06-12",
  },
  {
    name: "Shader Lab",
    url: "https://eng.basement.studio/tools/shader-lab",
    description: "Basement Studio's interactive shader lab for composing CRT, dithering, text, pattern, and gradient effects.",
    category: "Shaders",
    format: "tool",
    addedAt: "2026-06-12",
  },
];

export function getFaviconUrl(url: string) {
  return `https://www.google.com/s2/favicons?domain_url=${encodeURIComponent(url)}&sz=32`;
}

export function groupWebToolsByCategory(tools: WebTool[]) {
  return tools.reduce<Record<string, WebTool[]>>((groups, tool) => {
    groups[tool.category] = [...(groups[tool.category] ?? []), tool];
    return groups;
  }, {});
}

export function getWebToolsByCategory() {
  return groupWebToolsByCategory(webTools);
}
