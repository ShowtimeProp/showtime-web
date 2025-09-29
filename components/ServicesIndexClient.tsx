"use client";

import React from "react";
import Packs from "@/components/Packs";

export type ServiceItem = {
  _id: string;
  title: string;
  short?: string;
  price?: number;
  oldPrice?: number;
  cashDiscountPct?: number | null;
  badge?: string;
  icon?: any;
  slug?: string;
  category?: string | null;
  categories?: string[] | null;
  allInOne?: boolean | null;
};

export default function ServicesIndexClient({
  locale = "es",
  basePath = "",
  rates,
  items = [],
  title,
  detailBaseSegment = 'services',
  labels,
}: {
  locale: string;
  basePath: string;
  rates?: Record<string, number>;
  items: ServiceItem[];
  title?: string;
  detailBaseSegment?: string;
  labels?: Partial<Record<'search'|'all'|'categories'|'badge'|'bundles', string>>;
}) {
  const [q, setQ] = React.useState("");
  const [activeCat, setActiveCat] = React.useState<string | null>(null);
  const [activeBadge, setActiveBadge] = React.useState<string | null>(null);
  const [onlyBundles, setOnlyBundles] = React.useState(false);

  type LabelKey = 'search'|'all'|'categories'|'badge'|'bundles';
  const t = (k: LabelKey) => {
    const dict: Record<string, Record<string, string>> = {
      es: { search: "Buscar servicios", all: "Todos", categories: "Categorías", badge: "Etiqueta", bundles: "All in One" },
      pt: { search: "Buscar serviços", all: "Todos", categories: "Categorias", badge: "Selo", bundles: "All in One" },
      en: { search: "Search services", all: "All", categories: "Categories", badge: "Badge", bundles: "All in One" },
    };
    const base = dict[locale as keyof typeof dict] || dict.en;
    const override = labels?.[k];
    return override || base[k];
  };

  // Derive facets
  const categories = React.useMemo(() => {
    const set = new Set<string>();
    items.forEach((it) => {
      if (it.category) set.add(it.category);
      (it.categories || []).forEach((c) => set.add(c));
    });
    return Array.from(set).sort();
  }, [items]);

  const badges = React.useMemo(() => {
    const set = new Set<string>();
    items.forEach((it) => { if (it.badge) set.add(it.badge); });
    return Array.from(set).sort();
  }, [items]);

  const filtered = React.useMemo(() => {
    const query = q.trim().toLowerCase();
    return items.filter((it) => {
      if (onlyBundles && !it.allInOne) return false;
      if (activeCat) {
        const hasCat = (it.category === activeCat) || (it.categories || []).includes(activeCat);
        if (!hasCat) return false;
      }
      if (activeBadge && it.badge !== activeBadge) return false;
      if (!query) return true;
      const hay = `${it.title || ""} ${it.short || ""}`.toLowerCase();
      return hay.includes(query);
    });
  }, [items, q, activeCat, activeBadge, onlyBundles]);

  return (
    <div>
      {/* Controls */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex-1">
          <label className="sr-only" htmlFor="svc-search">{t("search")}</label>
          <input
            id="svc-search"
            className="w-full px-3 py-2 rounded-md bg-white/5 border border-white/10 text-sm outline-none focus:ring-2 focus:ring-white/15"
            placeholder={t("search")}
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          {/* Categories */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs text-white/60 mr-1">{t("categories")}:</span>
            <button
              className={`px-2 py-1 rounded-full text-xs border ${activeCat === null ? "bg-white/15 border-white/20" : "bg-white/5 border-white/10"}`}
              onClick={() => setActiveCat(null)}
            >{t("all")}</button>
            {categories.map((c) => (
              <button
                key={c}
                className={`px-2 py-1 rounded-full text-xs border capitalize ${activeCat === c ? "bg-white/15 border-white/20" : "bg-white/5 border-white/10"}`}
                onClick={() => setActiveCat((v) => v === c ? null : c)}
              >{c.replace(/[-_]/g, " ")}</button>
            ))}
          </div>
          {/* Badge filter (optional) */}
          {badges.length > 0 ? (
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-xs text-white/60 mr-1">{t("badge")}:</span>
              <button
                className={`px-2 py-1 rounded-full text-xs border ${activeBadge === null ? "bg-white/15 border-white/20" : "bg-white/5 border-white/10"}`}
                onClick={() => setActiveBadge(null)}
              >{t("all")}</button>
              {badges.map((b) => (
                <button
                  key={b}
                  className={`px-2 py-1 rounded-full text-xs border ${activeBadge === b ? "bg-white/15 border-white/20" : "bg-white/5 border-white/10"}`}
                  onClick={() => setActiveBadge((v) => v === b ? null : b)}
                >{b}</button>
              ))}
            </div>
          ) : null}
          {/* All in One (bundles) toggle */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/60">{t("bundles")}:</span>
            <button
              className={`px-2 py-1 rounded-full text-xs border ${onlyBundles ? "bg-white/15 border-white/20" : "bg-white/5 border-white/10"}`}
              onClick={() => setOnlyBundles((v) => !v)}
            >{onlyBundles ? "ON" : "OFF"}</button>
          </div>
        </div>
      </div>

      {/* Grid */}
      <Packs
        title={title || (locale === 'pt' ? 'Serviços' : locale === 'en' ? 'Services' : 'Servicios')}
        items={filtered}
        basePath={basePath}
        locale={locale}
        rates={rates}
        limit={null}
        showHeaderCta={false}
        detailBaseSegment={detailBaseSegment}
      />
    </div>
  );
}
