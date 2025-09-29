"use client";

import Image from "next/image";
import { urlFor, imgPresets } from "@/lib/sanity/image";
import React from "react";

type Pack = {
  _id: string;
  title: string;
  short?: string;
  price?: number; // assumed USD base
  oldPrice?: number; // assumed USD base
  badge?: string;
  slug?: string;
  icon?: any;
  cashDiscountPct?: number | null; // from Sanity (optional)
};

export default function Packs({
  items = [] as Pack[],
  basePath = '',
  locale,
  rates,
  title = 'Packs Destacados',
  limit = 4,
  showHeaderCta = true,
  detailBaseSegment = 'services',
  headerCtaHref,
  headerCtaLabel,
}: {
  items?: Pack[];
  basePath?: string;
  locale?: string;
  rates?: Record<string, number>;
  title?: string;
  limit?: number | null; // if null => show all
  showHeaderCta?: boolean;
  detailBaseSegment?: string;
  headerCtaHref?: string;
  headerCtaLabel?: string;
}) {
  if (!items.length) return null;

  const onMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    (e.currentTarget as HTMLElement).style.setProperty('--spot-x', `${x}px`);
    (e.currentTarget as HTMLElement).style.setProperty('--spot-y', `${y}px`);
  };

  // Determine currency per locale
  const currencyFor = (loc?: string): { code: "USD" | "ARS" | "BRL"; rate: number; fmtLocale: string; display: "symbol" | "code" } => {
    if (loc === 'es') {
      return { code: 'ARS', rate: rates?.['ARS'] ?? 1, fmtLocale: 'es-AR', display: 'symbol' };
    }
    if (loc === 'pt') {
      return { code: 'BRL', rate: rates?.['BRL'] ?? 1, fmtLocale: 'pt-BR', display: 'symbol' };
    }
    return { code: 'USD', rate: 1, fmtLocale: 'en-US', display: 'code' };
  };
  const { code: currencyCode, rate, fmtLocale, display } = currencyFor(locale);

  const formatMoney = (value: number) =>
    value.toLocaleString(fmtLocale, {
      style: "currency",
      currency: currencyCode,
      currencyDisplay: display,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });

  const convertFromUSD = (usd: number) => usd * rate;

  const defaultViewAllLabel = locale === 'pt' ? 'Ver todos os serviços' : (locale === 'en' ? 'View all services' : 'Ver todos los servicios');
  const viewAllLabel = headerCtaLabel || defaultViewAllLabel;
  const viewAllHref = headerCtaHref || `${basePath}/services`;

  const displayItems = typeof limit === 'number' && limit > 0 ? items.slice(0, limit) : items;

  const cashLabel = locale === 'pt' ? 'À vista' : (locale === 'en' ? 'Cash' : 'Contado');

  return (
    <section className="mt-16">
      <div className="max-w-6xl mx-auto">
        {/* Header with title + CTA on the right */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <h2 className="text-2xl font-bold">{title}</h2>
          {showHeaderCta ? (
            <a
              href={viewAllHref}
              className="group relative inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium text-white bg-gradient-to-r from-[#5A1F1F] via-[#5A2A3D] to-[#3B1B4F] shadow-[0_0_18px_rgba(90,31,31,0.28),_0_0_22px_rgba(59,27,79,0.28)] hover:shadow-[0_0_24px_rgba(90,31,31,0.45),_0_0_30px_rgba(59,27,79,0.45)] transition-all hover:ring-2 hover:ring-white/15 hover:-translate-y-0.5 hover:scale-[1.02]"
              aria-label={viewAllLabel}
            >
              {/* Glow layer */}
              <span
                aria-hidden
                className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-[#7A2A2A] via-[#6B2D46] to-[#4A2B62] blur-md opacity-0 transition-opacity group-hover:opacity-100"
              />
              <span className="relative z-10">{viewAllLabel}</span>
            </a>
          ) : null}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayItems.map((p) => (
            <a
              key={p._id}
              href={p.slug ? `${basePath}/${detailBaseSegment}/${p.slug}` : "#"}
              className="spotlight card-surface p-5 block h-full flex flex-col"
              onMouseMove={onMove}
            >
              {/* Imagen/icono del pack */}
              {p.icon ? (
                <div className="mb-4 aspect-[4/3] relative rounded-md overflow-hidden" style={{background: "rgba(255,255,255,0.03)"}}>
                  <Image src={imgPresets.thumb(p.icon)} alt={p.title} fill className="object-cover" />
                </div>
              ) : null}
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-lg clamp-2">{p.title}</h3>
                {p.badge ? (
                  <span className="text-[10px] tracking-wide bg-white/10 text-white/90 rounded-full px-2 py-1 ml-2 whitespace-nowrap">
                    {p.badge}
                  </span>
                ) : null}
              </div>
              {typeof p.price === "number" ? (() => {
                const converted = convertFromUSD(p.price);
                // Show discount ONLY if defined in Sanity for this item
                const pct = typeof p.cashDiscountPct === 'number' ? p.cashDiscountPct : 0;
                const discounted = pct > 0 ? Math.max(0, converted * (1 - pct / 100)) : null;
                return (
                  <div className="mb-2 space-y-1">
                    {/* Row with main price and, on the right, chip + discounted value */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="text-2xl font-bold">{formatMoney(converted)}</div>
                      {pct > 0 && discounted !== null ? (
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full text-xs whitespace-nowrap">
                            {cashLabel} −{pct}%
                          </span>
                          <span className="text-sm text-white/85 font-medium whitespace-nowrap">{formatMoney(discounted)}</span>
                        </div>
                      ) : null}
                    </div>
                    {typeof p.oldPrice === "number" ? (
                      <div className="text-xs text-muted line-through">
                        {formatMoney(convertFromUSD(p.oldPrice))}
                      </div>
                    ) : null}
                  </div>
                );
              })() : null}
              <p className="text-sm text-muted clamp-4">{p.short}</p>
              <div className="mt-auto pt-4 flex justify-end">
                <span className="btn btn-gradient">{locale === 'pt' ? 'Ver detalhes' : (locale === 'en' ? 'View details' : 'Ver detalles')}</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
