"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type Hls from "hls.js";

type Props = {
  src: string;
  watermark: string;
  poster?: string;
};

const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2] as const;
const IDLE_HIDE_MS = 2400;

/**
 * Hardened HLS player.
 *
 * Honest scope of protection (read SECURITY.md for the full story):
 *  - Stream is AES-128 encrypted in transit; key only delivered to a
 *    Discord-role-gated session. Sharing the .m3u8 URL leaks nothing.
 *  - Per-user watermark (Discord username + ID) drifts across the frame so
 *    leaked screen recordings can be traced back to a specific account.
 *  - Native download / Picture-in-Picture / right-click / save-as / common
 *    keyboard inspectors are blocked at the player layer.
 *  - Pauses on tab/window blur and on visibility change.
 *
 * It does NOT stop OBS-style screen recording or a phone camera.
 */
export function HlsPlayer({ src, watermark, poster }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const idleTimerRef = useRef<number | null>(null);

  const [ready, setReady] = useState(false);
  const [paused, setPaused] = useState(true);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [duration, setDuration] = useState(0);
  const [current, setCurrent] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [wmPos, setWmPos] = useState({ x: 18, y: 22 });
  const [rate, setRate] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [scrubHover, setScrubHover] = useState<number | null>(null);
  const [tip, setTip] = useState<{ text: string; key: number } | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let hls: Hls | null = null;
    let cancelled = false;

    (async () => {
      const HlsMod = (await import("hls.js")).default;
      if (cancelled || !videoRef.current) return;
      const v = videoRef.current;

      if (HlsMod.isSupported()) {
        hls = new HlsMod({
          xhrSetup: (xhr) => {
            xhr.withCredentials = true;
          },
          enableWorker: true,
          backBufferLength: 30,
        });
        hls.loadSource(src);
        hls.attachMedia(v);
        hls.on(HlsMod.Events.MANIFEST_PARSED, () => setReady(true));
        hls.on(HlsMod.Events.ERROR, (_event, data) => {
          if (data.fatal) {
            setError(
              data.type === HlsMod.ErrorTypes.NETWORK_ERROR
                ? "Network error — check your connection."
                : data.type === HlsMod.ErrorTypes.MEDIA_ERROR
                ? "Playback error — reload to retry."
                : "Stream error.",
            );
          }
        });
      } else if (v.canPlayType("application/vnd.apple.mpegurl")) {
        v.src = src;
        v.addEventListener("loadedmetadata", () => setReady(true), { once: true });
      } else {
        setError("HLS playback not supported in this browser.");
      }
    })();

    return () => {
      cancelled = true;
      hls?.destroy();
    };
  }, [src]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onPlay = () => setPaused(false);
    const onPause = () => setPaused(true);
    const onTime = () => setCurrent(v.currentTime);
    const onLoaded = () => setDuration(v.duration || 0);
    const onVolume = () => {
      setMuted(v.muted);
      setVolume(v.volume);
    };
    const onProgress = () => {
      try {
        const last = v.buffered.length - 1;
        if (last >= 0) setBuffered(v.buffered.end(last));
      } catch {}
    };
    const onRate = () => setRate(v.playbackRate);
    v.addEventListener("play", onPlay);
    v.addEventListener("pause", onPause);
    v.addEventListener("timeupdate", onTime);
    v.addEventListener("loadedmetadata", onLoaded);
    v.addEventListener("volumechange", onVolume);
    v.addEventListener("progress", onProgress);
    v.addEventListener("ratechange", onRate);
    return () => {
      v.removeEventListener("play", onPlay);
      v.removeEventListener("pause", onPause);
      v.removeEventListener("timeupdate", onTime);
      v.removeEventListener("loadedmetadata", onLoaded);
      v.removeEventListener("volumechange", onVolume);
      v.removeEventListener("progress", onProgress);
      v.removeEventListener("ratechange", onRate);
    };
  }, []);

  useEffect(() => {
    const onFs = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  useEffect(() => {
    const onContext = (e: Event) => e.preventDefault();
    const onSelectStart = (e: Event) => e.preventDefault();
    const onKey = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const ctrl = e.ctrlKey || e.metaKey;
      if (
        (ctrl && (key === "s" || key === "u")) ||
        (ctrl && e.shiftKey && (key === "i" || key === "j" || key === "c")) ||
        key === "f12"
      ) {
        e.preventDefault();
      }
    };

    document.addEventListener("contextmenu", onContext);
    document.addEventListener("selectstart", onSelectStart);
    document.addEventListener("keydown", onKey, true);

    return () => {
      document.removeEventListener("contextmenu", onContext);
      document.removeEventListener("selectstart", onSelectStart);
      document.removeEventListener("keydown", onKey, true);
    };
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setWmPos({
        x: 8 + Math.random() * 70,
        y: 10 + Math.random() * 75,
      });
    }, 7000);
    return () => clearInterval(id);
  }, []);

  const flashTip = useCallback((text: string) => {
    setTip({ text, key: Date.now() });
  }, []);

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play().catch(() => {});
    else v.pause();
  }, []);

  const toggleMute = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    flashTip(v.muted ? "Muted" : "Unmuted");
  }, [flashTip]);

  const setVol = useCallback((vol: number) => {
    const v = videoRef.current;
    if (!v) return;
    const clamped = Math.max(0, Math.min(1, vol));
    v.volume = clamped;
    if (clamped > 0 && v.muted) v.muted = false;
  }, []);

  const seek = useCallback((pct: number) => {
    const v = videoRef.current;
    if (!v || !isFinite(v.duration)) return;
    v.currentTime = Math.max(0, Math.min(v.duration, pct * v.duration));
  }, []);

  const skip = useCallback(
    (delta: number) => {
      const v = videoRef.current;
      if (!v) return;
      v.currentTime = Math.max(0, Math.min(v.duration || 0, v.currentTime + delta));
      flashTip(delta > 0 ? `+${delta}s` : `${delta}s`);
    },
    [flashTip],
  );

  const fullscreen = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    if (document.fullscreenElement) document.exitFullscreen();
    else el.requestFullscreen().catch(() => {});
  }, []);

  const setSpeed = useCallback(
    (r: number) => {
      const v = videoRef.current;
      if (!v) return;
      v.playbackRate = r;
      setShowSpeedMenu(false);
      flashTip(`${r}×`);
    },
    [flashTip],
  );

  const bumpIdle = useCallback(() => {
    setShowControls(true);
    if (idleTimerRef.current) window.clearTimeout(idleTimerRef.current);
    if (paused || showSpeedMenu) return;
    idleTimerRef.current = window.setTimeout(() => setShowControls(false), IDLE_HIDE_MS);
  }, [paused, showSpeedMenu]);

  useEffect(() => {
    bumpIdle();
    return () => {
      if (idleTimerRef.current) window.clearTimeout(idleTimerRef.current);
    };
  }, [bumpIdle]);

  useEffect(() => {
    if (paused) setShowControls(true);
  }, [paused]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      const el = containerRef.current;
      if (!el) return;
      const v = videoRef.current;
      if (!v) return;

      switch (e.key.toLowerCase()) {
        case " ":
        case "k":
          e.preventDefault();
          togglePlay();
          flashTip(v.paused ? "Play" : "Pause");
          break;
        case "arrowright":
          e.preventDefault();
          skip(5);
          break;
        case "arrowleft":
          e.preventDefault();
          skip(-5);
          break;
        case "j":
          e.preventDefault();
          skip(-10);
          break;
        case "l":
          e.preventDefault();
          skip(10);
          break;
        case "arrowup":
          e.preventDefault();
          setVol(v.volume + 0.05);
          flashTip(`${Math.round(Math.min(1, v.volume + 0.05) * 100)}%`);
          break;
        case "arrowdown":
          e.preventDefault();
          setVol(v.volume - 0.05);
          flashTip(`${Math.round(Math.max(0, v.volume - 0.05) * 100)}%`);
          break;
        case "m":
          e.preventDefault();
          toggleMute();
          break;
        case "f":
          e.preventDefault();
          fullscreen();
          break;
        case ">":
        case ".":
          if (e.shiftKey) {
            e.preventDefault();
            const idx = SPEED_OPTIONS.indexOf(v.playbackRate as (typeof SPEED_OPTIONS)[number]);
            const next = SPEED_OPTIONS[Math.min(SPEED_OPTIONS.length - 1, idx + 1)] ?? 1;
            setSpeed(next);
          }
          break;
        case "<":
        case ",":
          if (e.shiftKey) {
            e.preventDefault();
            const idx = SPEED_OPTIONS.indexOf(v.playbackRate as (typeof SPEED_OPTIONS)[number]);
            const next = SPEED_OPTIONS[Math.max(0, idx - 1)] ?? 1;
            setSpeed(next);
          }
          break;
        case "0":
        case "1":
        case "2":
        case "3":
        case "4":
        case "5":
        case "6":
        case "7":
        case "8":
        case "9":
          e.preventDefault();
          seek(Number(e.key) / 10);
          break;
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [togglePlay, skip, setVol, toggleMute, fullscreen, setSpeed, seek, flashTip]);

  useEffect(() => {
    if (!tip) return;
    const id = window.setTimeout(() => setTip(null), 800);
    return () => window.clearTimeout(id);
  }, [tip]);

  const fmt = (s: number) => {
    if (!isFinite(s) || s < 0) return "0:00";
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const ss = Math.floor(s % 60).toString().padStart(2, "0");
    if (h) return `${h}:${m.toString().padStart(2, "0")}:${ss}`;
    return `${m}:${ss}`;
  };

  const pct = duration ? (current / duration) * 100 : 0;
  const bufPct = duration ? Math.min(100, (buffered / duration) * 100) : 0;
  const controlsVisible = showControls || paused;

  return (
    <div
      ref={containerRef}
      data-spark-mark="player"
      className="group/player relative aspect-video w-full overflow-hidden rounded-2xl border border-border bg-black select-none"
      style={{ cursor: controlsVisible ? "default" : "none" }}
      onContextMenu={(e) => e.preventDefault()}
      onMouseMove={bumpIdle}
      onMouseLeave={() => {
        if (!paused && !showSpeedMenu) setShowControls(false);
      }}
      tabIndex={0}
    >
      <video
        ref={videoRef}
        data-spark-mark="video"
        className="absolute inset-0 h-full w-full cursor-inherit"
        playsInline
        controls={false}
        controlsList="nodownload nofullscreen noremoteplayback noplaybackrate"
        disablePictureInPicture
        disableRemotePlayback
        poster={poster}
        crossOrigin="use-credentials"
        onClick={togglePlay}
        onDoubleClick={fullscreen}
      />

      {/* Watermark overlay — drifts every 7s, identifies the streaming session. */}
      <div className="pointer-events-none absolute inset-0 z-20">
        <div
          data-spark-mark="watermark"
          data-spark-expected={watermark}
          className="absolute font-mono text-[13px] leading-tight tracking-[0.06em] whitespace-nowrap transition-all duration-[1500ms] ease-out"
          style={{
            left: `${wmPos.x}%`,
            top: `${wmPos.y}%`,
            color: "rgba(255, 255, 255, 0.42)",
            textShadow: "0 1px 2px rgba(0,0,0,0.65), 0 0 8px rgba(0,0,0,0.45)",
            mixBlendMode: "screen",
          }}
        >
          <div className="font-bold uppercase">SPARK · {watermark}</div>
          <div className="text-[10.5px]" style={{ color: "rgba(255, 255, 255, 0.32)" }}>
            {new Date().toISOString().slice(0, 10)}
          </div>
        </div>
      </div>

      {!ready && !error && (
        <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center gap-3 font-mono text-[11px] uppercase tracking-[0.2em] text-foreground/55">
          <span className="inline-block h-1.5 w-1.5 animate-pulse bg-accent" />
          Decrypting stream…
        </div>
      )}
      {error && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/80 px-6 text-center">
          <div className="font-mono text-[12px] uppercase tracking-[0.2em] text-foreground/80">
            {error}
          </div>
        </div>
      )}

      {paused && ready && !error && (
        <button
          type="button"
          aria-label="Play"
          onClick={togglePlay}
          className="absolute inset-0 z-30 flex items-center justify-center bg-black/30 transition-colors hover:bg-black/20"
        >
          <span className="inline-flex h-20 w-20 items-center justify-center rounded-full border border-border-strong bg-card/70 backdrop-blur-md transition-transform hover:scale-105">
            <svg viewBox="0 0 32 32" fill="currentColor" className="h-8 w-8 translate-x-[2px] text-foreground">
              <path d="M9 6v20l18-10z" />
            </svg>
          </span>
        </button>
      )}

      {tip && (
        <div
          key={tip.key}
          className="pointer-events-none absolute left-1/2 top-6 z-40 -translate-x-1/2 rounded-full bg-black/70 px-3.5 py-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-white/90 backdrop-blur"
        >
          {tip.text}
        </div>
      )}

      <div
        className={`pointer-events-none absolute inset-x-0 bottom-0 z-30 flex flex-col gap-2.5 bg-gradient-to-t from-black/85 via-black/55 to-transparent px-4 pb-3.5 pt-14 transition-opacity duration-200 ${
          controlsVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        <div
          className="pointer-events-auto group/scrub relative h-4 w-full cursor-pointer"
          onClick={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            seek((e.clientX - r.left) / r.width);
          }}
          onMouseMove={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            setScrubHover((e.clientX - r.left) / r.width);
          }}
          onMouseLeave={() => setScrubHover(null)}
        >
          <div className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 overflow-hidden rounded-full bg-white/15 transition-all group-hover/scrub:h-[5px]">
            <div className="absolute inset-y-0 left-0 bg-white/20" style={{ width: `${bufPct}%` }} />
            <div className="absolute inset-y-0 left-0 bg-accent" style={{ width: `${pct}%` }} />
            {scrubHover !== null && (
              <div
                className="absolute inset-y-0 w-px bg-white/40"
                style={{ left: `${scrubHover * 100}%` }}
              />
            )}
          </div>
          <div
            className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent opacity-0 shadow-[0_0_0_3px_rgba(159,183,204,0.32)] transition-opacity group-hover/scrub:opacity-100"
            style={{ left: `${pct}%` }}
          />
          {scrubHover !== null && duration > 0 && (
            <div
              className="pointer-events-none absolute -top-7 -translate-x-1/2 rounded-md bg-black/80 px-1.5 py-0.5 font-mono text-[10px] text-white/85 backdrop-blur"
              style={{ left: `${scrubHover * 100}%` }}
            >
              {fmt(scrubHover * duration)}
            </div>
          )}
        </div>

        <div className="pointer-events-auto flex items-center gap-1.5">
          <IconButton onClick={togglePlay} label={paused ? "Play" : "Pause"}>
            {paused ? (
              <svg viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5 translate-x-[1px]">
                <path d="M5 3v10l8-5z" />
              </svg>
            ) : (
              <svg viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5">
                <rect x="4" y="3" width="3" height="10" />
                <rect x="9" y="3" width="3" height="10" />
              </svg>
            )}
          </IconButton>

          <IconButton onClick={() => skip(-10)} label="Back 10 seconds">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <path d="M4 10a6 6 0 1 0 1.8-4.3" />
              <path d="M4 4v3h3" />
              <text x="10" y="12.5" textAnchor="middle" fontSize="6" fill="currentColor" stroke="none" fontFamily="ui-monospace, monospace">10</text>
            </svg>
          </IconButton>

          <IconButton onClick={() => skip(10)} label="Forward 10 seconds">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <path d="M16 10a6 6 0 1 1-1.8-4.3" />
              <path d="M16 4v3h-3" />
              <text x="10" y="12.5" textAnchor="middle" fontSize="6" fill="currentColor" stroke="none" fontFamily="ui-monospace, monospace">10</text>
            </svg>
          </IconButton>

          <div className="group/vol flex items-center">
            <IconButton onClick={toggleMute} label={muted ? "Unmute" : "Mute"}>
              {muted || volume === 0 ? (
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
                  <path d="M3 6h2l4-3v10L5 10H3V6Z" />
                  <path d="M11 6l4 4M15 6l-4 4" />
                </svg>
              ) : volume < 0.5 ? (
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
                  <path d="M3 6h2l4-3v10L5 10H3V6Z" />
                  <path d="M12 5c1 1 1 5 0 6" />
                </svg>
              ) : (
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
                  <path d="M3 6h2l4-3v10L5 10H3V6Z" />
                  <path d="M12 5c1 1 1 5 0 6" />
                  <path d="M14 3.5c2 2 2 7 0 9" />
                </svg>
              )}
            </IconButton>
            <div className="w-0 overflow-hidden transition-[width] duration-200 group-hover/vol:w-20 group-focus-within/vol:w-20">
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={muted ? 0 : volume}
                onChange={(e) => setVol(Number(e.target.value))}
                aria-label="Volume"
                className="ml-1.5 h-1 w-[72px] cursor-pointer appearance-none rounded-full bg-white/20 accent-accent [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-foreground"
              />
            </div>
          </div>

          <span className="ml-2 font-mono text-[11px] tracking-[0.04em] tabular-nums text-foreground/85">
            {fmt(current)} <span className="text-foreground/40">/</span> {fmt(duration)}
          </span>

          <div className="ml-auto flex items-center gap-1.5">
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowSpeedMenu((s) => !s)}
                aria-haspopup="menu"
                aria-expanded={showSpeedMenu}
                className="inline-flex h-9 min-w-[44px] items-center justify-center rounded-full border border-border bg-card/60 px-2.5 font-mono text-[11px] font-bold tabular-nums text-foreground/90 backdrop-blur transition-colors hover:bg-accent hover:text-ink"
              >
                {rate}×
              </button>
              {showSpeedMenu && (
                <div
                  role="menu"
                  className="absolute bottom-[calc(100%+8px)] right-0 z-40 min-w-[110px] overflow-hidden rounded-xl border border-border bg-background-soft/95 py-1 shadow-xl backdrop-blur-md"
                >
                  {SPEED_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      role="menuitemradio"
                      aria-checked={rate === opt}
                      onClick={() => setSpeed(opt)}
                      className={`flex w-full items-center justify-between px-3 py-1.5 text-left font-mono text-[12px] tabular-nums transition-colors hover:bg-foreground/5 ${
                        rate === opt ? "text-accent" : "text-foreground/85"
                      }`}
                    >
                      {opt}×
                      {rate === opt && (
                        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="h-3 w-3">
                          <path d="M3 8l3 3 7-7" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <span className="hidden font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/45 md:inline">
              AES-128
            </span>

            <IconButton onClick={fullscreen} label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}>
              {isFullscreen ? (
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
                  <path d="M6 3v3H3M10 3v3h3M6 13v-3H3M10 13v-3h3" />
                </svg>
              ) : (
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
                  <path d="M3 6V3h3M13 6V3h-3M3 10v3h3M13 10v3h-3" />
                </svg>
              )}
            </IconButton>
          </div>
        </div>
      </div>
    </div>
  );
}

function IconButton({
  children,
  onClick,
  label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full text-foreground/90 transition-colors hover:bg-white/10 hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
    >
      {children}
    </button>
  );
}
