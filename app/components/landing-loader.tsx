"use client";

import { useEffect, useState } from "react";

export function LandingLoader() {
  const [count, setCount] = useState(0);
  const [done, setDone] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setGone(true);
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const start = performance.now();
    const duration = 1200;
    let tickTimer = 0;
    let finishTimer = 0;
    let exitTimer = 0;

    const update = () => {
      const now = performance.now();
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setCount(Math.floor(eased * 100));
    };

    const finish = () => {
      window.clearInterval(tickTimer);
      setCount(100);

      setDone(true);
      exitTimer = window.setTimeout(() => {
        setGone(true);
        document.body.style.overflow = previousOverflow;
      }, 760);
    };

    tickTimer = window.setInterval(update, 32);
    finishTimer = window.setTimeout(finish, duration);
    update();

    return () => {
      window.clearInterval(tickTimer);
      window.clearTimeout(finishTimer);
      window.clearTimeout(exitTimer);
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  if (gone) return null;

  return (
    <div className={`spark-loader ${done ? "is-done" : ""}`} aria-hidden={done}>
      <div className="spark-loader__panel">
        <div className="spark-loader__brand">
          <span className="spark-loader__bolt">S</span>
          <span>Project Spark</span>
        </div>
        <div className="spark-loader__meta">
          <span>Booting desk</span>
          <span className="spark-loader__line" />
          <span>{String(count).padStart(3, "0")}</span>
        </div>
        <div className="spark-loader__bar">
          <span style={{ transform: `scaleX(${count / 100})` }} />
        </div>
        <div className="spark-loader__fine">
          <span>NQ method</span>
          <span>live cohort</span>
        </div>
      </div>
    </div>
  );
}
