"use client";

export type UiSound =
  | "click"
  | "tick"
  | "toggleOn"
  | "toggleOff"
  | "modalOpen"
  | "modalClose"
  | "success"
  | "error"
  | "whoosh";

export type SoundControls = {
  volume: number;
  pitch: number;
  duration: number;
};

export const defaultSoundControls: SoundControls = {
  volume: 24,
  pitch: 0,
  duration: 100,
};

let audioContext: AudioContext | null = null;

function getAudioContext() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  audioContext ??= new AudioContextClass();
  return audioContext;
}

function playTone(
  context: AudioContext,
  destination: AudioNode,
  startTime: number,
  frequency: number,
  duration: number,
  gain: number,
  type: OscillatorType = "sine",
) {
  const oscillator = context.createOscillator();
  const envelope = context.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, startTime);
  envelope.gain.setValueAtTime(0.0001, startTime);
  envelope.gain.exponentialRampToValueAtTime(gain, startTime + 0.008);
  envelope.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  oscillator.connect(envelope);
  envelope.connect(destination);
  oscillator.start(startTime);
  oscillator.stop(startTime + duration + 0.02);
}

function playSweep(
  context: AudioContext,
  destination: AudioNode,
  startTime: number,
  fromFrequency: number,
  toFrequency: number,
  duration: number,
  gain: number,
  type: OscillatorType = "sine",
) {
  const oscillator = context.createOscillator();
  const envelope = context.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(fromFrequency, startTime);
  oscillator.frequency.exponentialRampToValueAtTime(toFrequency, startTime + duration);
  envelope.gain.setValueAtTime(0.0001, startTime);
  envelope.gain.exponentialRampToValueAtTime(gain, startTime + 0.01);
  envelope.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  oscillator.connect(envelope);
  envelope.connect(destination);
  oscillator.start(startTime);
  oscillator.stop(startTime + duration + 0.02);
}

function playNoise(context: AudioContext, destination: AudioNode, startTime: number, duration: number, gain: number) {
  const buffer = context.createBuffer(1, context.sampleRate * duration, context.sampleRate);
  const data = buffer.getChannelData(0);

  for (let index = 0; index < data.length; index += 1) {
    data[index] = (Math.random() * 2 - 1) * (1 - index / data.length);
  }

  const source = context.createBufferSource();
  const filter = context.createBiquadFilter();
  const envelope = context.createGain();

  filter.type = "bandpass";
  filter.frequency.setValueAtTime(1200, startTime);
  filter.Q.setValueAtTime(0.7, startTime);
  envelope.gain.setValueAtTime(gain, startTime);
  envelope.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  source.buffer = buffer;
  source.connect(filter);
  filter.connect(envelope);
  envelope.connect(destination);
  source.start(startTime);
}

export async function playUiSound(kind: UiSound, controls = defaultSoundControls) {
  if (typeof window === "undefined") {
    return;
  }

  const context = getAudioContext();

  if (context.state === "suspended") {
    await context.resume();
  }

  const now = context.currentTime;
  const output = context.createGain();
  const pitchRatio = 2 ** (controls.pitch / 12);
  const durationRatio = controls.duration / 100;
  const gain = Math.max(0.001, controls.volume / 100) * 0.18;

  output.gain.setValueAtTime(0.86, now);
  output.connect(context.destination);

  if (kind === "click") {
    playSweep(context, output, now, 220 * pitchRatio, 720 * pitchRatio, 0.06 * durationRatio, gain);
  }

  if (kind === "tick") {
    playTone(context, output, now, 1100 * pitchRatio, 0.035 * durationRatio, gain * 0.36);
  }

  if (kind === "toggleOn") {
    playTone(context, output, now, 440 * pitchRatio, 0.07 * durationRatio, gain);
    playTone(context, output, now + 0.055 * durationRatio, 660 * pitchRatio, 0.08 * durationRatio, gain * 0.85);
  }

  if (kind === "toggleOff") {
    playTone(context, output, now, 660 * pitchRatio, 0.07 * durationRatio, gain);
    playTone(context, output, now + 0.055 * durationRatio, 440 * pitchRatio, 0.08 * durationRatio, gain * 0.85);
  }

  if (kind === "modalOpen") {
    playSweep(context, output, now, 430 * pitchRatio, 1400 * pitchRatio, 0.12 * durationRatio, gain * 0.8);
  }

  if (kind === "modalClose") {
    playSweep(context, output, now, 1100 * pitchRatio, 360 * pitchRatio, 0.11 * durationRatio, gain * 0.7);
  }

  if (kind === "success") {
    [440, 554, 740].forEach((frequency, index) => {
      playTone(context, output, now + index * 0.045 * durationRatio, frequency * pitchRatio, 0.12 * durationRatio, gain * 0.75);
    });
  }

  if (kind === "error") {
    playSweep(context, output, now, 240 * pitchRatio, 120 * pitchRatio, 0.18 * durationRatio, gain * 0.9, "triangle");
    playTone(context, output, now + 0.02, 82 * pitchRatio, 0.14 * durationRatio, gain * 0.28, "sawtooth");
  }

  if (kind === "whoosh") {
    playNoise(context, output, now, 0.18 * durationRatio, gain * 0.9);
    playSweep(context, output, now, 280 * pitchRatio, 900 * pitchRatio, 0.16 * durationRatio, gain * 0.25);
  }
}

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}
