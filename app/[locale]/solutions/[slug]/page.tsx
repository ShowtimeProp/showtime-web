import { sanityClient } from "@/lib/sanity/client";
import Breadcrumbs from "@/components/Breadcrumbs";
import EditorialBody from "@/components/EditorialBody";
import Image from "next/image";
import { imgPresets } from "@/lib/sanity/image";
import { buildAlternatesFor, canonical, renderPattern } from "@/lib/seo";
import { fetchSiteMeta } from "@/lib/site";

export const revalidate = 60;

const query = `*[_type == "solution" && slug.current == $slug][0]{
  _id,
  "title": coalesce(titleLoc[$locale], titleLoc.es, titleLoc.en, titleLoc.pt, title),
  "short": coalesce(shortLoc[$locale], shortLoc.es, shortLoc.en, shortLoc.pt, short),
  "body": coalesce(bodyLoc[$locale], bodyLoc.es, bodyLoc.en, bodyLoc.pt, body),
  price,
  oldPrice,
  cashDiscountPct,
  badge,
  icon,
  videoUrl,
  videoPoster,
}`;

export async function generateMetadata({ params }: { params: { locale: string; slug: string } }) {
  const data = await sanityClient.fetch(query, { slug: params.slug, locale: params.locale }).catch(() => null);
  const { seoPatterns, brandShort, description: siteDesc, base } = await fetchSiteMeta(params.locale);
  const brand = brandShort || 'Showtime Prop';
  const patTitle = seoPatterns?.titleSolutionLoc?.[params.locale] || (params.locale === 'pt' ? '[SolutionTitle] | [Brand]' : params.locale === 'en' ? '[SolutionTitle] | [Brand]' : '[SolutionTitle] | [Brand]');
  const patDesc = seoPatterns?.descSolutionLoc?.[params.locale] || (params.locale === 'pt' ? '[SolutionTitle]. Benefício principal.' : params.locale === 'en' ? '[SolutionTitle]. Key benefit.' : '[SolutionTitle]. Beneficio principal.');
  const solutionTitle = data?.title || (params.locale === 'pt' ? 'Solução' : params.locale === 'en' ? 'Solution' : 'Solución');
  const t = renderPattern(patTitle, { Brand: brand, SolutionTitle: solutionTitle }, { title: 60 }).title;
  const d = renderPattern(patDesc, { SolutionTitle: solutionTitle }, { description: 155 }).description || siteDesc || '';
  return {
    title: t,
    description: d,
    alternates: {
      ...buildAlternatesFor({ es: `/es/soluciones/${params.slug}`, pt: `/pt/solucoes/${params.slug}`, en: `/en/solutions/${params.slug}` }),
      canonical: canonical(`/${params.locale}/solutions/${params.slug}`),
    },
    openGraph: { title: t, description: d, type: 'article', url: `${base}/${params.locale}/solutions/${params.slug}` },
    twitter: { card: 'summary', title: t, description: d },
  } as any;
}

function bunnyEmbed(url: string) {
  if (/mediadelivery\.net\/play\//i.test(url)) {
    return url.replace(/\/play\//i, '/embed/');
  }
  try {
    const u = new URL(url);
    if (!u.searchParams.has('autoplay')) u.searchParams.set('autoplay', 'false');
    if (!u.searchParams.has('muted')) u.searchParams.set('muted', 'true');
    if (!u.searchParams.has('controls')) u.searchParams.set('controls', 'true');
    return u.toString();
  } catch {
    return url;
  }
}

export default async function SolutionDetailPage({ params }: { params: { locale: string; slug: string } }) {
  const basePath = `/${params.locale}`;
  const tHome = params.locale === 'pt' ? 'Início' : params.locale === 'en' ? 'Home' : 'Inicio';
  const tSolutions = params.locale === 'pt' ? 'Soluções' : params.locale === 'en' ? 'Solutions' : 'Soluciones';

  const data = await sanityClient.fetch(query, { slug: params.slug, locale: params.locale });
  if (!data) return null;

  return (
    <main className="halo-page px-6 py-20 sm:px-10 md:px-16 max-w-[1100px] mx-auto">
      <div className="mb-6">
        <Breadcrumbs items={[{ label: tHome, href: basePath }, { label: tSolutions, href: `${basePath}/solutions` }, { label: data.title }]} />
      </div>

      <h1 className="text-3xl font-bold mb-3">{data.title}</h1>
      {data.short ? <p className="text-white/70 mb-4">{data.short}</p> : null}

      {/* Media: prefer videoUrl over icon */}
      {data.videoUrl ? (
        /(mediadelivery\.net|bunnycdn)/i.test(data.videoUrl) ? (
          <div className="mb-6 aspect-video relative rounded-xl overflow-hidden border border-white/10">
            <iframe
              src={bunnyEmbed(data.videoUrl)}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; gyroscope; encrypted-media; picture-in-picture;"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer"
            />
          </div>
        ) : /(youtube\.com|youtu\.be|vimeo\.com)/i.test(data.videoUrl) ? (
          <div className="mb-6 aspect-video relative rounded-xl overflow-hidden border border-white/10">
            <iframe
              src={data.videoUrl}
              className="absolute inset-0 w-full h-full"
              title={data.title}
              allow="fullscreen; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <div className="mb-6 aspect-video relative rounded-xl overflow-hidden border border-white/10">
            <video
              className="absolute inset-0 w-full h-full object-cover"
              controls
              muted
              poster={data.videoPoster ? imgPresets.hero(data.videoPoster) : undefined}
              src={data.videoUrl}
            />
          </div>
        )
      ) : data.icon ? (
        <div className="mb-6 aspect-[4/3] relative rounded-xl overflow-hidden border border-white/10">
          <Image src={imgPresets.heroTall(data.icon)} alt={data.title} fill className="object-cover object-top" />
        </div>
      ) : null}

      {Array.isArray(data.body) && data.body.length ? (
        <EditorialBody value={data.body} locale={params.locale as 'es' | 'en' | 'pt'} dropcapMode="sections" />
      ) : null}

      {/* CTA Footer */}
      <div className="mt-10 card-surface rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="text-white/90 font-semibold">
          {params.locale === 'pt' ? 'Pronto para potencializar seu marketing?' : params.locale === 'en' ? 'Ready to boost your marketing?' : '¿Listo para potenciar tu marketing?'}
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <a href={`/${params.locale}/solutions`} className="btn btn-primary shadow-md">
            {params.locale === 'pt' ? 'Explorar Soluções' : params.locale === 'en' ? 'Explore Solutions' : 'Explorar Soluciones'}
          </a>
          <a href={`/${params.locale}/services`} className="btn btn-outline-primary">
            {params.locale === 'pt' ? 'Ver Serviços' : params.locale === 'en' ? 'View Services' : 'Ver Servicios'}
          </a>
          <a
            href={`https://wa.me/5492233544057?text=${encodeURIComponent(params.locale === 'pt' ? 'Olá! Quero saber mais sobre suas soluções.' : params.locale === 'en' ? 'Hi! I want to know more about your solutions.' : '¡Hola! Quiero saber más sobre sus soluciones.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-success pulse-2s"
            aria-label="WhatsApp"
          >
            WhatsApp
          </a>
        </div>
      </div>
    </main>
  );
}
