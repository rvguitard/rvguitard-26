"use client";

import { useRef } from "react";

type VisualTileProps = {
  className: string;
  label: string;
  videoSrc?: string;
};

export function VisualTile({ className, label, videoSrc }: VisualTileProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

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

  return (
    <figure
      className={`visual-tile ${className}${videoSrc ? " has-video" : ""}`}
      onBlur={pauseVideo}
      onClick={playVideo}
      onFocus={playVideo}
      onMouseEnter={playVideo}
      onMouseLeave={pauseVideo}
      onPointerEnter={playVideo}
      onPointerLeave={pauseVideo}
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
  );
}
