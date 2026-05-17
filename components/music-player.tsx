export function MusicPlayer() {
  return (
    <aside className="music-player" aria-label="Currently playing">
      <div className="music-disc" aria-hidden="true">
        <span className="music-label" />
      </div>
      <div className="music-copy">
        <p>CAMERAS</p>
        <span>Isaiah Rashad, Dominic Fike</span>
      </div>
    </aside>
  );
}
