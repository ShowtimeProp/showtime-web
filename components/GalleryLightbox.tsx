"use client";

import React from "react";
import Image from "next/image";

export type GalleryItem = { src: string; alt?: string };

export default function GalleryLightbox({ items = [] as GalleryItem[] }: { items?: GalleryItem[] }) {
  const [open, setOpen] = React.useState(false);
  const [index, setIndex] = React.useState(0);
  const has = items.length > 0;

  const openAt = (i: number) => {
    setIndex(i);
    setOpen(true);
  };

  const close = () => setOpen(false);
  const prev = () => setIndex((i) => (i - 1 + items.length) % items.length);
  const next = () => setIndex((i) => (i + 1) % items.length);

  // keyboard
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, items.length]);

  // touch swipe
  const startX = React.useRef<number | null>(null);
  const onTouchStart: React.TouchEventHandler<HTMLDivElement> = (e) => {
    startX.current = e.touches[0].clientX;
  };
  const onTouchEnd: React.TouchEventHandler<HTMLDivElement> = (e) => {
    if (startX.current == null) return;
    const dx = e.changedTouches[0].clientX - startX.current;
    if (Math.abs(dx) > 40) {
      if (dx > 0) prev(); else next();
    }
    startX.current = null;
  };

  return (
    <>
      <div className="grid sm:grid-cols-2 gap-6">
        {items.map((it, i) => (
          <button
            key={i}
            onClick={() => openAt(i)}
            className="group card-surface rounded-xl overflow-hidden relative text-left"
            aria-label={`Open image ${i + 1}`}
          >
            <div className="aspect-[3/2] relative overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <Image src={it.src} alt={it.alt || `Image ${i + 1}`} fill className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
              <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
            </div>
          </button>
        ))}
      </div>

      {open ? (
        <div
          className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-sm flex items-center justify-center"
          onClick={close}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative max-w-6xl w-full h-[80vh] mx-4"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            <button
              onClick={close}
              aria-label="Close"
              className="absolute top-2 right-2 z-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white p-2"
            >
              ✕
            </button>
            <button
              onClick={prev}
              aria-label="Previous"
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white p-2"
            >
              ‹
            </button>
            <button
              onClick={next}
              aria-label="Next"
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white p-2"
            >
              ›
            </button>
            <div className="relative w-full h-full rounded-lg overflow-hidden border border-white/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={items[index]?.src} alt={items[index]?.alt || ''} className="absolute inset-0 w-full h-full object-contain" />
            </div>
            <div className="mt-3 text-center text-white/80 text-sm select-none">
              {index + 1} / {items.length}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
