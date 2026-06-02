"use client";

import { useEffect, useRef } from "react";

const CLEAN_SCENE_SCRIPT = "/clean-scene-engine.js?v=8";

type CleanSceneConfig = {
  color: number[];
  colorAmount: number;
  whiteAmount: number;
  cursorRadius: number;
  cursorPullStrength: number;
  backgroundParticleSpeed: number;
};

type CleanSceneRenderer = (
  canvas: HTMLCanvasElement,
  options?: {
    boundsElement?: HTMLElement;
    config?: Partial<CleanSceneConfig>;
  }
) => void | (() => void);

declare global {
  interface Window {
    createCleanSceneRenderer?: CleanSceneRenderer;
    cleanSceneSettings?: CleanSceneConfig;
  }
}

let cleanSceneScriptPromise: Promise<void> | null = null;

function loadCleanSceneScript() {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.createCleanSceneRenderer) return Promise.resolve();
  if (cleanSceneScriptPromise) return cleanSceneScriptPromise;

  cleanSceneScriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[data-clean-scene-engine="true"]'
    );

    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener(
        "error",
        () => reject(new Error("Clean scene renderer failed to load.")),
        { once: true }
      );
      return;
    }

    const script = document.createElement("script");
    script.src = CLEAN_SCENE_SCRIPT;
    script.async = true;
    script.dataset.cleanSceneEngine = "true";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Clean scene renderer failed to load."));
    document.head.appendChild(script);
  });

  return cleanSceneScriptPromise;
}

export function SignalField() {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let disposed = false;
    let cleanup: (() => void) | undefined;

    loadCleanSceneScript()
      .then(() => {
        if (
          disposed ||
          !rootRef.current ||
          !canvasRef.current ||
          !window.createCleanSceneRenderer
        ) {
          return;
        }

        const rendererCleanup = window.createCleanSceneRenderer(canvasRef.current, {
          boundsElement: rootRef.current,
        });

        if (typeof rendererCleanup === "function") {
          cleanup = rendererCleanup;
        }
      })
      .catch(() => {
        // Keep the hero readable if WebGL2 is unavailable or the renderer fails to load.
      });

    return () => {
      disposed = true;
      cleanup?.();
    };
  }, []);

  return (
    <div
      ref={rootRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden bg-[#020304]"
    >
      <canvas ref={canvasRef} className="block h-full w-full bg-[#020304]" />
    </div>
  );
}
