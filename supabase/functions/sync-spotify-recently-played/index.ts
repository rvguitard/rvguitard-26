type SpotifyTokenResponse = {
  access_token: string;
};

type SpotifyRecentlyPlayedResponse = {
  items?: Array<{
    played_at: string;
    track: {
      external_urls?: {
        spotify?: string;
      };
      name: string;
      artists: Array<{
        name: string;
      }>;
      album?: {
        images?: Array<{
          url: string;
        }>;
      };
    };
  }>;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const spotifyClientId = Deno.env.get("SPOTIFY_CLIENT_ID");
  const spotifyClientSecret = Deno.env.get("SPOTIFY_CLIENT_SECRET");
  const spotifyRefreshToken = Deno.env.get("SPOTIFY_REFRESH_TOKEN");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (
    !spotifyClientId ||
    !spotifyClientSecret ||
    !spotifyRefreshToken ||
    !supabaseUrl ||
    !supabaseServiceRoleKey
  ) {
    return Response.json(
      { error: "Missing required environment variables." },
      { headers: corsHeaders, status: 500 },
    );
  }

  const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: spotifyRefreshToken,
    }),
    headers: {
      Authorization: `Basic ${btoa(`${spotifyClientId}:${spotifyClientSecret}`)}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    method: "POST",
  });

  if (!tokenResponse.ok) {
    return Response.json(
      { error: "Could not refresh Spotify access token." },
      { headers: corsHeaders, status: tokenResponse.status },
    );
  }

  const token = (await tokenResponse.json()) as SpotifyTokenResponse;
  const recentlyPlayedResponse = await fetch(
    "https://api.spotify.com/v1/me/player/recently-played?limit=1",
    {
      headers: {
        Authorization: `Bearer ${token.access_token}`,
      },
    },
  );

  if (!recentlyPlayedResponse.ok) {
    return Response.json(
      { error: "Could not fetch recently played track." },
      { headers: corsHeaders, status: recentlyPlayedResponse.status },
    );
  }

  const recentlyPlayed =
    (await recentlyPlayedResponse.json()) as SpotifyRecentlyPlayedResponse;
  const latestItem = recentlyPlayed.items?.[0];

  if (!latestItem) {
    return Response.json({ synced: false }, { headers: corsHeaders });
  }

  const latestTrack = {
    album_image_url: latestItem.track.album?.images?.[0]?.url ?? null,
    artist_name: latestItem.track.artists.map((artist) => artist.name).join(", "),
    created_at: latestItem.played_at,
    track_url: latestItem.track.external_urls?.spotify ?? null,
    track_name: latestItem.track.name,
  };

  const writeResponse = await fetch(`${supabaseUrl}/rest/v1/spotify_recently_played`, {
    body: JSON.stringify(latestTrack),
    headers: {
      apikey: supabaseServiceRoleKey,
      Authorization: `Bearer ${supabaseServiceRoleKey}`,
      "Content-Type": "application/json",
      Prefer: "resolution=ignore-duplicates",
    },
    method: "POST",
  });

  if (!writeResponse.ok) {
    return Response.json(
      { error: "Could not write recently played track." },
      { headers: corsHeaders, status: writeResponse.status },
    );
  }

  return Response.json(
    {
      synced: true,
      track: latestTrack,
    },
    { headers: corsHeaders },
  );
});
