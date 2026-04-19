import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import TermsBody from "@/components/legal/TermsBody";
import { fetchSiteMeta } from "@/lib/site";
import { buildAlternates } from "@/lib/seo";

export const revalidate = 86400;

const copy = {
  es: {
    title: "Términos y Condiciones de ShowtimeProp",
    home: "Inicio",
    privacy: "Política de privacidad",
    metaDesc: "Términos y condiciones de uso de la plataforma ShowtimeProp CRM.",
  },
  en: {
    title: "Terms and Conditions",
    home: "Home",
    privacy: "Privacy policy",
    metaDesc: "Terms and conditions for using the ShowtimeProp CRM platform.",
  },
  pt: {
    title: "Termos e Condições",
    home: "Início",
    privacy: "Política de privacidade",
    metaDesc: "Termos e condições de uso da plataforma ShowtimeProp CRM.",
  },
} as const;

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const basePath = `/${locale}`;
  const t = copy[locale as keyof typeof copy] || copy.es;

  return (
    <main className="px-6 py-20 sm:px-10 md:px-16 max-w-[1280px] mx-auto">
      <div className="mb-6">
        <Breadcrumbs items={[{ label: t.home, href: basePath }, { label: t.title }]} />
      </div>

      <article className="max-w-3xl">
        <h1 className="text-3xl font-bold mb-2 text-white">{t.title}</h1>
        <TermsBody />
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
  const pageTitle = `${t.title} | ${title}`;
  return {
    title: pageTitle,
    description: t.metaDesc,
    alternates: buildAlternates("/terms"),
    metadataBase: new URL(base),
    openGraph: {
      title: pageTitle,
      description: t.metaDesc,
      type: "website",
      url: `${base}/${locale}/terms`,
      images: image ? [{ url: image, width: 1200, height: 630, alt: pageTitle }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: t.metaDesc,
      images: image ? [image] : undefined,
    },
  } as const;
}
