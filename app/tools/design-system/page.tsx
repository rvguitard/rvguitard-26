import type { Metadata } from "next";
import { SoundLab } from "@/components/sound-lab";
import { ToolsSidebar } from "@/components/tools-sidebar";

export const metadata: Metadata = {
  title: "Design System | Rock Vincent Guitard",
  description: "UI foundations for Rock's personal tools.",
};

const colors = [
  { name: "Background", value: "oklch(100% 0 0)", className: "is-bg" },
  { name: "Foreground", value: "oklch(24% 0.018 76)", className: "is-fg" },
  { name: "Muted", value: "oklch(54% 0.026 76)", className: "is-muted" },
  { name: "Border", value: "oklch(88% 0.01 84)", className: "is-border" },
  { name: "Accent", value: "oklch(63% 0.14 252)", className: "is-accent" },
];

const transitions = [
  { name: "Modal", detail: "Scale open / close" },
  { name: "Tooltip", detail: "Fade and scale" },
  { name: "Tabs", detail: "Sliding active pill" },
  { name: "Error", detail: "Validation shake" },
  { name: "Skeleton", detail: "Load then reveal" },
  { name: "Text", detail: "State swap" },
];

export default function DesignSystemPage() {
  return (
    <main className="tools-shell">
      <ToolsSidebar activePage="design-system" />

      <section className="tools-workspace">
        <header className="tools-header">
          <div>
            <p className="tools-kicker">Tool UI Foundations</p>
            <h1>Design System</h1>
          </div>
          <button type="button">Copy tokens</button>
        </header>

        <section className="ds-hero" id="foundations">
          <div>
            <span className="tool-status">shadcn base</span>
            <h2>Quiet, sharp, reusable interface pieces for every tool.</h2>
            <p>
              Start with shadcn-style primitives: neutral surfaces, restrained borders,
              clear focus states, compact controls, and typography that stays out of the way.
            </p>
          </div>
          <div className="ds-preview-card" aria-label="Component preview">
            <div className="ds-preview-tabs">
              <button className="is-active" type="button">Overview</button>
              <button type="button">Output</button>
              <button type="button">Settings</button>
            </div>
            <label>
              Tool name
              <input defaultValue="Spritesheet Slicer" />
            </label>
            <div className="ds-preview-actions">
              <button type="button">Cancel</button>
              <button className="is-primary" type="button">Save tool</button>
            </div>
          </div>
        </section>

        <section className="ds-section">
          <div className="ds-section-heading">
            <h2>Tokens</h2>
            <p>Small set first. Expand only when a tool needs it.</p>
          </div>
          <div className="ds-color-grid">
            {colors.map((color) => (
              <article key={color.name}>
                <span className={`ds-swatch ${color.className}`} />
                <strong>{color.name}</strong>
                <code>{color.value}</code>
              </article>
            ))}
          </div>
        </section>

        <section className="ds-section" id="components">
          <div className="ds-section-heading">
            <h2>Components</h2>
            <p>Concrete primitives for tool interfaces, based on shadcn patterns.</p>
          </div>

          <div className="ds-specimen-grid">
            <article className="ds-specimen">
              <div className="ds-specimen-heading">
                <h3>Buttons</h3>
                <p>Clear actions with calm hover/focus states.</p>
              </div>
              <div className="ds-button-row">
                <button className="ds-button is-primary" type="button">Primary</button>
                <button className="ds-button is-secondary" type="button">Secondary</button>
                <button className="ds-button is-ghost" type="button">Ghost</button>
                <button className="ds-button is-danger" type="button">Danger</button>
              </div>
            </article>

            <article className="ds-specimen">
              <div className="ds-specimen-heading">
                <h3>Inputs</h3>
                <p>Compact form controls for settings-heavy tools.</p>
              </div>
              <div className="ds-input-stack">
                <label>
                  Name
                  <input className="ds-input" defaultValue="Spritesheet Slicer" />
                </label>
                <label>
                  Format
                  <select className="ds-input" defaultValue="css">
                    <option value="css">CSS keyframes</option>
                    <option value="json">JSON frames</option>
                  </select>
                </label>
                <label className="ds-checkbox-row">
                  <input type="checkbox" defaultChecked />
                  Snap frames to grid
                </label>
                <label className="ds-checkbox-row">
                  <input type="checkbox" />
                  Preserve transparent pixels
                </label>
              </div>
            </article>

            <article className="ds-specimen">
              <div className="ds-specimen-heading">
                <h3>Range Slider</h3>
                <p>Single-value controls for speed, scale, and thresholds.</p>
              </div>
              <div className="ds-input-stack">
                <label>
                  Frame speed
                  <input className="ds-range" type="range" defaultValue="64" />
                </label>
                <div className="ds-slider-meta">
                  <span>Slow</span>
                  <span>64%</span>
                  <span>Fast</span>
                </div>
              </div>
            </article>

            <article className="ds-specimen">
              <div className="ds-specimen-heading">
                <h3>Radio Group</h3>
                <p>Small option sets with clear selected state.</p>
              </div>
              <fieldset className="ds-radio-group">
                <legend>Export type</legend>
                <label>
                  <input type="radio" name="export-type" defaultChecked />
                  CSS
                </label>
                <label>
                  <input type="radio" name="export-type" />
                  JSON
                </label>
                <label>
                  <input type="radio" name="export-type" />
                  Sprite map
                </label>
              </fieldset>
            </article>

            <article className="ds-specimen">
              <div className="ds-specimen-heading">
                <h3>Toggle Buttons</h3>
                <p>Segmented controls for mode switching.</p>
              </div>
              <div className="ds-toggle-group" aria-label="Preview mode">
                <button className="is-active" type="button">Preview</button>
                <button type="button">Frames</button>
                <button type="button">Code</button>
              </div>
            </article>

            <article className="ds-specimen">
              <div className="ds-specimen-heading">
                <h3>On / Off Toggle</h3>
                <p>Binary settings with a clear thumb position and sound cue.</p>
              </div>
              <label className="ds-switch-row">
                Enable sound cues
                <span className="ds-switch">
                  <input type="checkbox" defaultChecked />
                  <span aria-hidden="true" />
                </span>
              </label>
            </article>

            <article className="ds-specimen">
              <div className="ds-specimen-heading">
                <h3>Cards</h3>
                <p>Flat, scannable containers for tool modules.</p>
              </div>
              <div className="ds-card-demo">
                <div>
                  <span className="ds-badge">WIP</span>
                  <h4>Frame Parser</h4>
                  <p>Detect sprite cells and export animation timing.</p>
                </div>
                <button className="ds-button is-secondary" type="button">Open</button>
              </div>
            </article>

            <article className="ds-specimen">
              <div className="ds-specimen-heading">
                <h3>Badges</h3>
                <p>Compact labels for status, type, and metadata.</p>
              </div>
              <div className="ds-badge-row">
                <span className="ds-badge">Default</span>
                <span className="ds-badge is-success">Live</span>
                <span className="ds-badge is-warning">WIP</span>
                <span className="ds-badge is-danger">Error</span>
              </div>
            </article>

            <article className="ds-specimen">
              <div className="ds-specimen-heading">
                <h3>Dialog</h3>
                <p>Centered confirmation surfaces for destructive or focused flows.</p>
              </div>
              <div className="ds-dialog-demo" role="presentation">
                <div className="ds-dialog-box">
                  <h4>Delete export?</h4>
                  <p>This keeps the project but removes the generated file.</p>
                  <div className="ds-preview-actions">
                    <button type="button">Cancel</button>
                    <button className="is-primary" type="button">Confirm</button>
                  </div>
                </div>
              </div>
            </article>

            <article className="ds-specimen">
              <div className="ds-specimen-heading">
                <h3>Tooltip</h3>
                <p>Short helper text for icon-only or dense controls.</p>
              </div>
              <div className="ds-tooltip-demo">
                <button className="ds-button is-secondary" type="button">Hover target</button>
                <span role="tooltip">Copy generated keyframes</span>
              </div>
            </article>

            <article className="ds-specimen">
              <div className="ds-specimen-heading">
                <h3>Typography</h3>
                <p>Inclusive Sans for labels and Geist for readable UI copy.</p>
              </div>
              <div className="ds-type-stack">
                <p className="ds-type-display">Tool workspace</p>
                <p className="ds-type-title">CSS Spritesheet Editor</p>
                <p className="ds-type-body">Upload a spritesheet, tune offsets, and export CSS keyframes.</p>
                <p className="ds-type-mono">frame-rate: 12fps</p>
              </div>
            </article>
          </div>
        </section>

        <section className="ds-section" id="motion">
          <div className="ds-section-heading">
            <h2>Motion</h2>
            <p>
              Transition patterns from{" "}
              <a href="https://github.com/Jakubantalik/transitions.dev">transitions.dev</a>{" "}
              will guide interaction polish across tools.
            </p>
          </div>

          <div className="ds-motion-grid">
            {transitions.map((transition) => (
              <article key={transition.name}>
                <span>{transition.name}</span>
                <p>{transition.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="ds-section" id="sound">
          <div className="ds-section-heading">
            <h2>Sound</h2>
            <p>Preview and tune tiny UI cues before they become site-wide interaction tokens.</p>
          </div>

          <SoundLab />
        </section>
      </section>
    </main>
  );
}
