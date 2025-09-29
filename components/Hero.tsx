"use client";

import { motion } from "framer-motion";
import Image from "next/image";

type Props = {
  kicker?: string;
  title: string;
  subtitle: string;
  imgUrl: string | null;
  videoUrl?: string | null;
  posterUrl?: string | null;
  overlayOpacity?: number; // 0..0.6
  cta1: { label: string; href: string };
  cta2: { label: string; href: string };
  basePath?: string;
};

export default function Hero({ kicker, title, subtitle, imgUrl, videoUrl, posterUrl, overlayOpacity = 0.2, cta1, cta2, basePath = "" }: Props) {
  return (
    <section className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-10 items-center">
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {kicker ? (
          <div className="text-sm font-medium text-yellow-500">{kicker}</div>
        ) : null}
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">{title}</h1>
        <p className="text-base/7 text-neutral-600">{subtitle}</p>
        <div className="flex gap-3">
          <a
            href={cta1.href?.startsWith("/") ? `${basePath}${cta1.href}` : cta1.href}
            className="btn btn-primary"
          >
            {cta1.label}
          </a>
          <a
            href={cta2.href?.startsWith("/") ? `${basePath}${cta2.href}` : cta2.href}
            className="btn btn-ghost"
          >
            {cta2.label}
          </a>
        </div>
      </motion.div>

      <motion.div
        className="aspect-video rounded-xl border relative overflow-hidden"
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        {videoUrl ? (
          // Si es un enlace de Vimeo/YouTube, usamos iframe. Si es un MP4/WebM directo, usamos <video>.
          <>
            {/(vimeo\.com|youtube\.com|youtu\.be)/i.test(videoUrl) ? (
              <iframe
                className="absolute inset-0 w-full h-full"
                src={videoUrl}
                title="Hero video"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                frameBorder={0}
              />
            ) : (
              <video
                className="absolute inset-0 w-full h-full object-cover"
                src={videoUrl}
                poster={posterUrl || undefined}
                autoPlay
                muted
                loop
                playsInline
              />
            )}
            <div
              className="absolute inset-0"
              style={{ backgroundColor: "black", opacity: overlayOpacity }}
              aria-hidden
            />
          </>
        ) : imgUrl ? (
          <Image src={imgUrl} alt={title} fill className="object-cover" />
        ) : (
          <div className="w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-100 to-neutral-50 flex items-center justify-center">
            <span className="text-neutral-500 text-sm">Hero visual placeholder</span>
          </div>
        )}
      </motion.div>
    </section>
  );
}
