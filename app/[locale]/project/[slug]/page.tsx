import Image from "next/image";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import { sanityClient } from "@/lib/sanity/client";
import { urlFor } from "@/lib/sanity/image";
import { PortableText } from "@portabletext/react";
import { buildAlternatesFor } from "@/lib/seo";
import { fetchSiteMeta } from "@/lib/site";
import SpotCard from "@/components/SpotCard";
import { imgPresets } from "@/lib/sanity/image";
import GalleryLightbox from "@/components/GalleryLightbox";

export const revalidate = 0;

type Params = { params: { locale: string; slug: string } };

const query = `*[_type == "project" && slug.current == $slug][0]{
  _id,
  "title": coalesce(titleLoc[$locale], titleLoc.es, titleLoc.en, titleLoc.pt, title),
  tags,
  thumb,
  videoUrl,
  videoPoster,
  tourUrl,
  gallery,
  client,
  role,
  date,
  "body": coalesce(bodyLoc[$locale], bodyLoc.es, bodyLoc.en, bodyLoc.pt, body)
}`;

const relatedQuery = `
  *[_type == "project" && _id != $id && count(tags[@ in $tags]) > 0]
  | order(coalesce(date, now()) desc)[0...3]{
    _id,
    "title": coalesce(titleLoc[$locale], titleLoc.es, titleLoc.en, titleLoc.pt, title),
    thumb,
    tags,
    videoUrl,
    videoPoster,
    tourUrl,
    "slug": slug.current
  }
`;

export async function generateMetadata({ params }: Params) {
  const data = await sanityClient.fetch(query, { slug: params.slug, locale: params.locale }).catch(() => null);
  const { title: siteTitle, description: siteDesc, image: siteImg, base } = await fetchSiteMeta(params.locale);
  const title = data?.title ? `${data.title} | ${siteTitle}` : `Proyecto | ${siteTitle}`;
  const description = data?.tags?.join(" / ") || siteDesc || "Detalle del proyecto";
  const cover = data?.thumb ? urlFor(data.thumb).width(1200).height(630).fit("crop").url() : null;
  const firstGallery = Array.isArray(data?.gallery) && data.gallery.length ? urlFor(data.gallery[0]).width(1200).height(630).fit("crop").url() : null;
  const ogImage = cover || firstGallery || siteImg;
  return {
    title,
    description,
    alternates: buildAlternatesFor({
      es: `/es/proyecto/${params.slug}`,
      pt: `/pt/projeto/${params.slug}`,
      en: `/en/project/${params.slug}`,
    }),
    metadataBase: new URL(base),
    openGraph: {
      title,
      description,
      type: 'article',
      url: `${base}/${params.locale}/proyecto/${params.slug}`,
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

export default async function ProjectDetail({ params }: Params) {
  const basePath = `/${params.locale}`;
  const parent = params.locale === 'es' ? '/proyecto' : params.locale === 'pt' ? '/projeto' : '/project';
  const data: any = await sanityClient.fetch(query, { slug: params.slug, locale: params.locale }).catch(() => null);

  if (!data) {
    return (
      <div className="px-6 py-12 max-w-5xl mx-auto">
        <h1 className="text-2xl font-semibold mb-3">Proyecto no encontrado</h1>
        <Link href={`${basePath}/portfolio`} className="text-sm underline">Volver al portfolio</Link>
      </div>
    );
  }

  const cover = data.thumb ? imgPresets.heroTall(data.thumb) : null;
  const gallery: any[] = Array.isArray(data.gallery) ? data.gallery : [];
  const related: any[] = await sanityClient
    .fetch(relatedQuery, { id: data._id, tags: data.tags || [], locale: params.locale })
    .catch(() => []);
  const videoUrlNorm: string = typeof data.videoUrl === 'string' ? data.videoUrl.trim() : '';
  const hasTour = !!data.tourUrl;
  const hasVideo = !!videoUrlNorm;

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
      // YouTube watch -> embed
      let u = url.trim();
      const yt = u.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{6,})/i);
      if (yt) {
        const id = yt[1];
        return `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1`;
      }
      // Vimeo -> embed
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
    <div className="halo-page px-6 py-16 max-w-5xl mx-auto">
      <div className="mb-6">
        {(() => {
          const tHome = params.locale === 'pt' ? 'Início' : params.locale === 'en' ? 'Home' : 'Inicio';
          const tPortfolio = params.locale === 'pt' ? 'Portfolio' : params.locale === 'en' ? 'Portfolio' : 'Portafolio';
          return (
            <Breadcrumbs
              items={[
                { label: tHome, href: basePath },
                { label: tPortfolio, href: `${basePath}/portfolio` },
                { label: data.title },
              ]}
            />
          );
        })()}
      </div>
      <h1 className="text-3xl font-bold mb-1">{data.title}</h1>
      {data.tags?.length ? (
        <p className="text-xs text-muted mb-6">{data.tags.join(" / ")}</p>
      ) : <div className="h-2" />}

      {/* debug oculto */}

      {/* Meta row: client / role / date (only render if present) */}
      {(data.client || data.role || data.date) ? (
        <div className="mb-8 grid sm:grid-cols-3 gap-4 text-sm">
          {data.client ? (
            <div className="card-surface rounded-lg p-3"><div className="text-muted">Cliente</div><div>{data.client}</div></div>
          ) : <div />}
          {data.role ? (
            <div className="card-surface rounded-lg p-3"><div className="text-muted">Rol</div><div>{data.role}</div></div>
          ) : <div />}
          {data.date ? (
            <div className="card-surface rounded-lg p-3"><div className="text-muted">Fecha</div><div>{new Date(data.date).toLocaleDateString()}</div></div>
          ) : <div />}
        </div>
      ) : null}

      {/* Tour (si existe) */}
      {hasTour ? (
        <div className="card-surface rounded-xl overflow-hidden mb-8">
          <div className="aspect-[9/16] sm:aspect-[4/3] md:aspect-video relative">
            <iframe
              src={data.tourUrl}
              className="absolute inset-0 w-full h-full"
              allowFullScreen
              loading="lazy"
            />
          </div>
        </div>
      ) : null}

      {/* Video (si existe) */}
      {hasVideo ? (
        <div className="card-surface rounded-xl overflow-hidden mb-8">
          {(/mediadelivery\.net|bunnycdn/i).test(videoUrlNorm) ? (
            <div className="aspect-video relative">
              <iframe
                src={bunnyEmbed(videoUrlNorm)}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; gyroscope; encrypted-media; picture-in-picture"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer"
              />
            </div>
          ) : (/youtube\.com|youtu\.be|vimeo\.com/i).test(videoUrlNorm) ? (
            <div className="aspect-video relative">
              <iframe
                src={videoEmbed(videoUrlNorm)}
                className="absolute inset-0 w-full h-full"
                title={data.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>
          ) : (
            <div className="aspect-video relative">
              <video
                className="absolute inset-0 w-full h-full object-cover"
                controls
                muted
                poster={data.videoPoster ? imgPresets.heroTall(data.videoPoster) : undefined}
                src={videoUrlNorm}
              />
            </div>
          )}
        </div>
      ) : null}

      {/* Cover solo si no hay tour ni video */}
      {!hasTour && !hasVideo && cover ? (
        <div className="card-surface rounded-xl overflow-hidden mb-8">
          <div className="aspect-video relative">
            <Image src={cover!} alt={data.title} fill className="object-cover object-top" />
          </div>
        </div>
      ) : null}

      {/* (se removió la sección secundaria duplicada) */}

      {gallery.length ? (
        <div>
          <h2 className="text-xl font-semibold mb-4">{params.locale === 'pt' ? 'Galeria' : params.locale === 'en' ? 'Gallery' : 'Galería'}</h2>
          <GalleryLightbox items={gallery.map((img: any, i: number) => ({ src: imgPresets.gallery(img)!, alt: `Imagen ${i + 1}` }))} />
        </div>
      ) : null}

      {/* Related projects */}
      {related && related.length ? (
        <div className="mt-12">
          <h2 className="text-xl font-semibold mb-4">Proyectos relacionados</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {related.map((it) => {
              const img = it.thumb ? urlFor(it.thumb).width(800).height(450).fit("crop").url() : null;
              const href = it.slug ? `${basePath}${parent}/${it.slug}` : "#";
              const v = typeof it.videoUrl === 'string' ? it.videoUrl : '';
              const hasV = !!v;
              const hasT = !!it.tourUrl;
              return (
                <SpotCard key={it._id} href={href} className="overflow-hidden">
                  <div className="relative" style={{background: "rgba(255,255,255,0.03)"}}>
                    {hasV ? (
                      /(mediadelivery\.net|bunnycdn)/i.test(v) ? (
                        <div className="aspect-video relative">
                          <iframe
                            src={bunnyEmbed(v)}
                            className="absolute inset-0 w-full h-full"
                            allow="accelerometer; gyroscope; encrypted-media; picture-in-picture"
                            loading="lazy"
                            allowFullScreen
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      ) : /(youtube\.com|youtu\.be|vimeo\.com)/i.test(v) ? (
                        <div className="aspect-video relative">
                          <iframe
                            src={videoEmbed(v)}
                            className="absolute inset-0 w-full h-full"
                            title={it.title}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                            loading="lazy"
                            allowFullScreen
                          />
                        </div>
                      ) : (
                        <div className="aspect-video relative">
                          <video
                            className="absolute inset-0 w-full h-full object-cover"
                            src={v}
                            poster={it.videoPoster ? imgPresets.tile(it.videoPoster) : undefined}
                            muted
                            playsInline
                            autoPlay
                            loop
                          />
                        </div>
                      )
                    ) : hasT ? (
                      <div className="aspect-[9/16] sm:aspect-[4/3] md:aspect-video relative">
                        <iframe
                          src={it.tourUrl}
                          className="absolute inset-0 w-full h-full"
                          allow="fullscreen; xr-spatial-tracking; gyroscope; accelerometer; picture-in-picture"
                          loading="lazy"
                          allowFullScreen
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    ) : (
                      <div className="aspect-video relative">
                        {img ? <Image src={img} alt={it.title} fill className="object-cover" /> : null}
                      </div>
                    )}
                  </div>
                  <div className="p-4 flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-sm">{it.title}</h3>
                      {it.tags?.length ? (
                        <p className="text-xs text-muted">{it.tags.join(" / ")}</p>
                      ) : null}
                    </div>
                    <div className="shrink-0">
                      <span className="btn btn-primary btn-xs !px-2 !py-1 !h-7 text-[11px] leading-tight">
                        {params.locale === 'pt' ? 'Ver detalhes' : params.locale === 'en' ? 'View details' : 'Ver detalles'}
                      </span>
                    </div>
                  </div>
                </SpotCard>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
