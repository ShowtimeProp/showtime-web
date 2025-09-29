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
