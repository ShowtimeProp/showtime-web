export const SUPPORTED_LOCALES = ["es", "pt", "en"] as const;

export function getBaseUrl() {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL;
  if (envUrl) {
    return envUrl.startsWith("http") ? envUrl : `https://${envUrl}`;
  }
  return "http://localhost:3000";
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
