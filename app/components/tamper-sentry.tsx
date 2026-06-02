"use client";

import { useEffect, useState } from "react";

/**
 * Hardened-client tamper detection for the lecture page.
 *
 * Detects (within ~250ms):
 *   - Any `data-spark-mark` element being removed from the DOM
 *   - Any computed-style change that hides or collapses the watermark
 *   - Any modification to the watermark's expected text content
 *   - The video element being removed
 *
 * On any detection:
 *   1. Mark `tampered` state and render a full-screen kill overlay
 *   2. Pause + nuke every <video> on the page
 *   3. Send a tamper-report beacon to the server
 *   4. Hit /api/lectures/kill-session to clear the NextAuth session cookie
 *   5. Hard-navigate to the homepage
 *
 * Real anti-screen-record requires DRM. See SECURITY.md.
 */

const MARK_ATTR = "data-spark-mark";
const EXPECTED_ATTR = "data-spark-expected";

export function TamperSentry() {
  const [tampered, setTampered] = useState<string | null>(null);

  useEffect(() => {
    let triggered = false;
    let bootGrace = true;
    let navigating = false;
    const graceTimer = setTimeout(() => {
      bootGrace = false;
    }, 800);

    const trigger = (reason: string) => {
      if (triggered || navigating) return;
      triggered = true;
      setTampered(reason);

      try {
        document.querySelectorAll("video").forEach((v) => {
          try {
            v.pause();
            v.currentTime = 0;
            v.removeAttribute("src");
            v.load();
          } catch {}
        });
      } catch {}

      const payload = JSON.stringify({
        reason,
        path: window.location.pathname,
        ts: Date.now(),
      });
      try {
        navigator.sendBeacon?.(
          "/api/lectures/kill-session",
          new Blob([payload], { type: "application/json" }),
        );
      } catch {}

      const killReq = fetch("/api/lectures/kill-session", {
        method: "POST",
        credentials: "include",
        keepalive: true,
        headers: { "Content-Type": "application/json" },
        body: payload,
      }).catch(() => {});

      const navigate = () => {
        try {
          window.location.replace("/");
        } catch {
          window.location.href = "/";
        }
      };

      Promise.race([
        killReq,
        new Promise((r) => setTimeout(r, 1500)),
      ]).then(navigate);
    };

    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.removedNodes.length) {
          for (const node of m.removedNodes) {
            if (!(node instanceof Element)) continue;
            if (
              node.hasAttribute?.(MARK_ATTR) ||
              node.querySelector?.(`[${MARK_ATTR}]`)
            ) {
              return trigger(`removed:${node.getAttribute?.(MARK_ATTR) ?? "subtree"}`);
            }
          }
        }
        if (m.type === "characterData" && m.target.parentElement) {
          const marked = m.target.parentElement.closest(`[${MARK_ATTR}]`);
          if (marked && marked.getAttribute(EXPECTED_ATTR)) {
            const expected = marked.getAttribute(EXPECTED_ATTR) ?? "";
            if (!(marked.textContent ?? "").includes(expected)) {
              return trigger(`text-tamper:${marked.getAttribute(MARK_ATTR)}`);
            }
          }
        }
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    const disarmForNavigation = () => {
      navigating = true;
      observer.disconnect();
      clearInterval(tick);
    };

    const onDocClick = (e: MouseEvent) => {
      const link = (e.target as HTMLElement | null)?.closest?.("a[href]") as
        | HTMLAnchorElement
        | null;
      if (!link) return;
      const href = link.getAttribute("href") || "";
      const target = link.getAttribute("target");
      if (href.startsWith("#")) return;
      if (target === "_blank") return;
      if (e.ctrlKey || e.metaKey || e.shiftKey || e.button === 1) return;
      disarmForNavigation();
    };
    const onDocSubmit = () => disarmForNavigation();
    const onPopstate = () => disarmForNavigation();
    const onBeforeUnload = () => disarmForNavigation();

    document.addEventListener("click", onDocClick, true);
    document.addEventListener("submit", onDocSubmit, true);
    window.addEventListener("popstate", onPopstate);
    window.addEventListener("beforeunload", onBeforeUnload);

    const onVisibility = () => {
      if (bootGrace || triggered) return;
      if (document.hidden) trigger("tab-hidden");
    };
    const onWindowBlur = () => {
      if (bootGrace || triggered) return;
      trigger("focus-lost");
    };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("blur", onWindowBlur);

    const tick = setInterval(() => {
      if (triggered) return;
      const marked = document.querySelectorAll<HTMLElement>(`[${MARK_ATTR}]`);
      if (marked.length === 0) return;

      for (const el of marked) {
        const mark = el.getAttribute(MARK_ATTR) ?? "?";

        const cs = window.getComputedStyle(el);
        if (cs.display === "none") return trigger(`css-display-none:${mark}`);
        if (cs.visibility === "hidden") return trigger(`css-visibility-hidden:${mark}`);

        if (mark === "watermark") {
          const op = parseFloat(cs.opacity || "1");
          if (op < 0.18) return trigger(`css-opacity-low:${mark}:${op}`);
          const rect = el.getBoundingClientRect();
          if (rect.width < 1 || rect.height < 1) return trigger(`zero-rect:${mark}`);

          const expected = el.getAttribute(EXPECTED_ATTR) ?? "";
          if (expected && !(el.textContent ?? "").includes(expected)) {
            if (!bootGrace) return trigger(`text-missing:${mark}`);
          }
        }
      }
    }, 250);

    return () => {
      clearTimeout(graceTimer);
      clearInterval(tick);
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("blur", onWindowBlur);
      document.removeEventListener("click", onDocClick, true);
      document.removeEventListener("submit", onDocSubmit, true);
      window.removeEventListener("popstate", onPopstate);
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
  }, []);

  if (!tampered) return null;

  return (
    <div
      data-spark-kill
      className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/95 backdrop-blur-2xl"
    >
      <div className="relative mx-auto max-w-md px-6 text-center">
        <div className="relative border-2 border-warn bg-background-soft p-8">
          <div className="inline-flex items-center gap-0">
            <span className="bg-warn px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-ink">
              Session ended
            </span>
            <span className="border border-warn px-2 py-1 font-mono text-[10px] uppercase tracking-[0.22em] text-warn">
              Tampering detected
            </span>
          </div>
          <h1 className="mt-5 font-display text-[28px] font-extrabold uppercase leading-[1.05] tracking-[-0.018em]">
            Signing you out.
          </h1>
          <p className="mt-3 text-[13.5px] leading-[1.65] text-foreground/65">
            The lecture player detected unauthorized DOM, style, or content
            modification. Your session has been ended and the event was logged
            against your Discord identity.
          </p>
          <div className="mt-5 border border-border bg-background px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-warn">
            Reason · {tampered}
          </div>
        </div>
      </div>
    </div>
  );
}
