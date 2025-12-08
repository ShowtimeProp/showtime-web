import Image from "next/image";
import { sanityClient } from "@/lib/sanity/client";
import { urlFor, imgPresets } from "@/lib/sanity/image";
import { buildAlternatesFor, renderPattern } from "@/lib/seo";
import { fetchSiteMeta } from "@/lib/site";
import SpotCard from "@/components/SpotCard";
import HaloFrame from "@/components/HaloFrame";
import PortfolioIndexClient from "@/components/PortfolioIndexClient";

export const revalidate = 60;

const query = `*[_type == "project"] | order(coalesce(date, now()) desc){
  _id,
  "title": coalesce(titleLoc[$locale], titleLoc.es, titleLoc.en, titleLoc.pt, title),
  tags,
  category,
  categories,
  thumb,
  videoUrl,
  videoPoster,
  tourUrl,
  "slug": slug.current
}`;

export default async function PortfolioPage({ params }: { params: { locale: string } }) {
  const basePath = `/${params.locale}`;
  const locale = params.locale;

  let items: { _id: string; title: string; tags?: string[]; thumb?: any; slug?: string; videoUrl?: string; videoPoster?: any; tourUrl?: string }[] = [];
  try {
    items = await sanityClient.fetch(query, { locale: params.locale });
  } catch {}

  const fallback = items.length === 0;

  const bunnyEmbed = (url: string) => {
    try {
      let u = url;
      if (/mediadelivery\.net\/play\//i.test(u)) u = u.replace(/\/play\//i, '/embed/');
      const parsed = new URL(u);
      if (!parsed.searchParams.has('autoplay')) parsed.searchParams.set('autoplay', 'false');
      if (!parsed.searchParams.has('muted')) parsed.searchParams.set('muted', 'true');
      if (!parsed.searchParams.has('controls')) parsed.searchParams.set('controls', 'true');
      return parsed.toString();
    } catch {
      return url;
    }
  };

  const videoEmbed = (url: string) => {
    try {
      let u = url.trim();
      const yt = u.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{6,})/i);
      if (yt) {
        const id = yt[1];
        return `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1`;
      }
      const vimeo = u.match(/vimeo\.com\/(?:video\/)?(\d+)/i);
      if (vimeo) {
        const id = vimeo[1];
        return `https://player.vimeo.com/video/${id}`;
      }
      return url;
    } catch {
      return url;
    }
  };

  return (
    <div className="halo-page px-6 py-12 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Portfolio</h1>
      <p className="text-neutral-600 mb-8">
        {fallback
          ? "Mostrando proyectos de ejemplo. Crea documentos 'Project' en el Studio para verlos aquí."
          : "Una selección de trabajos que muestran nuestro enfoque visual, técnico y orientado a resultados."}
      </p>
      <PortfolioIndexClient locale={locale} basePath={basePath} items={items} />
    </div>
  );
}

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const { seoPatterns, brandShort, image, base } = await fetchSiteMeta(params.locale);
  const brand = brandShort || 'Showtime Prop';
  const patTitle = seoPatterns?.titlePortfolioLoc?.[params.locale] || (params.locale === 'pt' ? 'Portfolio | Projetos de [Brand]' : params.locale === 'en' ? 'Portfolio | Projects by [Brand]' : 'Portafolio | Proyectos de [Brand]');
  const patDesc = seoPatterns?.descPortfolioLoc?.[params.locale] || (params.locale === 'pt' ? 'Casos reais e resultados mensuráveis.' : params.locale === 'en' ? 'Real cases and measurable results.' : 'Casos reales y resultados medibles.');
  const pageTitle = renderPattern(patTitle, { Brand: brand }, { title: 60 }).title;
  const description = renderPattern(patDesc, { Brand: brand }, { description: 155 }).description;
  return {
    title: pageTitle,
    description,
    alternates: buildAlternatesFor({
      es: "/es/portafolio",
      pt: "/pt/portfolio",
      en: "/en/portfolio",
    }),
    metadataBase: new URL(base),
    openGraph: {
      title: pageTitle,
      description,
      type: 'website',
      url: `${base}/${params.locale}/portfolio`,
      images: image ? [{ url: image, width: 1200, height: 630, alt: pageTitle }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description,
      images: image ? [image] : undefined,
    },
  } as any;
}
