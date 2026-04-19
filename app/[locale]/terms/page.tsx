import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import TermsBody from "@/components/legal/TermsBody";
import LegalPortableText from "@/components/legal/LegalPortableText";
import { fetchLegalPage } from "@/lib/legal";
import { fetchSiteMeta } from "@/lib/site";
import { buildAlternates } from "@/lib/seo";

export const revalidate = 300;

const copy = {
  es: {
    title: "Términos y Condiciones de ShowtimeProp",
    home: "Inicio",
    privacy: "Política de privacidad",
    metaDesc: "Términos y condiciones de uso de la plataforma ShowtimeProp CRM.",
    updatedLabel: "Última actualización:",
  },
  en: {
    title: "Terms and Conditions",
    home: "Home",
    privacy: "Privacy policy",
    metaDesc: "Terms and conditions for using the ShowtimeProp CRM platform.",
    updatedLabel: "Last updated:",
  },
  pt: {
    title: "Termos e Condições",
    home: "Início",
    privacy: "Política de privacidade",
    metaDesc: "Termos e condições de uso da plataforma ShowtimeProp CRM.",
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

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const basePath = `/${locale}`;
  const t = copy[locale as keyof typeof copy] || copy.es;
  const doc = await fetchLegalPage("terms");
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
        {hasCms ? <LegalPortableText value={blocks} /> : <TermsBody />}
        <p className="mt-10 pt-6 border-t border-white/10 text-sm text-white/60">
          <Link href={`${basePath}/privacy`} className="text-sky-400 hover:underline">
            {t.privacy} →
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
  const doc = await fetchLegalPage("terms");
  const h1 = (doc?.titleLoc?.[locale] || doc?.titleLoc?.es || t.title).trim();
  const pageTitle = `${h1} | ${title}`;
  const desc = t.metaDesc;
  return {
    title: pageTitle,
    description: desc,
    alternates: buildAlternates("/terms"),
    metadataBase: new URL(base),
    openGraph: {
      title: pageTitle,
      description: desc,
      type: "website",
      url: `${base}/${locale}/terms`,
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
