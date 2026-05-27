"use client";

import { KeyboardEvent, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type VisualTileProps = {
  className: string;
  label: string;
  videoSrc?: string;
};

export function VisualTile({ className, label, videoSrc }: VisualTileProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalClosing, setIsModalClosing] = useState(false);

  useEffect(() => {
    if (!isModalOpen) {
      return;
    }

    const closeOnEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        closeModal();
      }
    };

    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [isModalOpen]);

  function playVideo() {
    if (!videoRef.current) {
      return;
    }

    videoRef.current.muted = true;
    void videoRef.current.play();
  }

  function pauseVideo() {
    videoRef.current?.pause();
  }

  function openModal() {
    if (!videoSrc) {
      return;
    }

    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalClosing(true);
    window.setTimeout(() => {
      setIsModalOpen(false);
      setIsModalClosing(false);
    }, 180);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openModal();
    }
  }

  return (
    <>
    <figure
      className={`visual-tile ${className}${videoSrc ? " has-video" : ""}`}
      onBlur={pauseVideo}
      onClick={openModal}
      onFocus={playVideo}
      onKeyDown={handleKeyDown}
      onMouseEnter={playVideo}
      onMouseLeave={pauseVideo}
      onPointerEnter={playVideo}
      onPointerLeave={pauseVideo}
      role={videoSrc ? "button" : undefined}
      tabIndex={videoSrc ? 0 : undefined}
    >
      {videoSrc ? (
        <video
          aria-label={`${label} preview`}
          className="tile-video"
          loop
          muted
          playsInline
          preload="metadata"
          ref={videoRef}
          src={videoSrc}
        />
      ) : (
        <div className="tile-art" />
      )}
      <figcaption>{label}</figcaption>
    </figure>

      {isModalOpen && videoSrc && typeof document !== "undefined" ? createPortal(
        <div
          aria-label={`${label} video preview`}
          aria-modal="true"
          className={`video-modal${isModalClosing ? " is-closing" : ""}`}
          onClick={closeModal}
          role="dialog"
        >
          <div className="video-modal-panel" onClick={(event) => event.stopPropagation()}>
            <video
              autoPlay
              className="video-modal-player"
              controls
              loop
              muted
              playsInline
              src={videoSrc}
            />
          </div>
        </div>,
        document.body,
      ) : null}
    </>
  );
}
