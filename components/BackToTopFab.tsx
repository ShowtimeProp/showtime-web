"use client";

import React from "react";

export default function BackToTopFab({ label = "Back to top", anchor = "#top" }: { label?: string; anchor?: string }) {
  const [show, setShow] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || document.documentElement.scrollTop;
      setShow(y > 600);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const goTop = (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      document.querySelector(anchor)?.scrollIntoView({ behavior: "smooth" });
    } catch {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <a
      href={anchor}
      onClick={goTop}
      aria-label={label}
      className={`fixed right-4 bottom-4 z-[999] transition-all ${
        show ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-3 pointer-events-none'
      } btn btn-ghost text-xs border border-white/15 bg-black/30 backdrop-blur-md hover:bg-black/40`}
    >
      ↑ {label}
    </a>
  );
}
