"use client";

import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";

const locales = ["es", "pt", "en"] as const;

type Props = {
  currentLocale: string;
};

export default function LanguageSwitcher({ currentLocale }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const basePath = useMemo(() => {
    if (!pathname) return "/";
    // Remove existing locale prefix from path (e.g., /es/services -> /services)
    const cleaned = pathname.replace(/^\/(es|pt|en)(?=\/|$)/, "");
    return cleaned.length ? cleaned : "/";
  }, [pathname]);

  const others = locales.filter((l) => l !== (currentLocale as any));

  // Map of localized route segments
  const segmentFamilies: Record<string, string[]> = {
    services: ["services", "servicios", "servicos"],
    portfolio: ["portfolio", "portafolio"],
    project: ["project", "proyecto", "projeto"],
    contact: ["contact", "contacto"],
  };

  const targetSegmentFor = (family: string, to: string) => {
    if (family === "services") return to === "es" ? "servicios" : to === "pt" ? "servicos" : "services";
    if (family === "portfolio") return to === "es" ? "portafolio" : "portfolio"; // pt/en use 'portfolio'
    if (family === "project") return to === "es" ? "proyecto" : to === "pt" ? "projeto" : "project";
    if (family === "contact") return to === "es" ? "contacto" : "contact"; // pt/en use 'contact'
    return undefined;
  };

  const translatePath = (path: string, to: string) => {
    if (!path || path === "/") return "/";
    const parts = path.split("/").filter(Boolean);
    if (!parts.length) return "/";
    const first = parts[0];
    // Find which family this first segment belongs to
    let matchedFamily: string | undefined;
    for (const [fam, variants] of Object.entries(segmentFamilies)) {
      if (variants.includes(first)) { matchedFamily = fam; break; }
    }
    if (matchedFamily) {
      parts[0] = targetSegmentFor(matchedFamily, to) || first;
    }
    return "/" + parts.join("/");
  };

  const go = (locale: string) => {
    document.cookie = `preferred_locale=${locale}; path=/; max-age=${60 * 60 * 24 * 365}`;
    const translated = translatePath(basePath, locale);
    router.push(`/${locale}${translated === "/" ? "" : translated}`);
    setOpen(false);
  };

  const label = currentLocale.toUpperCase();

  const Flag = ({ code }: { code: "es" | "pt" | "en" }) => {
    // AR for ES, BR for PT, US for EN — tiny inline SVGs
    if (code === "es") {
      // Argentina
      return (
        <svg width="14" height="10" viewBox="0 0 28 20" className="rounded-[2px]" aria-hidden>
          <rect width="28" height="20" fill="#74ACDF" />
          <rect y="6.666" width="28" height="6.666" fill="#FFFFFF" />
          <circle cx="14" cy="10" r="2.2" fill="#F6B40E" />
        </svg>
      );
    }
    if (code === "pt") {
      // Brazil
      return (
        <svg width="14" height="10" viewBox="0 0 28 20" className="rounded-[2px]" aria-hidden>
          <rect width="28" height="20" fill="#009B3A" />
          <polygon points="14,2 26,10 14,18 2,10" fill="#FFDF00" />
          <circle cx="14" cy="10" r="4.2" fill="#002776" />
        </svg>
      );
    }
    // EN → United States
    return (
      <svg width="14" height="10" viewBox="0 0 38 20" className="rounded-[2px]" aria-hidden>
        <clipPath id="usclip"><rect width="38" height="20" rx="1" /></clipPath>
        <g clipPath="url(#usclip)">
          <rect width="38" height="20" fill="#b22234" />
          {Array.from({ length: 6 }).map((_, i) => (
            <rect key={i} y={(i * 2 + 1) * (20 / 13)} width="38" height={20 / 13} fill="#fff" />
          ))}
          <rect width="15.2" height="10.77" fill="#3c3b6e" />
        </g>
      </svg>
    );
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="btn btn-ghost text-xs px-3 py-1.5 inline-flex items-center gap-2"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Flag code={currentLocale as any} />
        {label}
        <span aria-hidden>▾</span>
      </button>
      {open ? (
        <div className="absolute right-0 mt-2 w-32 rounded-md border shadow card-surface">
          {others.map((l) => (
            <button
              key={l}
              onClick={() => go(l)}
              className="w-full text-left px-3 py-2 text-xs hover:bg-white/5 inline-flex items-center gap-2"
            >
              <Flag code={l as any} />
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
