import { sanityClient } from "@/lib/sanity/client";
import EditorialBody from "@/components/EditorialBody";
import { buildAlternatesFor, canonical, jsonLdService, toLdJson } from "@/lib/seo";
import { fetchSiteMeta } from "@/lib/site";
import Image from "next/image";
import { urlFor, imgPresets } from "@/lib/sanity/image";
import Breadcrumbs from "@/components/Breadcrumbs";

type Params = { params: { locale: string; slug: string } };

function bunnyEmbed(url: string) {
  if (/mediadelivery\.net\/play\//i.test(url)) {
    return url.replace(/\/play\//i, '/embed/');
  }
  // Append recommended params to avoid autoplay with sound
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

const query = `*[_type == "service" && slug.current == $slug][0]{
  _id,
  "title": coalesce(titleLoc[$locale], titleLoc.es, titleLoc.en, titleLoc.pt, title),
  "short": coalesce(shortLoc[$locale], shortLoc.es, shortLoc.en, shortLoc.pt, short),
  "body": coalesce(bodyLoc[$locale], bodyLoc.es, bodyLoc.en, bodyLoc.pt, body),
  icon,
  videoUrl,
  videoPoster
}`;

export async function generateMetadata({ params }: Params) {
  const data = await sanityClient.fetch(query, { slug: params.slug, locale: params.locale }).catch(() => null);
  const { title: siteTitle, description: siteDesc, image: siteImg, base } = await fetchSiteMeta(params.locale);
  const title = data?.title ? `${data.title} | ${siteTitle}` : `Servicio | ${siteTitle}`;
  const description = data?.short || siteDesc || "Detalle del servicio";
  const ogImage = data?.icon ? urlFor(data.icon).width(1200).height(630).url() : siteImg;
  return {
    title,
    description,
    alternates: {
      ...buildAlternatesFor({
        es: `/es/servicios/${params.slug}`,
        pt: `/pt/servicos/${params.slug}`,
        en: `/en/services/${params.slug}`,
      }),
      canonical: canonical(`/${params.locale}/services/${params.slug}`),
    },
    metadataBase: new URL(base),
    openGraph: {
      title,
      description,
      type: 'article',
      url: `${base}/${params.locale}/servicios/${params.slug}`,
      images: ogImage ? [{ url: ogImage, width: 1200, height: 630, alt: title }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
  } as any;
}

export default async function ServiceDetail({ params }: Params) {
  const basePath = `/${params.locale}`;
  const tHome = params.locale === 'pt' ? 'Início' : params.locale === 'en' ? 'Home' : 'Inicio';
  const tServices = params.locale === 'pt' ? 'Serviços' : params.locale === 'en' ? 'Services' : 'Servicios';
  const data = await sanityClient.fetch(query, { slug: params.slug, locale: params.locale }).catch(() => null);

  if (!data) {
    return (
      <div className="px-6 py-12 max-w-3xl mx-auto">
        <h1 className="text-2xl font-semibold mb-3">Servicio no encontrado</h1>
        <a href={`${basePath}/services`} className="text-sm underline">Volver a servicios</a>
      </div>
    );
  }

  return (
    <div className="halo-page px-6 py-12 max-w-[1100px] mx-auto">
      {/* JSON-LD: Service */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: toLdJson(
            jsonLdService({
              name: data.title,
              description: data.short,
              url: canonical(`/${params.locale}/services/${params.slug}`),
              image: data.icon ? imgPresets.heroTall(data.icon) : undefined,
              areaServed: params.locale.toUpperCase(),
            })
          ),
        }}
      />
      <div className="mb-6">
        <Breadcrumbs items={[{ label: tHome, href: basePath }, { label: tServices, href: `${basePath}/services` }, { label: data.title }]} />
      </div>
      <h1 className="text-3xl font-bold mb-3">{data.title}</h1>
      {data.short ? (
        <p className="text-white/70 mb-6">{data.short}</p>
      ) : null}
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
              poster={data.videoPoster ? urlFor(data.videoPoster).width(1280).height(720).url() : undefined}
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
        <EditorialBody value={data.body} locale={params.locale as 'es' | 'en' | 'pt'} />
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
            href={`https://wa.me/5492233544057?text=${encodeURIComponent(params.locale === 'pt' ? 'Olá! Quero saber mais sobre seus serviços.' : params.locale === 'en' ? 'Hi! I want to know more about your services.' : '¡Hola! Quiero saber más sobre sus servicios.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-success pulse-2s"
            aria-label="WhatsApp"
          >
            WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
