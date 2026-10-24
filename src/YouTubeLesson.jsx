import React, { useEffect, useRef, useState } from "react";
export default function YouTubeLesson({
  playlistId,
  videoId,
  onPlaylistLoaded,
  onVideoEnded,
}) {
  const mountRef = useRef(null);
  const playerRef = useRef(null);
  const endedRef = useRef(onVideoEnded);
  const loadedRef = useRef(false);
  const [error, setError] = useState("");

  useEffect(() => {
    endedRef.current = onVideoEnded;
  }, [onVideoEnded]);

  useEffect(() => {
    let cancelled = false;
    let player;

    setError("");
    loadedRef.current = false;

    async function initialise() {
      try {
        if (!playlistId) {
          setError("This course has no YouTube playlist ID configured.");
          return;
        }

        const YT = await loadYouTubeAPI();
        if (cancelled || !mountRef.current) return;

        player = new YT.Player(mountRef.current, {
          width: "100%",
          height: "390",
          playerVars: {
            listType: "playlist",
            list: playlistId,
            controls: 1,
            rel: 0,
          },
          events: {
            onReady(event) {
              if (cancelled) return;

              // Ask YouTube to load the playlist explicitly.
              event.target.cuePlaylist({
                listType: "playlist",
                list: playlistId,
                index: 0,
              });
            },

            onStateChange(event) {
              if (cancelled) return;

              // YouTube may populate playlist IDs after onReady.
              if (!loadedRef.current) {
                const ids = event.target.getPlaylist?.() || [];

                if (ids.length > 0) {
                  loadedRef.current = true;
                  onPlaylistLoaded(ids);
                }
              }

              if (event.data === YT.PlayerState.ENDED) {
                endedRef.current?.();
              }
            },

            onError(event) {
              if (cancelled) return;

              const messages = {
                2: "The YouTube playlist ID is invalid.",
                5: "This video cannot be played in the embedded player.",
                100: "The video or playlist was not found, or is private.",
                101: "The owner does not allow this video to be embedded.",
                150: "The owner does not allow this video to be embedded.",
                153: "YouTube requires additional client or referrer information.",
              };

              setError(
                messages[event.data] ||
                  `YouTube player error (${event.data}).`
              );
            },
          },
        });

        playerRef.current = player;
      } catch {
        if (!cancelled) {
          setError("Could not load the YouTube player. Check your connection.");
        }
      }
    }

    initialise();

    return () => {
      cancelled = true;
      player?.destroy?.();
      playerRef.current = null;
    };
  }, [playlistId, onPlaylistLoaded]);

  useEffect(() => {
    const player = playerRef.current;

    if (
      !player ||
      !videoId ||
      typeof player.loadVideoById !== "function"
    ) {
      return;
    }

    player.loadVideoById(videoId);
  }, [videoId]);

  return (
    <div>
      <div ref={mountRef} />
      {error && (
        <p className="sm-message" role="status">
          {error}
        </p>
      )}
    </div>
  );
}
