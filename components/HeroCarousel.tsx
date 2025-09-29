"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import type { EmblaCarouselType } from "embla-carousel";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { urlFor, imgPresets } from "@/lib/sanity/image";

export type HeroBlock = {
  kicker?: string;
  title: string;
  subtitle?: string;
  image?: any;
  videoUrl?: string | null;
  videoPoster?: any;
  overlayOpacity?: number;
  ctaPrimaryLabel?: string;
  ctaPrimaryHref?: string;
  ctaSecondaryLabel?: string;
  ctaSecondaryHref?: string;
};

export default function HeroCarousel({ blocks = [] as HeroBlock[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start", skipSnaps: false });
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0); // 0..1
  const [showHint, setShowHint] = useState(true);
  const [mediaHover, setMediaHover] = useState(false);
  const [videoReady, setVideoReady] = useState<Record<number, boolean>>({});
  const [haloPos, setHaloPos] = useState<{x: number; y: number}>({ x: 0.8, y: 0.2 }); // relative (0..1)
  const [mounted, setMounted] = useState(false);
  const bgVideo = (process.env.NEXT_PUBLIC_HERO_BG_VIDEO as string | undefined) || undefined;
  const AUTOPLAY_MS = 15000; // 15 seconds
  const PROGRESS_TICK = 100; // ms

  const locale = useMemo(() => {
    if (typeof window === 'undefined') return 'en';
    const m = window.location.pathname.match(/^\/(es|pt|en)(?:\/|$)/);
    return (m?.[1] as 'es' | 'pt' | 'en') || 'en';
  }, []);
  const t = (k: 'pause'|'play'|'tooltip'): string => {
    const dict = {
      es: { pause: 'Pausar', play: 'Reproducir', tooltip: 'Autoplay' },
      pt: { pause: 'Pausar', play: 'Reproduzir', tooltip: 'Autoplay' },
      en: { pause: 'Pause', play: 'Play', tooltip: 'Autoplay' },
    } as const;
    return dict[locale][k];
  };

  // Normalize Bunny URLs to iframe embeds and enforce muted/controls
  const bunnyEmbed = (url: string, autoplay: boolean) => {
    try {
      let u = url;
      if (/mediadelivery\.net\/play\//i.test(u)) {
        u = u.replace(/\/play\//i, '/embed/');
      }
      const parsed = new URL(u);
      // Autoplay only on the active slide
      parsed.searchParams.set('autoplay', autoplay ? 'true' : 'false');
      if (!parsed.searchParams.has('muted')) parsed.searchParams.set('muted', 'true');
      if (!parsed.searchParams.has('controls')) parsed.searchParams.set('controls', 'true');
      return parsed.toString();
    } catch {
      return url;
    }
  };

  const onSelect = useCallback((api: EmblaCarouselType) => {
    const newIndex = api.selectedScrollSnap();
    setIndex(newIndex);
    setProgress(0);
    // If the new slide contains a video, pause the carousel autoplay
    const b = blocks[newIndex];
    const hasVideo = !!b?.videoUrl;
    setIsPlaying(!hasVideo);
  }, [blocks]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", () => onSelect(emblaApi));
    const initial = emblaApi.selectedScrollSnap();
    setIndex(initial);
    const initialHasVideo = !!blocks[initial]?.videoUrl;
    setIsPlaying(!initialHasVideo);
  }, [emblaApi, onSelect, blocks]);

  // mark mounted to avoid SSR/CSR text mismatch for localized labels
  useEffect(() => {
    setMounted(true);
  }, []);

  const scrollTo = (i: number) => emblaApi?.scrollTo(i);
  const scrollPrev = () => emblaApi?.scrollPrev();
  const scrollNext = () => emblaApi?.scrollNext();

  // Handle autoplay timer
  useEffect(() => {
    if (!emblaApi || !isPlaying) return;
    const id = setInterval(() => {
      if (document.visibilityState === "hidden") return;
      emblaApi.scrollNext();
    }, AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [emblaApi, isPlaying]);

  // Progress bar updater
  useEffect(() => {
    if (!isPlaying) return;
    let mounted = true;
    const step = () => {
      setProgress((p) => {
        const np = p + PROGRESS_TICK / AUTOPLAY_MS;
        return np >= 1 ? 0 : np;
      });
    };
    const id = setInterval(step, PROGRESS_TICK);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, [isPlaying]);

  const onPointerEnter = () => setIsPlaying(false);
  const onPointerLeave = () => setIsPlaying(true);
  useEffect(() => {
    if (!emblaApi) return;
    const onDragStart = () => setIsPlaying(false);
    const onDragEnd = () => setIsPlaying(true);
    emblaApi.on("pointerDown", onDragStart);
    emblaApi.on("settle", onDragEnd);
    return () => {
      emblaApi.off("pointerDown", onDragStart);
      emblaApi.off("settle", onDragEnd);
    };
  }, [emblaApi]);

  if (!blocks.length) return null;

  return (
    <motion.section
      className="relative max-w-[1280px] mx-auto"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* Mobile swipe hint */}
      {showHint ? (
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 lg:hidden">
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            onAnimationComplete={() => setTimeout(() => setShowHint(false), 1800)}
            className="px-3 py-1 text-xs rounded-full bg-black text-white/90 flex items-center gap-2 shadow-sm"
          >
            <span>Swipe</span>
            <span className="inline-block">↔</span>
          </motion.div>
        </div>
      ) : null}
      <div
        className="grid lg:grid-cols-12 gap-10 items-center"
        onMouseEnter={() => setMediaHover(true)}
        onMouseLeave={() => { setMediaHover(false); setIsPlaying(true); }}
      >
        {/* Text column */}
        <div className="space-y-6 lg:col-span-5" onMouseEnter={onPointerEnter} onMouseLeave={onPointerLeave}>
          <AnimatePresence mode="wait">
            <motion.div
              key={`text-${index}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
            >
              {blocks[index]?.kicker ? (
                <div className="relative inline-block mb-3 text-base font-semibold text-yellow-500">
                  <span className="relative z-10">{blocks[index]!.kicker}</span>
                  <motion.div
                    className="absolute left-0 right-0 bottom-[-2px] h-[2px] bg-yellow-400/90"
                    initial={{ width: 0, opacity: 1 }}
                    animate={{ width: "100%", opacity: 1 }}
                    transition={{ duration: 1.2, ease: "easeInOut" }}
                    aria-hidden
                  />
                </div>
              ) : null}
              <motion.h1
                className="text-4xl sm:text-5xl font-bold tracking-tight"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: "easeOut", delay: 0.05 }}
              >
                {blocks[index]?.title}
              </motion.h1>
              {blocks[index]?.subtitle ? (
                <motion.p
                  className="text-base/7 text-white/80 mb-4"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, ease: "easeOut", delay: 0.12 }}
                >
                  {blocks[index]?.subtitle}
                </motion.p>
              ) : null}
              <motion.div
                className="flex gap-3 mt-2"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: "easeOut", delay: 0.18 }}
              >
                {blocks[index]?.ctaPrimaryLabel && blocks[index]?.ctaPrimaryHref ? (
                  <a
                    href={blocks[index]!.ctaPrimaryHref!}
                    className="relative inline-flex items-center px-4 py-2 rounded-md font-semibold text-black bg-gradient-to-r from-yellow-300 via-amber-300 to-yellow-400 bg-[length:200%_200%] shadow-[0_8px_24px_rgba(255,215,0,0.22)] transition-all duration-300 hover:bg-[position:100%_0] hover:shadow-[0_10px_28px_rgba(255,215,0,0.36)] hover:-translate-y-[1px] focus:outline-none focus:ring-2 focus:ring-yellow-300/60"
                  >
                    {blocks[index]!.ctaPrimaryLabel}
                  </a>
                ) : null}
                {blocks[index]?.ctaSecondaryLabel && blocks[index]?.ctaSecondaryHref ? (
                  <a
                    href={blocks[index]!.ctaSecondaryHref!}
                    className="inline-flex items-center px-4 py-2 rounded-md border border-white/25 bg-white/10 text-white/90 shadow-[0_0_12px_rgba(255,255,255,0.12)] hover:bg-white/20 hover:border-white/35 focus:outline-none focus:ring-2 focus:ring-white/30 backdrop-blur-sm transition"
                  >
                    {blocks[index]!.ctaSecondaryLabel}
                  </a>
                ) : null}
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Media column: Embla viewport */}
        <div
          className="relative mb-6 lg:col-span-7 overflow-hidden"
          onMouseEnter={() => { onPointerEnter(); setMediaHover(true); }}
          onMouseLeave={() => { onPointerLeave(); setMediaHover(false); }}
          onMouseMove={(e) => {
            const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;
            const y = (e.clientY - rect.top) / rect.height;
            setHaloPos({ x: Math.max(0, Math.min(1, x)), y: Math.max(0, Math.min(1, y)) });
          }}
        >
          {/* Ambient glow sits OUTSIDE the clipped viewport so it's visible */}
          {/* Cursor-following background: if bg video URL provided, use it; else gradient halo */}
          {bgVideo ? (
            <div
              className={`pointer-events-none absolute -z-10 transition-opacity duration-300`}
              style={{
                opacity: mediaHover ? 0.8 : 0.2,
                left: `${haloPos.x * 100}%`,
                top: `${haloPos.y * 100}%`,
                transform: "translate(-50%, -50%)", 
                width: "1500px",
                height: "1500px",
                filter: "blur(14px) saturate(130%)",
                mixBlendMode: "screen",
                overflow: "hidden",
              }}
              aria-hidden
            >
              <video
                src={bgVideo}
                className="w-full h-full object-cover rounded-[40px]"
                autoPlay
                muted
                loop
                playsInline
                style={{ transform: `translate(${(haloPos.x - 0.5) * 60}px, ${(haloPos.y - 0.5) * 60}px)` }}
              />
            </div>
          ) : (
            <div
              className={`pointer-events-none absolute w-[1400px] h-[1400px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[160px] mix-blend-screen transition-opacity duration-300`}
              style={{
                opacity: mediaHover ? 0.8 : 0.2,
                left: `${haloPos.x * 100}%`,
                top: `${haloPos.y * 100}%`,
                background:
                  "radial-gradient(closest-side, rgba(255,96,124,0.38), rgba(255,96,124,0.10) 58%, transparent 72%), radial-gradient(closest-side, rgba(124,97,255,0.34), rgba(124,97,255,0.10) 58%, transparent 72%)",
                overflow: "hidden",
              }}
              aria-hidden
            />
          )}
          <motion.div
            className="overflow-hidden rounded-xl border relative"
            ref={emblaRef as any}
            initial={{ opacity: 0.95, scale: 0.985 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: "easeOut", delay: 0.08 }}
          >
            <div className="flex">
              {blocks.map((b, i) => {
                const imgUrl = b.image ? imgPresets.hero(b.image) : null;
                const posterUrl = b.videoPoster ? imgPresets.hero(b.videoPoster) : null;
                const overlay = typeof b.overlayOpacity === "number" ? b.overlayOpacity : 0.2;
                return (
                  <div className="min-w-0 flex-[0_0_100%] aspect-video relative" key={`slide-${i}`}>
                    <motion.div
                      key={`media-${i}`}
                      className="absolute inset-0"
                      initial={{ opacity: 0.6, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4 }}
                    >
                      {b.videoUrl ? (
                        /(mediadelivery\.net|bunnycdn)/i.test(b.videoUrl) ? (
                          <iframe
                            key={`bunny-${i}-${i === index ? 'on' : 'off'}`}
                            className="absolute inset-0 w-full h-full"
                            src={bunnyEmbed(b.videoUrl!, i === index)}
                            title={`Hero video ${i + 1}`}
                            allow={`${i === index ? 'autoplay; ' : ''}accelerometer; gyroscope; encrypted-media; picture-in-picture`}
                            allowFullScreen
                            frameBorder={0}
                            style={{ display: 'block' }}
                            onFocus={() => setIsPlaying(false)}
                            onBlur={() => setIsPlaying(true)}
                          />
                        ) : /(vimeo\.com|youtube\.com|youtu\.be)/i.test(b.videoUrl) ? (
                          <iframe
                            className="absolute inset-0 w-full h-full"
                            src={b.videoUrl!}
                            title={`Hero video ${i + 1}`}
                            allow="fullscreen; picture-in-picture"
                            allowFullScreen
                            frameBorder={0}
                            style={{ display: 'block' }}
                          />
                        ) : (
                          <>
                            {/* Poster image (underneath), only when video not ready */}
                            {posterUrl ? (
                              <Image src={posterUrl} alt={b.title} fill className="object-cover" />
                            ) : null}
                            <video
                              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${videoReady[i] ? "opacity-100" : "opacity-0"}`}
                              src={b.videoUrl!}
                              poster={posterUrl || undefined}
                              autoPlay
                              muted
                              loop
                              playsInline
                              onLoadedData={() => setVideoReady((m) => ({ ...m, [i]: true }))}
                              onVolumeChange={(e) => {
                                const v = e.currentTarget;
                                if (!v.muted) setIsPlaying(false);
                              }}
                              onFocus={() => setIsPlaying(false)}
                              onBlur={() => setIsPlaying(true)}
                            />
                          </>
                        )
                      ) : imgUrl ? (
                        <Image src={imgUrl} alt={b.title} fill className="object-cover object-top" />
                      ) : (
                        <div className="w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-100 to-neutral-50 flex items-center justify-center">
                          <span className="text-neutral-500 text-sm">Hero visual</span>
                        </div>
                      )}
                      <div
                        className="absolute inset-0 pointer-events-none"
                        style={{ backgroundColor: "black", opacity: overlay }}
                        aria-hidden
                      />
                    </motion.div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Progress bar */}
          <div className="absolute bottom-0 left-0 right-0 h-2 bg-black/10">
            <div className="h-full bg-yellow-400" style={{ width: `${Math.min(progress, 1) * 100}%`, transition: `width ${PROGRESS_TICK}ms linear` }} />
          </div>
        </div>
      </div>

      {/* Desktop-only arrows at section sides (outside, triangle shape) */}
      <div className={`pointer-events-none absolute inset-y-0 left-0 right-0 hidden lg:flex items-center justify-between transition-opacity ${mediaHover ? "opacity-100" : "opacity-30"}`}>
        <button
          onClick={scrollPrev}
          onMouseEnter={() => setMediaHover(true)}
          className="group pointer-events-auto -ml-16 w-10 h-10 flex items-center justify-center"
          aria-label="Anterior"
        >
          <span
            className="block w-0 h-0 border-y-[12px] border-y-transparent border-r-[18px] border-r-white drop-shadow-[0_0_6px_rgba(255,255,255,0.35)] group-hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.7)]"
            aria-hidden
          />
        </button>
        <button
          onClick={scrollNext}
          onMouseEnter={() => setMediaHover(true)}
          className="group pointer-events-auto -mr-16 w-10 h-10 flex items-center justify-center"
          aria-label="Siguiente"
        >
          <span
            className="block w-0 h-0 border-y-[12px] border-y-transparent border-l-[18px] border-l-white drop-shadow-[0_0_6px_rgba(255,255,255,0.35)] group-hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.7)]"
            aria-hidden
          />
        </button>
      </div>

      {/* Dots + Pause */}
      <div className="flex justify-center items-center gap-4 mt-8">
        <div className="flex gap-2">
          {blocks.map((_, i) => (
            <button
              key={i}
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => scrollTo(i)}
              className={`h-2 rounded-full transition-all ${i === index ? "w-6 bg-white" : "w-2 bg-white/30"}`}
            />
          ))}
        </div>
        <div className="relative group">
          <button
            onClick={() => setIsPlaying((p) => !p)}
            aria-label={mounted ? (isPlaying ? `${t('pause')} ${t('tooltip')}` : `${t('play')} ${t('tooltip')}`) : undefined}
            aria-pressed={!isPlaying}
            className={`inline-flex items-center justify-center w-9 h-9 rounded-full border transition-colors shadow-[0_0_18px_rgba(124,97,255,0.35)] ${
              isPlaying ? "border-white/20 bg-white/10 hover:bg-white/20" : "border-emerald-400/30 bg-emerald-400/15 hover:bg-emerald-400/25"
            } text-white/90`}
            title={mounted ? (isPlaying ? t('pause') : t('play')) : undefined}
          >
            {isPlaying ? (
              // Pause icon
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="6" y="4" width="3" height="16"/>
                <rect x="15" y="4" width="3" height="16"/>
              </svg>
            ) : (
              // Play icon
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>
          {/* Tooltip */}
          {mounted ? (
            <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 -top-8 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="px-2 py-1 text-[10px] rounded bg-black/80 text-white/90 whitespace-nowrap border border-white/10 shadow">
                {t('tooltip')}: {isPlaying ? t('pause') : t('play')}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </motion.section>
  );
}
