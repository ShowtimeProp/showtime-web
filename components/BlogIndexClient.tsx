"use client";
import React from "react";
import Packs from "@/components/Packs";

export type BlogItem = {
  _id: string;
  title: string;
  short?: string;
  slug?: string;
  mainImage?: any;
  categories?: string[] | null;
  tags?: string[] | null;
};

export default function BlogIndexClient({
  locale = "es",
  basePath = "",
  items = [],
}: {
  locale: string;
  basePath: string;
  items: BlogItem[];
}) {
  const [q, setQ] = React.useState("");
  const [activeCat, setActiveCat] = React.useState<string | null>(null);

  const t = (k: string) => {
    const dict: Record<string, Record<string, string>> = {
      es: { search: "Buscar notas", all: "Todos", categories: "Categorías" },
      pt: { search: "Buscar artigos", all: "Todos", categories: "Categorias" },
      en: { search: "Search posts", all: "All", categories: "Categories" },
    };
    return dict[locale as keyof typeof dict]?.[k] || dict.en[k];
  };

  const categories = React.useMemo(() => {
    const set = new Set<string>();
    items.forEach((it) => (it.categories || []).forEach((c) => set.add(c)));
    return Array.from(set).sort();
  }, [items]);

  const filtered = React.useMemo(() => {
    const query = q.trim().toLowerCase();
    return items.filter((it) => {
      if (activeCat && !(it.categories || []).includes(activeCat)) return false;
      if (!query) return true;
      const hay = `${it.title || ""} ${it.short || ""}`.toLowerCase();
      return hay.includes(query);
    });
  }, [items, q, activeCat]);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex-1">
          <label className="sr-only" htmlFor="blog-q">{t("search")}</label>
          <input
            id="blog-q"
            className="w-full px-3 py-2 rounded-md bg-white/5 border border-white/10 text-sm outline-none focus:ring-2 focus:ring-white/15"
            placeholder={t("search")}
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2 items-center">
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
        </div>
      </div>

      {/* Reuse Packs to show cards; link to /blog/{slug} */}
      <Packs
        title={locale === 'pt' ? 'Artigos' : locale === 'en' ? 'Posts' : 'Notas'}
        items={filtered.map(p => ({...p, icon: p.mainImage })) as any}
        basePath={basePath}
        locale={locale}
        rates={undefined}
        limit={null}
        showHeaderCta={false}
        detailBaseSegment="blog"
      />
    </div>
  );
}
