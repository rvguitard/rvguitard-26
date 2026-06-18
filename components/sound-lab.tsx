"use client";

import { useMemo, useState } from "react";
import { defaultSoundControls, playUiSound, type SoundControls, type UiSound } from "@/lib/ui-sounds";

type SoundPreset = {
  id: UiSound;
  name: string;
  description: string;
};

const soundPresets: SoundPreset[] = [
  { id: "click", name: "Click", description: "Short, tactile confirmation." },
  { id: "toggleOn", name: "Toggle on", description: "Small rising two-note cue." },
  { id: "toggleOff", name: "Toggle off", description: "Small falling two-note cue." },
  { id: "modalOpen", name: "Modal open", description: "Soft upward sweep." },
  { id: "modalClose", name: "Modal close", description: "Soft downward sweep." },
  { id: "success", name: "Success", description: "Warm ascending chord." },
  { id: "error", name: "Error", description: "Muted, low warning cue." },
  { id: "whoosh", name: "Whoosh", description: "Quiet motion transition." },
];

export function SoundLab() {
  const [selectedSound, setSelectedSound] = useState<UiSound>("click");
  const [controls, setControls] = useState<SoundControls>(defaultSoundControls);

  const selectedPreset = useMemo(
    () => soundPresets.find((preset) => preset.id === selectedSound) ?? soundPresets[0],
    [selectedSound],
  );

  function updateControl(key: keyof SoundControls, value: number) {
    setControls((current) => ({ ...current, [key]: value }));
  }

  function previewSound(kind = selectedSound) {
    void playUiSound(kind, controls);
  }

  return (
    <div className="ds-sound-lab" data-sound-ignore>
      <div className="ds-sound-list" aria-label="Sound presets">
        {soundPresets.map((preset) => (
          <button
            className={preset.id === selectedSound ? "is-active" : ""}
            key={preset.id}
            onClick={() => {
              setSelectedSound(preset.id);
              void previewSound(preset.id);
            }}
            type="button"
          >
            <span>{preset.name}</span>
            <small>{preset.description}</small>
          </button>
        ))}
      </div>

      <div className="ds-sound-controls">
        <div>
          <span className="tool-status">testing</span>
          <h3>{selectedPreset.name}</h3>
          <p>{selectedPreset.description}</p>
        </div>

        <label>
          Volume
          <input
            className="ds-range"
            max="60"
            min="0"
            onChange={(event) => updateControl("volume", Number(event.target.value))}
            type="range"
            value={controls.volume}
          />
          <span>{controls.volume}%</span>
        </label>

        <label>
          Pitch
          <input
            className="ds-range"
            max="12"
            min="-12"
            onChange={(event) => updateControl("pitch", Number(event.target.value))}
            type="range"
            value={controls.pitch}
          />
          <span>{controls.pitch > 0 ? `+${controls.pitch}` : controls.pitch} st</span>
        </label>

        <label>
          Duration
          <input
            className="ds-range"
            max="180"
            min="60"
            onChange={(event) => updateControl("duration", Number(event.target.value))}
            type="range"
            value={controls.duration}
          />
          <span>{controls.duration}%</span>
        </label>

        <div className="ds-sound-actions">
          <button className="ds-button is-secondary" onClick={() => setControls(defaultSoundControls)} type="button">
            Reset
          </button>
          <button className="ds-button is-primary" onClick={() => previewSound()} type="button">
            Preview sound
          </button>
        </div>
      </div>
    </div>
  );
}
