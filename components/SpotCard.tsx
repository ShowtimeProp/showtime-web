"use client";

import React from "react";

type Props = React.PropsWithChildren<{
  href?: string;
  className?: string;
}>;

export default function SpotCard({ href = "#", className = "", children }: Props) {
  const onMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty("--spot-x", `${x}px`);
    e.currentTarget.style.setProperty("--spot-y", `${y}px`);
  };

  return (
    <a href={href} className={`spotlight card-surface block ${className}`} onMouseMove={onMove}>
      {children}
    </a>
  );
}
