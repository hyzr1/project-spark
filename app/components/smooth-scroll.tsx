"use client";

import { useEffect } from "react";

export function SmoothScroll() {
  useEffect(() => {
    const revealEls = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
    const show = (el: HTMLElement) => el.classList.add("is-visible");

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          show(entry.target as HTMLElement);
          io.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0 }
    );

    revealEls.forEach((el) => io.observe(el));

    let sweepRaf = 0;
    const sweep = () => {
      sweepRaf = 0;
      const viewHeight = window.innerHeight;
      for (const el of revealEls) {
        if (el.classList.contains("is-visible")) continue;
        if (el.getBoundingClientRect().top < viewHeight * 0.94) show(el);
      }
    };

    const onScroll = () => {
      if (!sweepRaf) sweepRaf = requestAnimationFrame(sweep);
    };

    sweep();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      if (sweepRaf) cancelAnimationFrame(sweepRaf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      io.disconnect();
    };
  }, []);

  return null;
}
