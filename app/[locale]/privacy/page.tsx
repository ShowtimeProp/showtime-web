import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import PrivacyBody from "@/components/legal/PrivacyBody";
import { fetchSiteMeta } from "@/lib/site";
import { buildAlternates } from "@/lib/seo";

export const revalidate = 86400;

const copy = {
  es: {
    title: "Política de Privacidad de ShowtimeProp",
    home: "Inicio",
    terms: "Términos y condiciones",
    metaDesc: "Política de privacidad de ShowtimeProp: datos recopilados, finalidades, derechos y contacto.",
  },
  en: {
    title: "Privacy Policy",
    home: "Home",
    terms: "Terms and conditions",
    metaDesc: "ShowtimeProp privacy policy: data we collect, purposes, your rights, and contact.",
  },
  pt: {
    title: "Política de Privacidade",
    home: "Início",
    terms: "Termos e condições",
    metaDesc: "Política de privacidade da ShowtimeProp: dados, finalidades, direitos e contato.",
  },
} as const;

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
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
        <PrivacyBody />
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
  const pageTitle = `${t.title} | ${title}`;
  return {
    title: pageTitle,
    description: t.metaDesc,
    alternates: buildAlternates("/privacy"),
    metadataBase: new URL(base),
    openGraph: {
      title: pageTitle,
      description: t.metaDesc,
      type: "website",
      url: `${base}/${locale}/privacy`,
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
