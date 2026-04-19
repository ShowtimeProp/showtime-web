import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import PrivacyBody from "@/components/legal/PrivacyBody";
import LegalPortableText from "@/components/legal/LegalPortableText";
import { fetchLegalPage } from "@/lib/legal";
import { fetchSiteMeta } from "@/lib/site";
import { buildAlternates } from "@/lib/seo";

export const revalidate = 300;

const copy = {
  es: {
    title: "Política de Privacidad de ShowtimeProp",
    home: "Inicio",
    terms: "Términos y condiciones",
    metaDesc: "Política de privacidad de ShowtimeProp: datos recopilados, finalidades, derechos y contacto.",
    updatedLabel: "Última actualización:",
  },
  en: {
    title: "Privacy Policy",
    home: "Home",
    terms: "Terms and conditions",
    metaDesc: "ShowtimeProp privacy policy: data we collect, purposes, your rights, and contact.",
    updatedLabel: "Last updated:",
  },
  pt: {
    title: "Política de Privacidade",
    home: "Início",
    terms: "Termos e condições",
    metaDesc: "Política de privacidade da ShowtimeProp: dados, finalidades, direitos e contato.",
    updatedLabel: "Última atualização:",
  },
} as const;

function formatUpdated(locale: string, iso?: string) {
  if (!iso) return null;
  const loc = locale === "en" ? "en" : locale === "pt" ? "pt-BR" : "es-AR";
  try {
    return new Intl.DateTimeFormat(loc, { day: "numeric", month: "long", year: "numeric" }).format(new Date(iso));
  } catch {
    return null;
  }
}

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const basePath = `/${locale}`;
  const t = copy[locale as keyof typeof copy] || copy.es;
  const doc = await fetchLegalPage("privacy");
  const bodyLoc = doc?.bodyLoc as Record<string, unknown[]> | undefined;
  const blocks = (bodyLoc?.[locale] ?? bodyLoc?.es) as unknown[] | undefined;
  const hasCms = Array.isArray(blocks) && blocks.length > 0;
  const heading = (doc?.titleLoc?.[locale] || doc?.titleLoc?.es || t.title).trim();
  const updatedLine = formatUpdated(locale, doc?.lastUpdated);

  return (
    <main className="px-6 py-20 sm:px-10 md:px-16 max-w-[1280px] mx-auto">
      <div className="mb-6">
        <Breadcrumbs items={[{ label: t.home, href: basePath }, { label: heading }]} />
      </div>

      <article className="max-w-3xl">
        <h1 className="text-3xl font-bold mb-2 text-white">{heading}</h1>
        {updatedLine ? (
          <p className="text-xs text-white/50 mb-6">
            {t.updatedLabel} {updatedLine}
          </p>
        ) : null}
        {hasCms ? <LegalPortableText value={blocks} /> : <PrivacyBody />}
        <p className="mt-10 pt-6 border-t border-white/10 text-sm text-white/60">
          <Link href={`${basePath}/terms`} className="text-sky-400 hover:underline">
            {t.terms} →
          </Link>
        </p>
      </article>
    </main>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const { title, image, base } = await fetchSiteMeta(locale);
  const t = copy[locale as keyof typeof copy] || copy.es;
  const doc = await fetchLegalPage("privacy");
  const h1 = (doc?.titleLoc?.[locale] || doc?.titleLoc?.es || t.title).trim();
  const pageTitle = `${h1} | ${title}`;
  const desc = t.metaDesc;
  return {
    title: pageTitle,
    description: desc,
    alternates: buildAlternates("/privacy"),
    metadataBase: new URL(base),
    openGraph: {
      title: pageTitle,
      description: desc,
      type: "website",
      url: `${base}/${locale}/privacy`,
      images: image ? [{ url: image, width: 1200, height: 630, alt: pageTitle }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: desc,
      images: image ? [image] : undefined,
    },
  } as const;
}
