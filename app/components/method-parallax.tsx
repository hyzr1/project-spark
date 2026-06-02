"use client";

import { useEffect } from "react";

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

export function MethodParallax() {
  useEffect(() => {
    const section = document.getElementById("method");
    if (!section) return;

    const cards = Array.from(section.querySelectorAll<HTMLElement>("[data-method-card]"));
    const rails = Array.from(section.querySelectorAll<HTMLElement>("[data-method-rail]"));
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    let raf = 0;

    const update = () => {
      raf = 0;
      const viewportCenter = window.innerHeight * 0.52;
      let activeIndex = 0;
      let strongest = 0;

      cards.forEach((card, index) => {
        const rect = card.getBoundingClientRect();
        const center = rect.top + rect.height / 2;
        const distance = Math.abs(center - viewportCenter);
        const active = clamp(1 - distance / (window.innerHeight * 0.62));
        const eased = active * active * (3 - 2 * active);

        if (eased > strongest) {
          strongest = eased;
          activeIndex = index;
        }

        card.style.opacity = String(0.42 + eased * 0.58);
        card.style.transform = `translate3d(0, ${(1 - eased) * 34}px, 0) scale(${0.965 + eased * 0.035})`;
        card.style.setProperty("--method-card-glow", String(eased));
      });

      rails.forEach((rail, index) => {
        rail.toggleAttribute("data-active", index === activeIndex);
      });
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cards.forEach((card) => {
        card.style.opacity = "";
        card.style.transform = "";
        card.style.removeProperty("--method-card-glow");
      });
      rails.forEach((rail) => rail.removeAttribute("data-active"));
    };
  }, []);

  return null;
}
