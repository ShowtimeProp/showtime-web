import Link from "next/link";
import { sanityClient } from "@/lib/sanity/client";
import { getBaseUrl } from "@/lib/seo";

/** Si el href es https del mismo dominio, lo tratamos como ruta interna (evita abrir pestaña y bugs de middleware). */
function sameOriginPath(href: string): string | null {
  try {
    if (!/^https?:\/\//i.test(href)) return null;
    const url = new URL(href);
    const site = new URL(getBaseUrl());
    const a = url.hostname.replace(/^www\./i, "").toLowerCase();
    const b = site.hostname.replace(/^www\./i, "").toLowerCase();
    if (a !== b) return null;
    return url.pathname + url.search + url.hash;
  } catch {
    return null;
  }
}

const query = `*[_type == "siteSettings"][0]{
  footerLinks[]{label, labelLoc, href}
}`;

const defaultFooterLinks = [
  {
    label: "Política de privacidad",
    labelLoc: {
      es: "Política de privacidad",
      en: "Privacy policy",
      pt: "Política de privacidade",
    },
    href: "/privacy",
  },
  {
    label: "Términos y condiciones",
    labelLoc: {
      es: "Términos y condiciones",
      en: "Terms and conditions",
      pt: "Termos e condições",
    },
    href: "/terms",
  },
];

function toCanonical(p: string) {
  const map: Record<string, string> = {
    soluciones: "solutions",
    solucoes: "solutions",
    servicios: "services",
    servicos: "services",
    portafolio: "portfolio",
    contato: "contact",
    contacto: "contact",
    projeto: "project",
    proyecto: "project",
    notas: "blog",
    artigos: "blog",
  };
  const seg = p.split("/")[1] || "";
  const normalized = map[seg] || seg;
  if (normalized === seg) return p;
  return `/${normalized}${p.slice(seg.length + 1)}`;
}

function localizePath(path: string, basePath: string) {
  if (!path?.startsWith("/")) return path || "#";
  const canonical = toCanonical(path);
  return `${basePath}${canonical}`;
}

/** Evita /es/privacy → localizePath → /es/es/privacy (el middleware no reconoce el primer segmento y manda al home). */
function stripLeadingLocalePath(pathname: string): string {
  const clean = pathname.split("?")[0].replace(/\/+$/, "") || "/";
  const m = clean.match(/^\/(es|en|pt)(\/.*)?$/);
  if (!m) return clean;
  const rest = m[2];
  if (!rest) return "/";
  return rest;
}

function resolveFooterHref(path: string, basePath: string) {
  const withoutLocale = stripLeadingLocalePath(path);
  if (withoutLocale === "/") return basePath || "/";
  return localizePath(withoutLocale, basePath);
}

export default async function SiteFooter({
  locale = "es",
  basePath = "",
}: {
  locale?: string;
  basePath?: string;
}) {
  const year = new Date().getFullYear();
  let data: { footerLinks?: Array<{ label?: string; labelLoc?: Record<string, string>; href?: string }> } = {};
  try {
    data = await sanityClient.fetch(query);
  } catch {
    // ignore
  }

  const raw = (data?.footerLinks?.length ? data.footerLinks : defaultFooterLinks).map((n) => ({
    label: (locale && n?.labelLoc?.[locale]) || n?.labelLoc?.es || n?.label || "",
    href: n?.href || "#",
  }));

  const items = raw.filter((i) => i.label && i.href);

  return (
    <footer className="px-6 py-8 border-t text-sm text-neutral-500 text-center">
      {items.length > 0 ? (
        <nav
          className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-white/55 mb-4"
          aria-label="Legal"
        >
          {items.map((item, idx) => {
            const internalFromUrl = sameOriginPath(item.href);
            const path = internalFromUrl ?? item.href;
            const isExternal =
              !internalFromUrl &&
              (/^https?:\/\//i.test(item.href) || item.href.startsWith("mailto:") || item.href.startsWith("tel:"));
            const href = isExternal ? item.href : resolveFooterHref(path, basePath || `/${locale}`);
            return (
              <span key={`${idx}-${item.href}`} className="inline-flex items-center gap-x-3">
                {idx > 0 ? <span className="text-white/25 select-none" aria-hidden="true">·</span> : null}
                {isExternal ? (
                  <a
                    href={href}
                    className="hover:underline hover:text-white/80"
                    {...(/^https?:\/\//i.test(item.href)
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                  >
                    {item.label}
                  </a>
                ) : (
                  <Link href={href} className="hover:underline hover:text-white/80">
                    {item.label}
                  </Link>
                )}
              </span>
            );
          })}
        </nav>
      ) : null}
      <p className="text-[10px] leading-relaxed text-white/45 max-w-5xl mx-auto">
        © {year} Showtime Prop — Todos los derechos reservados. Todo el contenido presente en este sitio web, incluyendo pero no limitándose a textos, gráficos, logotipos, iconos, imágenes, clips de audio y video, descargas digitales, compilaciones de datos y software, es propiedad exclusiva de Showtime Prop o de sus proveedores de contenido y está protegido por las leyes de derechos de autor nacionales e internacionales. El uso no autorizado de cualquier material en este sitio web, incluidos la reproducción, distribución, transmisión o modificación del contenido, sin el consentimiento previo y por escrito de Showtime Prop, está estrictamente prohibido y puede dar lugar a acciones legales.
      </p>
    </footer>
  );
}
