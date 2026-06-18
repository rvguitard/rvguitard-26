"use client";

import {
  type ChangeEvent,
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent as ReactPointerEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type SheetMeta = {
  name: string;
  url: string;
  width: number;
  height: number;
};

type Frame = {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
};

type ExportMode = "css" | "canvas" | "gif";
type TimingMode = "steps" | "linear";
type DragMode = "move" | "resize-se" | "resize-sw" | "resize-ne" | "resize-nw";
type ColumnResizeHandle = "left-map" | "map-preview";
type ColumnResizeState = {
  handle: ColumnResizeHandle;
  startX: number;
  totalWidth: number;
  columns: ColumnSizes;
};
type ColumnSizes = {
  left: number;
  map: number;
  preview: number;
};
type SaveFileHandle = {
  createWritable: () => Promise<{
    write: (data: Blob) => Promise<void>;
    close: () => Promise<void>;
  }>;
};
type DragState = {
  index: number;
  mode: DragMode;
  startX: number;
  startY: number;
  origin: Frame;
};

const defaultFrame = { x: 0, y: 0, w: 24, h: 40 };
const defaultColumnSizes: ColumnSizes = { left: 22, map: 48, preview: 30 };
const minColumnSizes: ColumnSizes = { left: 16, map: 28, preview: 20 };
const defaultSheet: SheetMeta = {
  name: "/assets/idle-anim.png",
  url: "/assets/idle-anim.png",
  width: 168,
  height: 320,
};
const exportCloseMs = 150;

function clamp(value: number, min: number) {
  return Number.isFinite(value) ? Math.max(min, value) : min;
}

function clampValue(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function toClassName(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "sprite-animation";
}

function buildGridFrames(frameCount: number, columns: number, frameWidth: number, frameHeight: number, gap: number, offsetX: number, offsetY: number) {
  return Array.from({ length: frameCount }, (_, index) => {
    const column = index % columns;
    const row = Math.floor(index / columns);

    return {
      id: `frame-${Date.now()}-${index}`,
      x: offsetX + column * (frameWidth + gap),
      y: offsetY + row * (frameHeight + gap),
      w: frameWidth,
      h: frameHeight,
    };
  });
}

function buildCss(animationName: string, imageName: string, frames: Frame[], fps: number, timingMode: TimingMode, imageSize?: { width: number; height: number }) {
  const className = toClassName(animationName);
  const keyframeName = `${className}-frames`;
  const duration = Math.max(frames.length / clamp(fps, 1), 0.1).toFixed(2);
  const stepMode = timingMode === "steps" ? "step-end" : "linear";
  const keyframeLines = frames
    .map((frame, index) => {
      const percent = frames.length === 1 ? 100 : (index / frames.length) * 100;
      return `  ${percent.toFixed(2)}% {
    width: ${frame.w}px;
    height: ${frame.h}px;
    background-position: -${frame.x}px -${frame.y}px;
  }`;
    })
    .join("\n");
  const firstFrame = frames[0] ?? { w: 1, h: 1, x: 0, y: 0 };
  const backgroundSize = imageSize ? `\n  background-size: ${imageSize.width}px ${imageSize.height}px;` : "";

  return `.${className} {
  width: ${firstFrame.w}px;
  height: ${firstFrame.h}px;
  overflow: hidden;
  background-image: url("${imageName}");
  background-repeat: no-repeat;${backgroundSize}
  image-rendering: pixelated;
  animation: ${keyframeName} ${duration}s infinite ${stepMode};
}

@keyframes ${keyframeName} {
${keyframeLines}
  100% {
    width: ${firstFrame.w}px;
    height: ${firstFrame.h}px;
    background-position: -${firstFrame.x}px -${firstFrame.y}px;
  }
}`;
}

function buildCanvasCode(imageName: string, frames: Frame[], fps: number) {
  const framesJson = JSON.stringify(frames.map(({ x, y, w, h }) => ({ x, y, w, h })), null, 2);

  return `const canvas = document.querySelector("#sprite-canvas");
const context = canvas.getContext("2d");
const spritesheet = new Image();
spritesheet.src = "${imageName}";

const frames = ${framesJson};
const fps = ${clamp(fps, 1)};
let frameIndex = 0;
let lastFrameTime = 0;

function drawSprite(timestamp) {
  const interval = 1000 / fps;

  if (timestamp - lastFrameTime >= interval) {
    frameIndex = (frameIndex + 1) % frames.length;
    lastFrameTime = timestamp;
  }

  const frame = frames[frameIndex];
  canvas.width = frame.w;
  canvas.height = frame.h;
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.drawImage(spritesheet, frame.x, frame.y, frame.w, frame.h, 0, 0, frame.w, frame.h);
  requestAnimationFrame(drawSprite);
}

spritesheet.onload = () => requestAnimationFrame(drawSprite);`;
}

function writeAscii(bytes: number[], value: string) {
  for (let index = 0; index < value.length; index += 1) {
    bytes.push(value.charCodeAt(index));
  }
}

function writeShort(bytes: number[], value: number) {
  bytes.push(value & 255, (value >> 8) & 255);
}

function quantizePixel(data: Uint8ClampedArray, offset: number) {
  if (data[offset + 3] < 128) {
    return 0;
  }

  const red = data[offset] >> 5;
  const green = data[offset + 1] >> 5;
  const blue = data[offset + 2] >> 6;
  return Math.min(255, 1 + ((red << 5) | (green << 2) | blue));
}

function buildGifPalette() {
  const palette: number[] = [0, 0, 0];

  for (let index = 1; index < 256; index += 1) {
    const value = index - 1;
    const red = (value >> 5) & 7;
    const green = (value >> 2) & 7;
    const blue = value & 3;
    palette.push(Math.round((red / 7) * 255), Math.round((green / 7) * 255), Math.round((blue / 3) * 255));
  }

  return palette;
}

function packGifCodes(codes: number[], minCodeSize: number) {
  const bytes: number[] = [];
  let bitBuffer = 0;
  let bitCount = 0;
  let codeSize = minCodeSize + 1;
  let nextCode = (1 << minCodeSize) + 2;

  codes.forEach((code) => {
    bitBuffer |= code << bitCount;
    bitCount += codeSize;

    while (bitCount >= 8) {
      bytes.push(bitBuffer & 255);
      bitBuffer >>= 8;
      bitCount -= 8;
    }

    nextCode += 1;

    if (nextCode === 1 << codeSize && codeSize < 12) {
      codeSize += 1;
    }
  });

  if (bitCount > 0) {
    bytes.push(bitBuffer & 255);
  }

  return bytes;
}

function lzwEncode(indices: number[]) {
  const minCodeSize = 8;
  const clearCode = 1 << minCodeSize;
  const endCode = clearCode + 1;
  let nextCode = endCode + 1;
  const dictionary = new Map<string, number>();
  const codes = [clearCode];
  let phrase = `${indices[0] ?? 0}`;

  for (let index = 1; index < indices.length; index += 1) {
    const value = indices[index];
    const nextPhrase = `${phrase},${value}`;

    if (dictionary.has(nextPhrase)) {
      phrase = nextPhrase;
      continue;
    }

    codes.push(phrase.includes(",") ? dictionary.get(phrase)! : Number(phrase));

    if (nextCode < 4096) {
      dictionary.set(nextPhrase, nextCode);
      nextCode += 1;
    } else {
      codes.push(clearCode);
      dictionary.clear();
      nextCode = endCode + 1;
    }

    phrase = `${value}`;
  }

  codes.push(phrase.includes(",") ? dictionary.get(phrase)! : Number(phrase), endCode);
  return { data: packGifCodes(codes, minCodeSize), minCodeSize };
}

function writeGifSubBlocks(bytes: number[], data: number[]) {
  for (let index = 0; index < data.length; index += 255) {
    const block = data.slice(index, index + 255);
    bytes.push(block.length, ...block);
  }

  bytes.push(0);
}

async function loadImage(url: string) {
  const image = new Image();
  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error("Could not load spritesheet."));
    image.src = url;
  });
  return image;
}

function triggerDownload(url: string, filename: string, shouldRevoke = true) {
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.rel = "noopener";
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  link.remove();

  if (shouldRevoke) {
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }
}

async function requestSaveHandle(filename: string, mimeType: string) {
  const showSaveFilePicker = (window as Window & {
    showSaveFilePicker?: (options: {
      suggestedName: string;
      types: Array<{ description: string; accept: Record<string, string[]> }>;
    }) => Promise<SaveFileHandle>;
  }).showSaveFilePicker;

  if (!showSaveFilePicker || !window.isSecureContext) {
    return undefined;
  }

  try {
    const extension = filename.includes(".") ? `.${filename.split(".").pop()}` : "";
    return await showSaveFilePicker({
      suggestedName: filename,
      types: [
        {
          description: mimeType === "image/gif" ? "GIF image" : "PNG image",
          accept: { [mimeType]: extension ? [extension] : [] },
        },
      ],
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return null;
    }

    return undefined;
  }
}

async function saveBlob(blob: Blob, filename: string, saveHandle?: SaveFileHandle | null) {
  if (saveHandle === null) {
    return;
  }

  if (saveHandle) {
    const writable = await saveHandle.createWritable();
    await writable.write(blob);
    await writable.close();
    return;
  }

  const url = URL.createObjectURL(blob);
  triggerDownload(url, filename);
}

async function buildAnimatedGifBlob(sheet: SheetMeta, frames: Frame[], fps: number) {
  const image = await loadImage(sheet.url);
  const width = Math.max(...frames.map((frame) => frame.w), 1);
  const height = Math.max(...frames.map((frame) => frame.h), 1);
  const delay = Math.max(2, Math.round(100 / clamp(fps, 1)));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d", { willReadFrequently: true });

  if (!context) {
    throw new Error("Canvas is not available.");
  }

  const bytes: number[] = [];
  writeAscii(bytes, "GIF89a");
  writeShort(bytes, width);
  writeShort(bytes, height);
  bytes.push(0xf7, 0, 0);
  bytes.push(...buildGifPalette());
  writeAscii(bytes, "!\xff\x0bNETSCAPE2.0\x03\x01");
  writeShort(bytes, 0);
  bytes.push(0);

  frames.forEach((frame) => {
    context.clearRect(0, 0, width, height);
    context.drawImage(image, frame.x, frame.y, frame.w, frame.h, 0, 0, frame.w, frame.h);

    const imageData = context.getImageData(0, 0, width, height).data;
    const indices: number[] = [];

    for (let index = 0; index < imageData.length; index += 4) {
      indices.push(quantizePixel(imageData, index));
    }

    const encoded = lzwEncode(indices);
    writeAscii(bytes, "!\xf9\x04");
    bytes.push(9);
    writeShort(bytes, delay);
    bytes.push(0, 0);
    bytes.push(0x2c);
    writeShort(bytes, 0);
    writeShort(bytes, 0);
    writeShort(bytes, width);
    writeShort(bytes, height);
    bytes.push(0);
    bytes.push(encoded.minCodeSize);
    writeGifSubBlocks(bytes, encoded.data);
  });

  bytes.push(0x3b);
  return new Blob([new Uint8Array(bytes)], { type: "image/gif" });
}

function ToolIcon({ name }: { name: "grid" | "export" | "minus" | "plus" | "previous" | "play" | "pause" | "next" | "up" | "down" | "left" | "right" | "copy" | "trash" | "download" | "image" | "close" | "undo" | "info" }) {
  const paths = {
    grid: "M2.5 2.5h4v4h-4v-4Zm7 0h4v4h-4v-4Zm-7 7h4v4h-4v-4Zm7 0h4v4h-4v-4Z",
    export: "M7 2h2v6.2l2.1-2.1 1.4 1.4L8 12 3.5 7.5l1.4-1.4L7 8.2V2Zm-4 10h10v2H3v-2Z",
    minus: "M3 7h10v2H3V7Z",
    plus: "M7 3h2v4h4v2H9v4H7V9H3V7h4V3Z",
    previous: "M3 3h2v10H3V3Zm3 5 7-5v10L6 8Z",
    play: "M5 3.2 12.5 8 5 12.8V3.2Z",
    pause: "M4.5 3h3v10h-3V3Zm4 0h3v10h-3V3Z",
    next: "M13 3h-2v10h2V3ZM10 8 3 3v10l7-5Z",
    up: "M8 3 3.5 7.5h3V13h3V7.5h3L8 3Z",
    down: "M8 13 3.5 8.5h3V3h3v5.5h3L8 13Z",
    left: "M3 8 7.5 3.5v3H13v3H7.5v3L3 8Z",
    right: "M13 8 8.5 3.5v3H3v3h5.5v3L13 8Z",
    copy: "M5 2h8v8h-2V4H5V2ZM3 6h8v8H3V6Z",
    trash: "M6 2h4l.5 1.5H13v2H3v-2h2.5L6 2Zm-1.5 4h7l-.5 8H5L4.5 6Z",
    download: "M7 2h2v6l2-2 1.4 1.4L8 11.8 3.6 7.4 5 6l2 2V2Zm-3.5 10h9v2h-9v-2Z",
    image: "M2.5 3.5h11v9h-11v-9Zm2 7h7l-2.3-3-1.6 2-1.1-1.4-2 2.4Z",
    close: "M4.4 3 8 6.6 11.6 3 13 4.4 9.4 8l3.6 3.6-1.4 1.4L8 9.4 4.4 13 3 11.6 6.6 8 3 4.4 4.4 3Z",
    undo: "M6 3 2.5 6.5 6 10V7.5h3.2a2.6 2.6 0 1 1 0 5.2H6.5v2h2.7a4.6 4.6 0 1 0 0-9.2H6V3Z",
    info: "M8 1.8a6.2 6.2 0 1 0 0 12.4A6.2 6.2 0 0 0 8 1.8Zm-1 5h2v5H7v-5Zm0-2.6h2v1.6H7V4.2Z",
  };

  return (
    <svg className="slicer-icon" viewBox="0 0 16 16" aria-hidden="true">
      <path d={paths[name]} />
    </svg>
  );
}

function HeadingInfo({ text }: { text: string }) {
  return (
    <span className="slicer-info-tooltip">
      <button aria-label={text} type="button">
        <ToolIcon name="info" />
      </button>
      <span role="tooltip">{text}</span>
    </span>
  );
}

export function KeyframeSlicerTool() {
  const [sheet, setSheet] = useState<SheetMeta | null>(defaultSheet);
  const [animationName, setAnimationName] = useState("idle-anim");
  const [frameWidth, setFrameWidth] = useState(defaultFrame.w);
  const [frameHeight, setFrameHeight] = useState(defaultFrame.h);
  const [frameCount, setFrameCount] = useState(56);
  const [columns, setColumns] = useState(7);
  const [gap, setGap] = useState(0);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [fps, setFps] = useState(8);
  const [zoom, setZoom] = useState(1);
  const [previewScale, setPreviewScale] = useState(2);
  const [showOnionSkin, setShowOnionSkin] = useState(false);
  const [exportMode, setExportMode] = useState<ExportMode>("css");
  const [exportStartFrame, setExportStartFrame] = useState(1);
  const [exportEndFrame, setExportEndFrame] = useState(56);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isExportVisible, setIsExportVisible] = useState(false);
  const [isExportClosing, setIsExportClosing] = useState(false);
  const [isMapFocused, setIsMapFocused] = useState(false);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const [previewFrameIndex, setPreviewFrameIndex] = useState(0);
  const [activeFrameIndex, setActiveFrameIndex] = useState(0);
  const [frames, setFrames] = useState<Frame[]>(() => buildGridFrames(56, 7, defaultFrame.w, defaultFrame.h, 0, 0, 0));
  const [undoStack, setUndoStack] = useState<Frame[][]>([]);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [columnSizes, setColumnSizes] = useState<ColumnSizes>(defaultColumnSizes);
  const [columnResizeState, setColumnResizeState] = useState<ColumnResizeState | null>(null);
  const [copied, setCopied] = useState(false);
  const layoutRef = useRef<HTMLDivElement | null>(null);
  const exportCloseTimeout = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (exportCloseTimeout.current) {
        window.clearTimeout(exportCloseTimeout.current);
      }

      if (sheet?.url?.startsWith("blob:")) {
        URL.revokeObjectURL(sheet.url);
      }
    };
  }, [sheet?.url]);

  useEffect(() => {
    if (!dragState) {
      return;
    }

    const currentDrag = dragState;

    function handlePointerMove(event: PointerEvent) {
      const dx = Math.round((event.clientX - currentDrag.startX) / zoom);
      const dy = Math.round((event.clientY - currentDrag.startY) / zoom);
      const minSize = 4;
      const maxWidth = sheet?.width ?? Number.POSITIVE_INFINITY;
      const maxHeight = sheet?.height ?? Number.POSITIVE_INFINITY;
      const origin = currentDrag.origin;
      let nextX = origin.x;
      let nextY = origin.y;
      let nextW = origin.w;
      let nextH = origin.h;

      if (currentDrag.mode === "move") {
        nextX = Math.max(0, Math.min(origin.x + dx, maxWidth - origin.w));
        nextY = Math.max(0, Math.min(origin.y + dy, maxHeight - origin.h));
      }

      if (currentDrag.mode === "resize-se") {
        nextW = Math.max(minSize, Math.min(origin.w + dx, maxWidth - origin.x));
        nextH = Math.max(minSize, Math.min(origin.h + dy, maxHeight - origin.y));
      }

      if (currentDrag.mode === "resize-sw") {
        nextX = Math.max(0, Math.min(origin.x + dx, origin.x + origin.w - minSize));
        nextW = Math.max(minSize, origin.w + (origin.x - nextX));
        nextH = Math.max(minSize, Math.min(origin.h + dy, maxHeight - origin.y));
      }

      if (currentDrag.mode === "resize-ne") {
        nextY = Math.max(0, Math.min(origin.y + dy, origin.y + origin.h - minSize));
        nextW = Math.max(minSize, Math.min(origin.w + dx, maxWidth - origin.x));
        nextH = Math.max(minSize, origin.h + (origin.y - nextY));
      }

      if (currentDrag.mode === "resize-nw") {
        nextX = Math.max(0, Math.min(origin.x + dx, origin.x + origin.w - minSize));
        nextY = Math.max(0, Math.min(origin.y + dy, origin.y + origin.h - minSize));
        nextW = Math.max(minSize, origin.w + (origin.x - nextX));
        nextH = Math.max(minSize, origin.h + (origin.y - nextY));
      }

      updateFrame(currentDrag.index, { x: nextX, y: nextY, w: nextW, h: nextH }, false, false);
    }

    function handlePointerUp() {
      setDragState(null);
    }

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [dragState, sheet?.height, sheet?.width, zoom]);

  useEffect(() => {
    if (!columnResizeState) {
      return;
    }

    const currentResize = columnResizeState;

    function handlePointerMove(event: PointerEvent) {
      const deltaPercent = ((event.clientX - currentResize.startX) / currentResize.totalWidth) * 100;

      setColumnSizes(() => {
        if (currentResize.handle === "left-map") {
          const left = clampValue(
            currentResize.columns.left + deltaPercent,
            minColumnSizes.left,
            100 - minColumnSizes.map - currentResize.columns.preview,
          );
          return {
            left,
            map: currentResize.columns.left + currentResize.columns.map - left,
            preview: currentResize.columns.preview,
          };
        }

        const map = clampValue(
          currentResize.columns.map + deltaPercent,
          minColumnSizes.map,
          100 - minColumnSizes.preview - currentResize.columns.left,
        );
        return {
          left: currentResize.columns.left,
          map,
          preview: currentResize.columns.map + currentResize.columns.preview - map,
        };
      });
    }

    function handlePointerUp() {
      setColumnResizeState(null);
    }

    document.body.classList.add("is-resizing-slicer");
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      document.body.classList.remove("is-resizing-slicer");
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [columnResizeState]);

  useEffect(() => {
    setPreviewFrameIndex((currentIndex) => Math.min(currentIndex, Math.max(frames.length - 1, 0)));
    setExportStartFrame((currentStart) => Math.min(currentStart, Math.max(frames.length, 1)));
    setExportEndFrame((currentEnd) => Math.min(Math.max(currentEnd, 1), Math.max(frames.length, 1)));
  }, [frames.length]);

  useEffect(() => {
    if (!isPreviewPlaying || frames.length === 0) {
      return;
    }

    const interval = window.setInterval(() => {
      setPreviewFrameIndex((currentIndex) => {
        const nextIndex = (currentIndex + 1) % frames.length;
        setActiveFrameIndex(nextIndex);
        return nextIndex;
      });
    }, 1000 / clamp(fps, 1));

    return () => window.clearInterval(interval);
  }, [fps, frames.length, isPreviewPlaying]);

  useEffect(() => {
    if (!isExportOpen || isExportClosing) {
      return;
    }

    function handleKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") {
        closeExportModal();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isExportClosing, isExportOpen]);

  const activeFrame = frames[activeFrameIndex] ?? frames[0];
  const previewFrame = frames[previewFrameIndex] ?? frames[0];
  const previousPreviewFrame = frames[(previewFrameIndex - 1 + frames.length) % frames.length];
  const imageName = sheet?.name ?? "spritesheet.png";
  const normalizedExportStart = Math.min(Math.max(clamp(exportStartFrame, 1), 1), Math.max(frames.length, 1));
  const normalizedExportEnd = Math.min(Math.max(clamp(exportEndFrame, 1), 1), Math.max(frames.length, 1));
  const exportRangeStart = Math.min(normalizedExportStart, normalizedExportEnd);
  const exportRangeEnd = Math.max(normalizedExportStart, normalizedExportEnd);
  const exportFrames = frames.slice(exportRangeStart - 1, exportRangeEnd);
  const generatedCss = useMemo(
    () => buildCss(animationName, imageName, exportFrames, fps, "steps", sheet ? { width: sheet.width, height: sheet.height } : undefined),
    [animationName, exportFrames, fps, imageName, sheet],
  );
  const generatedCanvasCode = useMemo(() => buildCanvasCode(imageName, exportFrames, fps), [exportFrames, fps, imageName]);
  const activeCode =
    exportMode === "css"
      ? generatedCss
      : exportMode === "canvas"
        ? generatedCanvasCode
        : `GIF export will render frames ${exportRangeStart}-${exportRangeEnd} (${exportFrames.length} total) at ${clamp(fps, 1)} FPS from ${imageName}.`;

  const previewStyle = {
    "--slicer-image": sheet ? `url("${sheet.url}")` : "none",
    "--slicer-scale": previewScale,
    "--slicer-bg-size": sheet ? `${sheet.width}px ${sheet.height}px` : "auto",
  } as CSSProperties;

  function rememberFrames(snapshot = frames) {
    setUndoStack((currentStack) => [...currentStack.slice(-19), snapshot.map((frame) => ({ ...frame }))]);
  }

  function openExportModal() {
    if (exportCloseTimeout.current) {
      window.clearTimeout(exportCloseTimeout.current);
    }

    setIsExportClosing(false);
    setIsExportOpen(true);
    window.requestAnimationFrame(() => setIsExportVisible(true));
  }

  function closeExportModal() {
    setIsExportVisible(false);
    setIsExportClosing(true);
    exportCloseTimeout.current = window.setTimeout(() => {
      setIsExportOpen(false);
      setIsExportVisible(false);
      setIsExportClosing(false);
    }, exportCloseMs);
  }

  function undoFrames() {
    setUndoStack((currentStack) => {
      const previousFrames = currentStack[currentStack.length - 1];

      if (!previousFrames) {
        return currentStack;
      }

      setFrames(previousFrames.map((frame) => ({ ...frame })));
      setActiveFrameIndex((currentIndex) => Math.min(currentIndex, previousFrames.length - 1));
      setPreviewFrameIndex((currentIndex) => Math.min(currentIndex, previousFrames.length - 1));
      return currentStack.slice(0, -1);
    });
  }

  function rebuildFrames() {
    rememberFrames();
    const nextFrames = buildGridFrames(
      clamp(frameCount, 1),
      clamp(columns, 1),
      clamp(frameWidth, 1),
      clamp(frameHeight, 1),
      clamp(gap, 0),
      clamp(offsetX, 0),
      clamp(offsetY, 0),
    );

    setFrames(nextFrames);
    setActiveFrameIndex(0);
    setPreviewFrameIndex(0);
    setExportStartFrame(1);
    setExportEndFrame(nextFrames.length);
  }

  function updateFrame(index: number, changes: Partial<Frame>, syncSize = false, remember = true) {
    if (remember) {
      rememberFrames();
    }

    setFrames((currentFrames) =>
      currentFrames.map((frame, frameIndex) => {
        if (frameIndex === index) {
          return { ...frame, ...changes };
        }

        if (syncSize && (changes.w !== undefined || changes.h !== undefined)) {
          return {
            ...frame,
            w: changes.w ?? frame.w,
            h: changes.h ?? frame.h,
          };
        }

        return frame;
      }),
    );
  }

  function nudgeFrame(axis: "x" | "y" | "w" | "h", amount: number) {
    if (!activeFrame) {
      return;
    }

    updateFrame(activeFrameIndex, {
      [axis]: clamp(activeFrame[axis] + amount, axis === "w" || axis === "h" ? 1 : 0),
    });
  }

  function addFrame() {
    rememberFrames();
    const source = activeFrame ?? defaultFrame;
    const nextFrame = {
      ...source,
      id: `frame-${Date.now()}`,
      x: source.x + 12,
    };

    setFrames((currentFrames) => [...currentFrames, nextFrame]);
    setActiveFrameIndex(frames.length);
    setPreviewFrameIndex(frames.length);
  }

  function duplicateFrame(index: number) {
    const source = frames[index];

    if (!source) {
      return;
    }

    rememberFrames();
    const nextFrames = [...frames];
    nextFrames.splice(index + 1, 0, { ...source, id: `frame-${Date.now()}` });
    setFrames(nextFrames);
    setActiveFrameIndex(index + 1);
    setPreviewFrameIndex(index + 1);
  }

  function deleteFrame(index: number) {
    if (frames.length <= 1) {
      return;
    }

    rememberFrames();
    const nextFrames = frames.filter((_, frameIndex) => frameIndex !== index);
    setFrames(nextFrames);
    setActiveFrameIndex(Math.min(index, nextFrames.length - 1));
    setPreviewFrameIndex(Math.min(index, nextFrames.length - 1));
  }

  function moveFrame(index: number, direction: -1 | 1) {
    const targetIndex = index + direction;

    if (targetIndex < 0 || targetIndex >= frames.length) {
      return;
    }

    rememberFrames();
    const nextFrames = [...frames];
    [nextFrames[index], nextFrames[targetIndex]] = [nextFrames[targetIndex], nextFrames[index]];
    setFrames(nextFrames);
    setActiveFrameIndex(targetIndex);
    setPreviewFrameIndex(targetIndex);
  }

  function selectPreviewFrame(index: number) {
    const nextIndex = (index + frames.length) % frames.length;
    setPreviewFrameIndex(nextIndex);
    setActiveFrameIndex(nextIndex);
    setIsPreviewPlaying(false);
  }

  function startColumnResize(event: ReactPointerEvent<HTMLButtonElement>, handle: ColumnResizeHandle) {
    const totalWidth = layoutRef.current?.clientWidth ?? 0;

    if (totalWidth <= 0) {
      return;
    }

    event.preventDefault();
    setColumnResizeState({
      handle,
      startX: event.clientX,
      totalWidth,
      columns: columnSizes,
    });
  }

  function handleMapKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (!activeFrame) {
      return;
    }

    const step = event.shiftKey ? 10 : 1;

    if (event.key === "Delete" || event.key === "Backspace") {
      event.preventDefault();
      deleteFrame(activeFrameIndex);
      return;
    }

    if (event.key === "[" || event.key === ",") {
      event.preventDefault();
      selectPreviewFrame(activeFrameIndex - 1);
      return;
    }

    if (event.key === "]" || event.key === ".") {
      event.preventDefault();
      selectPreviewFrame(activeFrameIndex + 1);
      return;
    }

    const arrowKeys = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"];

    if (!arrowKeys.includes(event.key)) {
      return;
    }

    event.preventDefault();

    if (event.altKey) {
      if (event.key === "ArrowLeft") nudgeFrame("w", -step);
      if (event.key === "ArrowRight") nudgeFrame("w", step);
      if (event.key === "ArrowUp") nudgeFrame("h", -step);
      if (event.key === "ArrowDown") nudgeFrame("h", step);
      return;
    }

    if (event.key === "ArrowLeft") nudgeFrame("x", -step);
    if (event.key === "ArrowRight") nudgeFrame("x", step);
    if (event.key === "ArrowUp") nudgeFrame("y", -step);
    if (event.key === "ArrowDown") nudgeFrame("y", step);
  }

  function startFrameDrag(event: ReactPointerEvent<HTMLElement>, index: number, mode: DragMode) {
    event.stopPropagation();
    event.preventDefault();
    rememberFrames();
    setActiveFrameIndex(index);
    setDragState({
      index,
      mode,
      startX: event.clientX,
      startY: event.clientY,
      origin: frames[index],
    });
  }

  function addFrameAtPoint(event: MouseEvent<HTMLDivElement>) {
    if (!sheet || event.target !== event.currentTarget) {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const x = Math.round((event.clientX - rect.left) / zoom - frameWidth / 2);
    const y = Math.round((event.clientY - rect.top) / zoom - frameHeight / 2);
    const nextFrame = {
      id: `frame-${Date.now()}`,
      x: Math.max(0, x),
      y: Math.max(0, y),
      w: clamp(frameWidth, 1),
      h: clamp(frameHeight, 1),
    };

    rememberFrames();
    setFrames((currentFrames) => [...currentFrames, nextFrame]);
    setActiveFrameIndex(frames.length);
    setPreviewFrameIndex(frames.length);
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const url = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      rememberFrames();
      setSheet((current) => {
        if (current?.url) {
          URL.revokeObjectURL(current.url);
        }

        return {
          name: file.name,
          url,
          width: image.naturalWidth,
          height: image.naturalHeight,
        };
      });
      setFrames(buildGridFrames(1, 1, defaultFrame.w, defaultFrame.h, 0, 0, 0));
      setFrameCount(1);
      setColumns(1);
      setActiveFrameIndex(0);
    };

    image.src = url;
  }

  function copyCodeWithTextarea() {
    const textArea = document.createElement("textarea");
    textArea.value = activeCode;
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

  async function copyCode() {
    try {
      if (navigator.clipboard?.writeText) {
        try {
          await navigator.clipboard.writeText(activeCode);
        } catch {
          copyCodeWithTextarea();
        }
      } else {
        copyCodeWithTextarea();
      }

      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch (error) {
      console.error("Copy failed", error);
      setCopied(false);
    }
  }

  async function downloadGif() {
    if (!sheet || exportFrames.length === 0) {
      return;
    }

    const filename = `${toClassName(animationName)}.gif`;
    const saveHandle = await requestSaveHandle(filename, "image/gif");

    if (saveHandle === null) {
      return;
    }

    const blob = await buildAnimatedGifBlob(sheet, exportFrames, fps);
    await saveBlob(blob, filename, saveHandle);
  }

  async function downloadFrame() {
    if (!sheet || !activeFrame) {
      return;
    }

    const filename = `${toClassName(animationName)}-frame-${activeFrameIndex + 1}.png`;
    const saveHandle = await requestSaveHandle(filename, "image/png");

    if (saveHandle === null) {
      return;
    }

    const image = await loadImage(sheet.url);

    const canvas = document.createElement("canvas");
    canvas.width = activeFrame.w;
    canvas.height = activeFrame.h;
    const context = canvas.getContext("2d");
    context?.drawImage(image, activeFrame.x, activeFrame.y, activeFrame.w, activeFrame.h, 0, 0, activeFrame.w, activeFrame.h);

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));

    if (!blob) {
      return;
    }

    await saveBlob(blob, filename, saveHandle);
  }

  return (
    <div
      className="slicer-layout"
      ref={layoutRef}
      style={{
        gridTemplateColumns: `minmax(220px, ${columnSizes.left}fr) 10px minmax(360px, ${columnSizes.map}fr) 10px minmax(280px, ${columnSizes.preview}fr)`,
      }}
    >
      <div className="slicer-left-stack">
        <section className="slicer-panel slicer-upload-panel" id="upload">
          <div className="ds-section-heading">
            <h2>Upload</h2>
            <HeadingInfo text="Use the default idle sheet or import another sprite." />
          </div>
          <label className="slicer-upload">
            <input accept="image/*" onChange={handleFileChange} type="file" />
            <span className="slicer-upload-add" aria-hidden="true">+</span>
            <span className="slicer-upload-meta">
              <span>{sheet ? sheet.name.replace("/assets/", "") : "Choose spritesheet"}</span>
              <small>{sheet ? `${sheet.width} x ${sheet.height}px` : "PNG, WebP, GIF, or JPEG"}</small>
            </span>
          </label>
        </section>

        <section className="slicer-panel slicer-settings-panel" id="settings">
          <div className="ds-section-heading">
            <h2>Spritesheet Grid</h2>
            <HeadingInfo text="Generate the grid, then tune the selected frame." />
          </div>
          <div className="slicer-controls">
            <label>
              Animation name
              <input className="ds-input" onChange={(event) => setAnimationName(event.target.value)} value={animationName} />
            </label>
            <label>
              Frame width
              <input className="ds-input" min="1" onChange={(event) => setFrameWidth(Number(event.target.value))} type="number" value={frameWidth} />
            </label>
            <label>
              Frame height
              <input className="ds-input" min="1" onChange={(event) => setFrameHeight(Number(event.target.value))} type="number" value={frameHeight} />
            </label>
            <label>
              Frames
              <input className="ds-input" min="1" onChange={(event) => setFrameCount(Number(event.target.value))} type="number" value={frameCount} />
            </label>
            <label>
              Columns
              <input className="ds-input" min="1" onChange={(event) => setColumns(Number(event.target.value))} type="number" value={columns} />
            </label>
            <label>
              Gap
              <input className="ds-input" min="0" onChange={(event) => setGap(Number(event.target.value))} type="number" value={gap} />
            </label>
            <label>
              Offset X
              <input className="ds-input" min="0" onChange={(event) => setOffsetX(Number(event.target.value))} type="number" value={offsetX} />
            </label>
            <label>
              Offset Y
              <input className="ds-input" min="0" onChange={(event) => setOffsetY(Number(event.target.value))} type="number" value={offsetY} />
            </label>
          </div>
          <div className="slicer-actions">
            <button className="ds-button is-secondary" onClick={rebuildFrames} type="button">
              <ToolIcon name="grid" />
              <span>Generate grid</span>
            </button>
          </div>
        </section>

        <section className="slicer-panel slicer-shortcuts-panel">
          <div className="ds-section-heading">
            <h2>Shortcuts</h2>
            <HeadingInfo text="Click the map first to edit frames with the keyboard." />
          </div>
          <button aria-label="Undo frame edit" className="ds-button is-secondary slicer-shortcut-undo" disabled={undoStack.length === 0} onClick={undoFrames} type="button">
            <ToolIcon name="undo" />
            <span>Undo frame edit</span>
          </button>
          <div className="slicer-keyboard-hints" aria-live="polite">
            <span>{isMapFocused ? "Map selected" : "Click map first"}</span>
            <kbd>Arrows</kbd>
            <small>move</small>
            <kbd>Shift</kbd>
            <small>10px</small>
            <kbd>Alt + Arrows</kbd>
            <small>resize</small>
            <kbd>Delete</kbd>
            <small>remove</small>
            <kbd>[ ]</kbd>
            <small>frames</small>
          </div>
        </section>
      </div>

      <button
        aria-label="Resize upload and map columns"
        className={`slicer-column-resizer${columnResizeState?.handle === "left-map" ? " is-active" : ""}`}
        onPointerDown={(event) => startColumnResize(event, "left-map")}
        title="Resize columns"
        type="button"
      />

      <button
        aria-label="Resize map and preview columns"
        className={`slicer-column-resizer is-second${columnResizeState?.handle === "map-preview" ? " is-active" : ""}`}
        onPointerDown={(event) => startColumnResize(event, "map-preview")}
        title="Resize columns"
        type="button"
      />

      <section className="slicer-preview slicer-panel" aria-label="Animation preview">
        <div className="ds-section-heading">
          <h2>Preview</h2>
          <p>Frame {previewFrameIndex + 1} of {frames.length} at {fps} FPS.</p>
        </div>
        <div className="slicer-stage" style={previewStyle}>
          {sheet && previewFrame ? (
            <div className="slicer-preview-stack">
              {showOnionSkin && previousPreviewFrame && (
                <div
                  className="slicer-sprite is-onion"
                  style={{
                    width: `${previousPreviewFrame.w}px`,
                    height: `${previousPreviewFrame.h}px`,
                    backgroundPosition: `-${previousPreviewFrame.x}px -${previousPreviewFrame.y}px`,
                  }}
                />
              )}
              <div
                className="slicer-sprite"
                style={{
                  width: `${previewFrame.w}px`,
                  height: `${previewFrame.h}px`,
                  backgroundPosition: `-${previewFrame.x}px -${previewFrame.y}px`,
                }}
              />
            </div>
          ) : (
            <p>Upload a spritesheet to preview frames.</p>
          )}
        </div>
        <div className="slicer-playback-controls">
          <button aria-label="Previous frame" className="ds-button is-secondary slicer-icon-button" onClick={() => selectPreviewFrame(previewFrameIndex - 1)} title="Previous frame" type="button">
            <ToolIcon name="previous" />
          </button>
          <button aria-label={isPreviewPlaying ? "Pause preview" : "Play preview"} className="ds-button is-primary slicer-icon-button" onClick={() => setIsPreviewPlaying((current) => !current)} title={isPreviewPlaying ? "Pause preview" : "Play preview"} type="button">
            <ToolIcon name={isPreviewPlaying ? "pause" : "play"} />
          </button>
          <button aria-label="Next frame" className="ds-button is-secondary slicer-icon-button" onClick={() => selectPreviewFrame(previewFrameIndex + 1)} title="Next frame" type="button">
            <ToolIcon name="next" />
          </button>
        </div>
        <div className="slicer-preview-controls">
          <label>
            <span>Preview scale <strong>{previewScale}x</strong></span>
            <input className="ds-range" max="4" min="1" onChange={(event) => setPreviewScale(Number(event.target.value))} step="0.5" type="range" value={previewScale} />
          </label>
          <label>
            <span>Playback <strong>{fps} FPS</strong></span>
            <input className="ds-range" max="30" min="1" onChange={(event) => setFps(Number(event.target.value))} type="range" value={fps} />
          </label>
          <label className="slicer-check-row">
            <input checked={showOnionSkin} onChange={(event) => setShowOnionSkin(event.target.checked)} type="checkbox" />
            <span>Onion skin</span>
          </label>
        </div>
        {activeFrame && (
          <div className="slicer-preview-editor">
            <div className="slicer-mini-editor-heading">
              <strong>Frame {activeFrameIndex + 1}</strong>
              <span>{activeFrame.w}x{activeFrame.h} at {activeFrame.x},{activeFrame.y}</span>
            </div>
            <div className="slicer-frame-editor is-compact">
              <label>
                X
                <input className="ds-input" min="0" onChange={(event) => updateFrame(activeFrameIndex, { x: Number(event.target.value) })} type="number" value={activeFrame.x} />
              </label>
              <label>
                Y
                <input className="ds-input" min="0" onChange={(event) => updateFrame(activeFrameIndex, { y: Number(event.target.value) })} type="number" value={activeFrame.y} />
              </label>
              <label>
                W
                <input className="ds-input" min="1" onChange={(event) => updateFrame(activeFrameIndex, { w: Number(event.target.value) }, true)} type="number" value={activeFrame.w} />
              </label>
              <label>
                H
                <input className="ds-input" min="1" onChange={(event) => updateFrame(activeFrameIndex, { h: Number(event.target.value) }, true)} type="number" value={activeFrame.h} />
              </label>
            </div>
            <div className="slicer-nudge-pad is-compact">
              <button aria-label="Nudge frame up" className="ds-button is-secondary slicer-icon-button" onClick={() => nudgeFrame("y", -1)} title="Nudge up" type="button"><ToolIcon name="up" /></button>
              <button aria-label="Nudge frame left" className="ds-button is-secondary slicer-icon-button" onClick={() => nudgeFrame("x", -1)} title="Nudge left" type="button"><ToolIcon name="left" /></button>
              <button aria-label="Nudge frame right" className="ds-button is-secondary slicer-icon-button" onClick={() => nudgeFrame("x", 1)} title="Nudge right" type="button"><ToolIcon name="right" /></button>
              <button aria-label="Nudge frame down" className="ds-button is-secondary slicer-icon-button" onClick={() => nudgeFrame("y", 1)} title="Nudge down" type="button"><ToolIcon name="down" /></button>
            </div>
          </div>
        )}
        <div className="slicer-preview-export">
          <button className="ds-button is-primary" onClick={openExportModal} type="button">
            <ToolIcon name="export" />
            <span>Export</span>
          </button>
        </div>
      </section>

      <section className="slicer-panel slicer-map-panel">
        <div className="ds-section-heading">
          <h2>Map</h2>
          <HeadingInfo text="Click a cell to select it, or click empty space to add a new frame." />
        </div>
        <div
          className={`slicer-map${isMapFocused ? " is-keyboard-active" : ""}`}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) {
              setIsMapFocused(false);
            }
          }}
          onClick={(event) => {
            event.currentTarget.focus();
            setIsMapFocused(true);
          }}
          onFocus={() => setIsMapFocused(true)}
          onKeyDown={handleMapKeyDown}
          tabIndex={0}
        >
          <span className="slicer-map-zoom-label">{Math.round(zoom * 100)}%</span>
          <div className="slicer-map-toolbar">
            <button aria-label="Zoom out" className="ds-button is-secondary slicer-icon-button" onClick={() => setZoom((current) => Math.max(0.5, current - 0.25))} title="Zoom out" type="button">
              <ToolIcon name="minus" />
            </button>
            <button aria-label="Zoom in" className="ds-button is-secondary slicer-icon-button" onClick={() => setZoom((current) => Math.min(4, current + 0.25))} title="Zoom in" type="button">
              <ToolIcon name="plus" />
            </button>
          </div>
          {sheet ? (
            <div
              className={`slicer-map-sheet${dragState ? " is-dragging" : ""}`}
              onClick={addFrameAtPoint}
              style={{
                width: sheet.width * zoom,
                height: sheet.height * zoom,
                backgroundImage: `url("${sheet.url}")`,
                backgroundSize: `${sheet.width * zoom}px ${sheet.height * zoom}px`,
              }}
            >
              {frames.map((frame, index) => (
                <div
                  className={`slicer-frame-box${index === activeFrameIndex ? " is-active" : ""}`}
                  key={frame.id}
                  onClick={(event) => {
                    event.stopPropagation();
                    setActiveFrameIndex(index);
                  }}
                  onPointerDown={(event) => startFrameDrag(event, index, "move")}
                  role="button"
                  style={{
                    left: frame.x * zoom,
                    top: frame.y * zoom,
                    width: frame.w * zoom,
                    height: frame.h * zoom,
                  }}
                  tabIndex={0}
                >
                  <span className="slicer-frame-label">{index + 1}</span>
                  {index === activeFrameIndex && (
                    <>
                      <button
                        aria-label={`Delete frame ${index + 1}`}
                        className="slicer-frame-delete"
                        disabled={frames.length <= 1}
                        onClick={(event) => {
                          event.stopPropagation();
                          deleteFrame(index);
                        }}
                        onPointerDown={(event) => event.stopPropagation()}
                        type="button"
                      >
                        <ToolIcon name="trash" />
                      </button>
                      <span className="slicer-resize-handle is-nw" onPointerDown={(event) => startFrameDrag(event, index, "resize-nw")} />
                      <span className="slicer-resize-handle is-ne" onPointerDown={(event) => startFrameDrag(event, index, "resize-ne")} />
                      <span className="slicer-resize-handle is-sw" onPointerDown={(event) => startFrameDrag(event, index, "resize-sw")} />
                      <span className="slicer-resize-handle is-se" onPointerDown={(event) => startFrameDrag(event, index, "resize-se")} />
                    </>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p>Upload a spritesheet to map frame cells.</p>
          )}
        </div>

        <div className="slicer-map-timeline">
          <div className="ds-section-heading">
            <h2>Timeline</h2>
            <HeadingInfo text="Review, reorder, duplicate, and delete frame cells." />
          </div>
          <div className="slicer-filmstrip">
            {frames.map((frame, index) => (
              <article className={`slicer-frame-card${index === activeFrameIndex ? " is-active" : ""}`} key={frame.id}>
                <button
                  className="slicer-frame-thumb"
                  onClick={() => setActiveFrameIndex(index)}
                  style={{
                    "--thumb-width": `${frame.w}px`,
                    "--thumb-height": `${frame.h}px`,
                    "--thumb-image": sheet ? `url("${sheet.url}")` : "none",
                    "--thumb-position": `-${frame.x}px -${frame.y}px`,
                    "--thumb-bg-size": sheet ? `${sheet.width}px ${sheet.height}px` : "auto",
                  } as CSSProperties}
                  type="button"
                >
                  <span />
                </button>
                <strong>Frame {index + 1}</strong>
                <small>{frame.w}x{frame.h} at {frame.x},{frame.y}</small>
                <div>
                  <button aria-label={`Move frame ${index + 1} left`} onClick={() => moveFrame(index, -1)} title="Move left" type="button"><ToolIcon name="left" /></button>
                  <button aria-label={`Move frame ${index + 1} right`} onClick={() => moveFrame(index, 1)} title="Move right" type="button"><ToolIcon name="right" /></button>
                  <button aria-label={`Duplicate frame ${index + 1}`} onClick={() => duplicateFrame(index)} title="Duplicate" type="button"><ToolIcon name="copy" /></button>
                  <button aria-label={`Delete frame ${index + 1}`} disabled={frames.length <= 1} onClick={() => deleteFrame(index)} title="Delete" type="button"><ToolIcon name="trash" /></button>
                </div>
              </article>
            ))}
            <button className="slicer-add-frame" onClick={addFrame} type="button">Add frame</button>
          </div>
        </div>
      </section>

      {isExportOpen && (
        <div className={`slicer-export-modal${isExportClosing ? " is-closing" : isExportVisible ? " is-open" : ""}`} onClick={closeExportModal} role="presentation">
          <div className="slicer-export-panel" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-label="Export animation">
            <div className="ds-section-heading">
              <h2>Export</h2>
              <HeadingInfo text="Export CSS keyframes, an HTML canvas loop, or a GIF." />
            </div>
            <div className="ds-toggle-group slicer-export-tabs" aria-label="Export mode">
              <button className={exportMode === "css" ? "is-active" : ""} aria-pressed={exportMode === "css"} onClick={() => setExportMode("css")} type="button">CSS</button>
              <button className={exportMode === "canvas" ? "is-active" : ""} aria-pressed={exportMode === "canvas"} onClick={() => setExportMode("canvas")} type="button">Canvas JS</button>
              <button className={exportMode === "gif" ? "is-active" : ""} aria-pressed={exportMode === "gif"} onClick={() => setExportMode("gif")} type="button">GIF</button>
            </div>
            <div className="slicer-export-range">
              <label>
                Start
                <input className="ds-input" min="1" max={frames.length} onChange={(event) => setExportStartFrame(Number(event.target.value))} type="number" value={exportStartFrame} />
              </label>
              <label>
                End
                <input className="ds-input" min="1" max={frames.length} onChange={(event) => setExportEndFrame(Number(event.target.value))} type="number" value={exportEndFrame} />
              </label>
              <span>{exportFrames.length} frames</span>
            </div>
            {exportMode === "gif" && sheet && exportFrames[0] && (
              <div className="slicer-gif-preview" style={previewStyle}>
                <div
                  className="slicer-sprite"
                  style={{
                    width: `${exportFrames[0].w}px`,
                    height: `${exportFrames[0].h}px`,
                    backgroundPosition: `-${exportFrames[0].x}px -${exportFrames[0].y}px`,
                    animation: `${toClassName(animationName)}-preview ${Math.max(exportFrames.length / clamp(fps, 1), 0.1).toFixed(2)}s infinite step-end`,
                  }}
                />
                <style>
                  {`@keyframes ${toClassName(animationName)}-preview {
${exportFrames.map((frame, index) => `  ${exportFrames.length === 1 ? 100 : ((index / exportFrames.length) * 100).toFixed(2)}% { width: ${frame.w}px; height: ${frame.h}px; background-position: -${frame.x}px -${frame.y}px; }`).join("\n")}
  100% { width: ${exportFrames[0].w}px; height: ${exportFrames[0].h}px; background-position: -${exportFrames[0].x}px -${exportFrames[0].y}px; }
}`}
                </style>
              </div>
            )}
            <pre className="slicer-code" key={exportMode}>{activeCode}</pre>
            <div className="slicer-actions">
              <button className="ds-button is-secondary" disabled={!sheet} onClick={() => void downloadFrame()} type="button"><ToolIcon name="image" /><span>Save frame PNG</span></button>
              {exportMode === "gif" && (
                <button className="ds-button is-secondary" disabled={!sheet} onClick={() => void downloadGif()} type="button">
                  <ToolIcon name="download" />
                  <span>Download GIF</span>
                </button>
              )}
              {exportMode !== "gif" && (
                <button className={`ds-button is-primary slicer-resize-button slicer-copy-action${copied ? " is-copied" : ""}`} onClick={() => void copyCode()} type="button">
                  <ToolIcon name="copy" />
                  <span className="slicer-swap-label" aria-hidden="true">
                    <span className="is-copy">Copy code</span>
                    <span className="is-copied">Copied</span>
                  </span>
                  <span className="sr-only">{copied ? "Copied" : "Copy code"}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
