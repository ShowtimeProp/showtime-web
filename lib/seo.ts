export const SUPPORTED_LOCALES = ["es", "pt", "en"] as const;
export function getBaseUrl() {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL;
  if (envUrl) {
    return envUrl.startsWith("http") ? envUrl : `https://${envUrl}`;
  }
  return "http://localhost:3000";
}

// --- SEO helpers for patterns ---
export function clamp(str: string, max: number) {
  if (!str) return str as any;
  const s = str.trim();
  if (s.length <= max) return s;
  return s.slice(0, Math.max(0, max - 1)).trimEnd() + '…';
}

export function renderPattern(template: string | undefined, tokens: Record<string, string>, limits?: { title?: number; description?: number }) {
  const t = template || '';
  const replaced = Object.keys(tokens).reduce((acc, key) => acc.replaceAll(`[${key}]`, tokens[key] || ''), t).replace(/\s{2,}/g, ' ').trim();
  const title = limits?.title ? clamp(replaced, limits.title) : replaced;
  const description = limits?.description ? clamp(replaced, limits.description) : replaced;
  return { title, description };
}

export function jsonLdBreadcrumb(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: it.name,
      item: it.url,
    })),
  };
}

export function jsonLdArticle(params: { title: string; description?: string; url: string; image?: string; datePublished?: string; dateModified?: string; authorName?: string; }) {
  const { title, description, url, image, datePublished, dateModified, authorName } = params;
  const ld: any = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    mainEntityOfPage: url,
    url,
  };
  if (description) ld.description = description;
  if (image) ld.image = image;
  if (datePublished) ld.datePublished = datePublished;
  if (dateModified) ld.dateModified = dateModified;
  if (authorName) ld.author = { '@type': 'Person', name: authorName };
  return ld;
}

export function jsonLdCreativeWork(params: { title: string; description?: string; url: string; image?: string; datePublished?: string; }) {
  const { title, description, url, image, datePublished } = params;
  const ld: any = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: title,
    url,
  };
  if (description) ld.description = description;
  if (image) ld.image = image;
  if (datePublished) ld.datePublished = datePublished;
  return ld;
}


export function buildAlternates(pathname: string) {
  const base = getBaseUrl();
  const clean = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const withoutLocale = clean.replace(/^\/(es|pt|en)(?=\/|$)/, "");
  const map: Record<string, string> = {};
  for (const l of SUPPORTED_LOCALES) {
    const p = `/${l}${withoutLocale === "/" ? "" : withoutLocale}`;
    map[l] = new URL(p, base).toString();
  }
  return { languages: map } as const;
}

// Build alternates providing explicit path per locale.
export function buildAlternatesFor(paths: Partial<Record<(typeof SUPPORTED_LOCALES)[number], string>>) {
  const base = getBaseUrl();
  const map: Record<string, string> = {};
  for (const l of SUPPORTED_LOCALES) {
    const raw = paths[l];
    if (!raw) continue;
    const p = raw.startsWith("/") ? raw : `/${raw}`;
    map[l] = new URL(p, base).toString();
  }
  return { languages: map } as const;
}

export function canonical(pathname: string) {
  const base = getBaseUrl();
  const p = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return new URL(p, base).toString();
}

// JSON-LD helpers
export function jsonLdOrganization() {
  const base = getBaseUrl();
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Showtime Prop',
    url: base,
    logo: `${base}/logo.png`,
  };
}

export function jsonLdWebsite() {
  const base = getBaseUrl();
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Showtime Prop',
    url: base,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${base}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

export function toLdJson(obj: any) {
  return JSON.stringify(obj);
}

export function jsonLdService(params: { name: string; description?: string; url: string; image?: string; areaServed?: string }) {
  const { name, description, url, image, areaServed } = params;
  const ld: any = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name,
    url,
  };
  if (description) ld.description = description;
  if (image) ld.image = image;
  if (areaServed) ld.areaServed = areaServed;
  return ld;
}
