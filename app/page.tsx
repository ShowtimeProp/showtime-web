import Image from "next/image";
import { sanityClient } from "@/lib/sanity/client";
import { urlFor } from "@/lib/sanity/image";
import Hero from "@/components/Hero";
import Packs from "@/components/Packs";
import HeroCarousel from "@/components/HeroCarousel";

// Single-home fallback (legacy)
const query = `*[_type == "home"][0]{
  heroKicker,
  heroTitle,
  heroSubtitle,
  heroImage,
  heroVideoUrl,
  heroVideoPoster,
  heroOverlayOpacity,
  ctaPrimaryLabel,
  ctaPrimaryHref,
  ctaSecondaryLabel,
  ctaSecondaryHref
}`;

const packsQuery = `*[_type == "service" && featured == true] | order(coalesce(order, 999) asc, title asc){
  _id,
  title,
  short,
  price,
  oldPrice,
  badge,
  icon,
  "slug": slug.current
}`;

// New: Use top-level Home documents as slides
const homeSlidesQuery = `*[_type == "home"] | order(coalesce(order, 999) asc, _createdAt asc){
  "kicker": heroKicker,
  "title": heroTitle,
  "subtitle": heroSubtitle,
  "image": heroImage,
  "videoUrl": heroVideoUrl,
  "videoPoster": heroVideoPoster,
  "overlayOpacity": heroOverlayOpacity,
  ctaPrimaryLabel,
  ctaPrimaryHref,
  ctaSecondaryLabel,
  ctaSecondaryHref
}`;

export default async function Home() {
  let data: any = null;
  try {
    data = await sanityClient.fetch(query);
  } catch {}

  const title = data?.heroTitle || "Marketing inmobiliario de alto impacto";
  const kicker = data?.heroKicker || null;
  const subtitle =
    data?.heroSubtitle ||
    "Fotografía profesional, tours virtuales y video 360, edición avanzada, planos interactivos con Unreal Engine y automatizaciones con IA/n8n.";
  const imgUrl = data?.heroImage ? urlFor(data.heroImage).width(1200).height(675).url() : null;
  const videoUrl: string | null = data?.heroVideoUrl || null;
  const posterUrl: string | null = data?.heroVideoPoster ? urlFor(data.heroVideoPoster).width(1200).height(675).url() : null;
  const overlayOpacity: number = typeof data?.heroOverlayOpacity === "number" ? data.heroOverlayOpacity : 0.2;
  const cta1 = { label: data?.ctaPrimaryLabel || "Solicitar presupuesto", href: data?.ctaPrimaryHref || "/contact" };
  const cta2 = { label: data?.ctaSecondaryLabel || "Ver servicios", href: data?.ctaSecondaryHref || "/services" };

  // Fetch featured services (packs)
  let packs: any[] = [];
  try {
    packs = await sanityClient.fetch(packsQuery);
  } catch {}

  // Fetch slides from top-level Home docs
  let blocks: any[] = [];
  try {
    blocks = await sanityClient.fetch(homeSlidesQuery);
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
          />
        )}

        {/* Packs (Servicios destacados) */}
        <Packs items={packs} />
      </main>
    </div>
  );
}

