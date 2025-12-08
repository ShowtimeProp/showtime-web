"use client";

import React from "react";
import HaloFrame from "@/components/HaloFrame";
import SpotCard from "@/components/SpotCard";
import { imgPresets } from "@/lib/sanity/image";

export type ProjectItem = {
  _id: string;
  title: string;
  slug?: string;
  thumb?: any;
  videoUrl?: string;
  videoPoster?: any;
  tourUrl?: string;
  category?: string | null;
  categories?: string[] | null;
  tags?: string[] | null;
};

export default function PortfolioIndexClient({
  locale = "es",
  basePath = "",
  items = [],
}: {
  locale: string;
  basePath: string;
  items: ProjectItem[];
}) {
  const [q, setQ] = React.useState("");
  const [activeCat, setActiveCat] = React.useState<string | null>(null);
  const [activeTag, setActiveTag] = React.useState<string | null>(null);

  const t = (key: "search" | "categories" | "tags" | "all") => {
    const dict: Record<string, Record<string, string>> = {
      es: { search: "Buscar en el portfolio", categories: "Categors", tags: "Etiquetas", all: "Todos" },
      pt: { search: "Buscar no portflio", categories: "Categorias", tags: "Etiquetas", all: "Todos" },
      en: { search: "Search portfolio", categories: "Categories", tags: "Tags", all: "All" },
    };
    const d = dict[locale] || dict.en;
    return d[key];
  };

  const categories = React.useMemo(() => {
    const set = new Set<string>();
    items.forEach((it) => {
      if (it.category) set.add(it.category);
      (it.categories || []).forEach((c) => set.add(c));
    });
    return Array.from(set).sort();
  }, [items]);

  const tags = React.useMemo(() => {
    const set = new Set<string>();
    items.forEach((it) => {
      (it.tags || []).forEach((tag) => set.add(tag));
    });
    return Array.from(set).sort();
  }, [items]);

  const filtered = React.useMemo(() => {
    const query = q.trim().toLowerCase();
    return items.filter((it) => {
      if (activeCat) {
        const hasCat = it.category === activeCat || (it.categories || []).includes(activeCat);
        if (!hasCat) return false;
      }
      if (activeTag) {
        const hasTag = (it.tags || []).includes(activeTag);
        if (!hasTag) return false;
      }
      if (!query) return true;
      const hay = `${it.title || ""}`.toLowerCase();
      return hay.includes(query);
    });
  }, [items, q, activeCat, activeTag]);

  return (
    <div>
      {/* Controls */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex-1">
          <label className="sr-only" htmlFor="portfolio-search">{t("search")}</label>
          <input
            id="portfolio-search"
            className="w-full px-3 py-2 rounded-md bg-white/5 border border-white/10 text-sm outline-none focus:ring-2 focus:ring-white/15"
            placeholder={t("search")}
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          {/* Categories */}
          {categories.length > 0 && (
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
          )}
          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-xs text-white/60 mr-1">{t("tags")}:</span>
              <button
                className={`px-2 py-1 rounded-full text-xs border ${activeTag === null ? "bg-white/15 border-white/20" : "bg-white/5 border-white/10"}`}
                onClick={() => setActiveTag(null)}
              >{t("all")}</button>
              {tags.map((tag) => (
                <button
                  key={tag}
                  className={`px-2 py-1 rounded-full text-xs border ${activeTag === tag ? "bg-white/15 border-white/20" : "bg-white/5 border-white/10"}`}
                  onClick={() => setActiveTag((v) => v === tag ? null : tag)}
                >{tag}</button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((it) => {
          const img = it.thumb ? imgPresets.tile(it.thumb) : null;
          const href = it.slug ? `${basePath}/project/${it.slug}` : "#";
          return (
            <HaloFrame key={it._id} size={900} baseOpacity={0.08} hoverOpacity={0.35}>
              <SpotCard href={href} className="overflow-hidden">
                <div className="relative" style={{ background: "rgba(255,255,255,0.03)" }}>
                  <div className="aspect-video relative">
                    {img ? <img src={img} alt={it.title} className="w-full h-full object-cover object-top" /> : null}
                  </div>
                </div>
                <div className="p-4 flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold">{it.title}</h3>
                    {it.tags?.length ? (
                      <p className="text-xs text-muted">{it.tags.join(" / ")}</p>
                    ) : null}
                  </div>
                  <div className="shrink-0">
                    <span className="btn btn-primary btn-xs !px-2 !py-1 !h-7 text-[11px] leading-tight">
                      {locale === 'pt' ? 'Ver detalhes' : locale === 'en' ? 'View details' : 'Ver detalles'}
                    </span>
                  </div>
                </div>
              </SpotCard>
            </HaloFrame>
          );
        })}
      </div>
    </div>
  );
}
