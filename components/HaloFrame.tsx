"use client";

import React from "react";

type Props = React.PropsWithChildren<{
  className?: string;
  size?: number; // px diameter of halo
  baseOpacity?: number; // 0..1
  hoverOpacity?: number; // 0..1
}>;

export default function HaloFrame({
  className = "",
  size = 900,
  baseOpacity = 0.15,
  hoverOpacity = 0.5,
  children,
}: Props) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [hover, setHover] = React.useState(false);
  const [pos, setPos] = React.useState({ x: 0.6, y: 0.4 }); // relative

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    setPos({ x: Math.max(0, Math.min(1, x)), y: Math.max(0, Math.min(1, y)) });
  };

  return (
    <div
      ref={ref}
      className={`relative ${className}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onMouseMove={onMove}
    >
      {/* Halo background */}
      <div
        aria-hidden
        className="pointer-events-none absolute -z-10 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[120px] mix-blend-screen transition-opacity duration-300"
        style={{
          width: size,
          height: size,
          left: `${pos.x * 100}%`,
          top: `${pos.y * 100}%`,
          opacity: hover ? hoverOpacity : baseOpacity,
          background:
            "radial-gradient(closest-side, rgba(255,96,124,0.36), rgba(255,96,124,0.10) 58%, transparent 72%), radial-gradient(closest-side, rgba(124,97,255,0.32), rgba(124,97,255,0.10) 58%, transparent 72%)",
        }}
      />
      {children}
    </div>
  );
}
