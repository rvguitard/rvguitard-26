"use client";

import { type CSSProperties, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type RecentTrack = {
  album_image_url: string | null;
  artist_name: string;
  created_at: string;
  track_url: string | null;
  track_name: string;
};

const fallbackTrack: RecentTrack = {
  album_image_url: null,
  artist_name: "Isaiah Rashad, Dominic Fike",
  created_at: "",
  track_url: null,
  track_name: "CAMERAS",
};

export function MusicPlayer() {
  const [track, setTrack] = useState<RecentTrack>(fallbackTrack);

  useEffect(() => {
    if (!supabase) {
      return;
    }

    const client = supabase;
    let isMounted = true;

    async function loadRecentTrack() {
      const { data, error } = await client
        .from("spotify_recently_played")
        .select("track_name,artist_name,album_image_url,track_url,created_at")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!isMounted || error || !data) {
        return;
      }

      setTrack(data as RecentTrack);
    }

    loadRecentTrack();

    const interval = window.setInterval(loadRecentTrack, 60_000);

    return () => {
      isMounted = false;
      window.clearInterval(interval);
    };
  }, []);

  const content = (
    <>
      <div
        className={`music-disc${track.album_image_url ? " has-cover" : ""}`}
        aria-hidden="true"
        style={
          track.album_image_url
            ? ({
                "--album-cover": `url("${track.album_image_url}")`,
              } as CSSProperties)
            : undefined
        }
      >
        <span className="music-label" />
      </div>
      <div className="music-copy">
        <p>{track.track_name}</p>
        <span>{track.artist_name}</span>
      </div>
    </>
  );

  return (
    <aside className="music-player" aria-label="Currently playing">
      {track.track_url ? (
        <a
          aria-label={`Open ${track.track_name} on Spotify`}
          className="music-link"
          href={track.track_url}
          rel="noreferrer"
          target="_blank"
        >
          {content}
        </a>
      ) : (
        content
      )}
    </aside>
  );
}
