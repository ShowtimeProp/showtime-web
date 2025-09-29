import { sanityClient } from "@/lib/sanity/client";
import { urlFor, imgPresets } from "@/lib/sanity/image";
import Hero from "@/components/Hero";
import Packs from "@/components/Packs";
import HeroCarousel from "@/components/HeroCarousel";
import Reviews from "@/components/Reviews";
import { buildAlternates } from "@/lib/seo";
import { fetchSiteMeta } from "@/lib/site";

export const revalidate = 60;
// Single-home fallback (legacy)
const query = `*[_type == "home"][0]{
  "heroKicker": coalesce(heroKickerLoc[$locale], heroKickerLoc.es, heroKickerLoc.en, heroKickerLoc.pt, heroKicker),
  "heroTitle": coalesce(heroTitleLoc[$locale], heroTitleLoc.es, heroTitleLoc.en, heroTitleLoc.pt, heroTitle),
  "heroSubtitle": coalesce(heroSubtitleLoc[$locale], heroSubtitleLoc.es, heroSubtitleLoc.en, heroSubtitleLoc.pt, heroSubtitle),
  heroImage,
  heroVideoUrl,
  heroVideoPoster,
  heroOverlayOpacity,
  "ctaPrimaryLabel": coalesce(ctaPrimaryLabelLoc[$locale], ctaPrimaryLabelLoc.es, ctaPrimaryLabelLoc.en, ctaPrimaryLabelLoc.pt, ctaPrimaryLabel),
  ctaPrimaryHref,
  "ctaSecondaryLabel": coalesce(ctaSecondaryLabelLoc[$locale], ctaSecondaryLabelLoc.es, ctaSecondaryLabelLoc.en, ctaSecondaryLabelLoc.pt, ctaSecondaryLabel),
  ctaSecondaryHref,
  "packsTitle": coalesce(packsTitleLoc[$locale], packsTitleLoc.es, packsTitleLoc.en, packsTitleLoc.pt)
}`;

const solutionsQuery = `*[_type == "solution" && featured == true] | order(coalesce(order, 999) asc, title asc){
  _id,
  "title": coalesce(titleLoc[$locale], titleLoc.es, titleLoc.en, titleLoc.pt, title),
  "short": coalesce(shortLoc[$locale], shortLoc.es, shortLoc.en, shortLoc.pt, short),
  badge,
  icon,
  "slug": slug.current
}`;

const packsQuery = `*[_type == "service" && featured == true] | order(coalesce(order, 999) asc, title asc){
  _id,
  "title": coalesce(titleLoc[$locale], titleLoc.es, titleLoc.en, titleLoc.pt, title),
  "short": coalesce(shortLoc[$locale], shortLoc.es, shortLoc.en, shortLoc.pt, short),
  price,
  oldPrice,
  cashDiscountPct,
  badge,
  icon,
  "slug": slug.current
}`;

// Use top-level Home documents as slides
const homeSlidesQuery = `*[_type == "home"] | order(coalesce(order, 999) asc, _createdAt asc){
  "kicker": coalesce(heroKickerLoc[$locale], heroKickerLoc.es, heroKickerLoc.en, heroKickerLoc.pt, heroKicker),
  "title": coalesce(heroTitleLoc[$locale], heroTitleLoc.es, heroTitleLoc.en, heroTitleLoc.pt, heroTitle),
  "subtitle": coalesce(heroSubtitleLoc[$locale], heroSubtitleLoc.es, heroSubtitleLoc.en, heroSubtitleLoc.pt, heroSubtitle),
  "image": heroImage,
  "videoUrl": heroVideoUrl,
  "videoPoster": heroVideoPoster,
  "overlayOpacity": heroOverlayOpacity,
  "ctaPrimaryLabel": coalesce(ctaPrimaryLabelLoc[$locale], ctaPrimaryLabelLoc.es, ctaPrimaryLabelLoc.en, ctaPrimaryLabelLoc.pt, ctaPrimaryLabel),
  ctaPrimaryHref,
  "ctaSecondaryLabel": coalesce(ctaSecondaryLabelLoc[$locale], ctaSecondaryLabelLoc.es, ctaSecondaryLabelLoc.en, ctaSecondaryLabelLoc.pt, ctaSecondaryLabel),
  ctaSecondaryHref
}`;

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const { title, description, image, base } = await fetchSiteMeta(params.locale);
  return {
    title,
    description,
    alternates: buildAlternates('/'),
    metadataBase: new URL(base),
    openGraph: {
      title,
      description,
      type: 'website',
      url: `${base}/${params.locale}`,
      images: image ? [{ url: image, width: 1200, height: 630, alt: title }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: image ? [image] : undefined,
    },
  } as any;
}

export default async function Home({ params }: { params: { locale: string } }) {
  const basePath = `/${params.locale}`;

  let data: any = null;
  try {
    data = await sanityClient.fetch(query, { locale: params.locale });
  } catch {}

  const title = data?.heroTitle || "Marketing inmobiliario de alto impacto";
  const kicker = data?.heroKicker || null;
  const subtitle =
    data?.heroSubtitle ||
    "Fotografía profesional, tours virtuales y video 360, edición avanzada, planos interactivos con Unreal Engine y automatizaciones con IA/n8n.";
  const packsTitle = data?.packsTitle || (params.locale === 'pt' ? 'Serviços em destaque' : params.locale === 'en' ? 'Featured Services' : 'Servicios Destacados');
  const imgUrl = data?.heroImage ? imgPresets.hero(data.heroImage) : null;
  const videoUrl: string | null = data?.heroVideoUrl || null;
  const posterUrl: string | null = data?.heroVideoPoster ? imgPresets.hero(data.heroVideoPoster) : null;
  const overlayOpacity: number = typeof data?.heroOverlayOpacity === "number" ? data.heroOverlayOpacity : 0.2;
  const cta1 = { label: data?.ctaPrimaryLabel || "Solicitar presupuesto", href: data?.ctaPrimaryHref || "/contact" };
  const cta2 = { label: data?.ctaSecondaryLabel || "Ver servicios", href: data?.ctaSecondaryHref || "/services" };

  // Fetch featured services (packs)
  let packs: any[] = [];
  try {
    packs = await sanityClient.fetch(packsQuery, { locale: params.locale });
  } catch {}

  // Fetch featured solutions
  let solutions: any[] = [];
  try {
    solutions = await sanityClient.fetch(solutionsQuery, { locale: params.locale });
  } catch {}

  // Fetch slides from top-level Home docs
  let blocks: any[] = [];
  try {
    blocks = await sanityClient.fetch(homeSlidesQuery, { locale: params.locale });
  } catch {}

  // Fetch FX rates (USD base) and pass down to Packs for per-locale conversion
  let rates: Record<string, number> | null = null;
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/USD", { next: { revalidate: 3600 } });
    if (res.ok) {
      const json = await res.json();
      rates = json?.rates || null;
    }
  } catch {}

  return (
    <div className="min-h-screen grid grid-rows-[auto_1fr_auto]">
      <main className="halo-page px-6 py-16 sm:px-10 md:px-16">
        {blocks.length > 0 ? (
          <HeroCarousel blocks={blocks} />
        ) : (
          <Hero
            kicker={kicker || undefined}
            title={title}
            subtitle={subtitle}
            imgUrl={imgUrl}
            videoUrl={videoUrl}
            posterUrl={posterUrl}
            overlayOpacity={overlayOpacity}
            cta1={cta1}
            cta2={cta2}
            basePath={basePath}
          />
        )}

        {/* Packs (Servicios destacados) */}
        <Packs title={packsTitle} items={packs} basePath={basePath} locale={params.locale} rates={rates || undefined} />

        {/* Featured Solutions */}
        <Packs
          title={params.locale === 'pt' ? 'Soluções em destaque' : params.locale === 'en' ? 'Featured Solutions' : 'Soluciones Destacadas'}
          items={solutions}
          basePath={basePath}
          locale={params.locale}
          detailBaseSegment="solutions"
          headerCtaHref={`${basePath}/solutions`}
          headerCtaLabel={params.locale === 'pt' ? 'Ver todas as soluções' : params.locale === 'en' ? 'View all solutions' : 'Ver todas las soluciones'}
        />

        {/* Google Reviews */}
        <div className="mt-16">
          <Reviews locale={params.locale} />
        </div>
      </main>
    </div>
  );
}
