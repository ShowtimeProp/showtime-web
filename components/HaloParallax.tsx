"use client";

import React from "react";

export default function HaloParallax() {
  React.useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>(".halo-page"));
    if (els.length === 0) return;

    const maxOffset = 12; // px, very subtle
    let raf = 0;
    let targetX = 0, targetY = 0;
    let currentX = 0, currentY = 0;

    const update = () => {
      currentX += (targetX - currentX) * 0.12;
      currentY += (targetY - currentY) * 0.12;
      els.forEach((el) => {
        el.style.setProperty("--haloX", `${currentX.toFixed(2)}px`);
        el.style.setProperty("--haloY", `${currentY.toFixed(2)}px`);
      });
      raf = requestAnimationFrame(update);
    };

    const onMove = (e: MouseEvent) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      const dx = (e.clientX - cx) / cx; // -1..1
      const dy = (e.clientY - cy) / cy; // -1..1
      targetX = dx * maxOffset;
      targetY = dy * maxOffset;
    };

    const onScroll = () => {
      // slight vertical shift with scroll
      const sy = window.scrollY || document.documentElement.scrollTop || 0;
      const h = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const t = Math.min(1, Math.max(0, sy / h));
      targetY += (t - 0.5) * 2; // tiny additive drift
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    raf = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("scroll", onScroll);
      els.forEach((el) => {
        el.style.removeProperty("--haloX");
        el.style.removeProperty("--haloY");
      });
    };
  }, []);

  return null;
}
