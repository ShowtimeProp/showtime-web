import { sanityClient } from "@/lib/sanity/client";
import Breadcrumbs from "@/components/Breadcrumbs";
import { PortableText } from "@portabletext/react";
import { fetchSiteMeta } from "@/lib/site";
import { urlFor, imgPresets } from "@/lib/sanity/image";
import Image from "next/image";
import BackToTopFab from "@/components/BackToTopFab";
import { renderPattern } from "@/lib/seo";

export const revalidate = 60;

const query = `*[_type == "post" && slug.current == $slug][0]{
  "title": coalesce(titleLoc[$locale], titleLoc.es, titleLoc.en, titleLoc.pt, title),
  "short": coalesce(excerptLoc[$locale], excerptLoc.es, excerptLoc.en, excerptLoc.pt, excerpt),
  "body": coalesce(bodyLoc[$locale], bodyLoc.es, bodyLoc.en, bodyLoc.pt, body),
  mainImage,
  videoUrl,
  "seo": {
    "title": coalesce(seoTitleLoc[$locale], seoTitleLoc.es, seoTitleLoc.en, seoTitleLoc.pt, title),
    "description": coalesce(seoDescriptionLoc[$locale], seoDescriptionLoc.es, seoDescriptionLoc.en, seoDescriptionLoc.pt, excerpt),
    "image": coalesce(ogImage, mainImage, siteImage)
  },
  videoPoster,
  categories,
  tags,
  publishedAt
}`;

const relatedQuery = `*[_type == "post" && slug.current != $slug && (
  count((categories[])[@ in $cats]) > 0 || count((tags[])[@ in $tags]) > 0
)] | order(coalesce(publishedAt, _createdAt) desc)[0...4]{
  _id,
  "title": coalesce(titleLoc[$locale], titleLoc.es, titleLoc.en, titleLoc.pt, title),
  "short": coalesce(excerptLoc[$locale], excerptLoc.es, excerptLoc.en, excerptLoc.pt, excerpt),
  mainImage,
  "slug": slug.current,
  categories,
  tags
}`;

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

export default async function BlogDetailPage({ params }: { params: { locale: string; slug: string } }) {
  const basePath = `/${params.locale}`;
  const tHome = params.locale === 'pt' ? 'Início' : params.locale === 'en' ? 'Home' : 'Inicio';
  const tBlog = params.locale === 'pt' ? 'Artigos' : params.locale === 'en' ? 'Posts' : 'Notas';
  const tCTA = {
    title: params.locale === 'pt' ? 'Pronto para avançar seu marketing?' : params.locale === 'en' ? 'Ready to level up your marketing?' : '¿Listo para potenciar tu marketing?',
    primary: params.locale === 'pt' ? 'Explorar Soluções' : params.locale === 'en' ? 'Explore Solutions' : 'Explorar Soluciones',
    secondary: params.locale === 'pt' ? 'Ver Serviços' : params.locale === 'en' ? 'View Services' : 'Ver Servicios',
  };

  const data = await sanityClient.fetch(query, { slug: params.slug, locale: params.locale }).catch(() => null);
  if (!data) return null;

  // Build a simple Table of Contents from h2/h3 blocks
  const blocks = Array.isArray(data.body) ? data.body : [];
  const slugify = (str: string) =>
    (str || "")
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
  const toc = blocks
    .filter((b: any) => b?._type === 'block' && (b.style === 'h2' || b.style === 'h3'))
    .map((b: any) => {
      const text = (b.children || []).map((c: any) => c.text).join('').trim();
      return { level: b.style as 'h2' | 'h3', text, id: slugify(text) };
    });

  const related = await sanityClient.fetch(relatedQuery, {
    slug: params.slug,
    cats: data.categories || [],
    tags: data.tags || [],
    locale: params.locale,
  }).catch(() => []);

  return (
    <main id="top" className="halo-page px-6 py-20 sm:px-10 md:px-16 max-w-[1100px] mx-auto">
      <div className="mb-6">
        <Breadcrumbs items={[{ label: tHome, href: basePath }, { label: tBlog, href: `${basePath}/blog` }, { label: data.title }]} />
      </div>

      <h1 className="text-3xl font-bold mb-3">{data.title}</h1>
      {data.short ? <p className="text-white/70 mb-4">{data.short}</p> : null}

      {/* Media: prefer videoUrl over mainImage */}
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
              poster={data.videoPoster?.asset?._ref ? `${process.env.NEXT_PUBLIC_SANITY_CDN_BASE}${data.videoPoster.asset._ref}` : undefined}
              src={data.videoUrl}
            />
          </div>
        )
      ) : data.mainImage ? (
        <div className="mb-6 aspect-[4/3] relative rounded-xl overflow-hidden border border-white/10">
          <Image src={imgPresets.heroTall(data.mainImage)} alt={data.title} fill className="object-cover object-top" />
        </div>
      ) : null}

      {/* Meta */}
      <div className="mt-8 flex flex-wrap gap-3 text-xs text-white/60">
        {data.publishedAt ? <span>📅 {new Date(data.publishedAt).toLocaleDateString()}</span> : null}
        {(data.categories || []).map((c: string) => <span key={c} className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10">{c}</span>)}
        {(data.tags || []).map((t: string) => <span key={t} className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10">#{t}</span>)}
      </div>

      {/* TOC (if enough items) */}
      {toc.length >= 3 ? (
        <div className="mt-6 mb-3 text-sm text-white/70 flex flex-wrap gap-2">
          {toc.map((t: { id: string; text: string }) => (
            <a key={t.id} href={`#${t.id}`} className="px-2 py-1 rounded-md border border-white/10 hover:border-white/20 hover:bg-white/5">
              {t.text}
            </a>
          ))}
        </div>
      ) : null}

      {/* Body */}
      {Array.isArray(data.body) && data.body.length ? (
        <div className="prose-blog mt-4">
          <PortableText
            value={data.body}
            components={{
              block: {
                h2: ({ children }) => {
                  const text = String(children);
                  const id = slugify(text);
                  return <h2 id={id}><a href={`#${id}`}>{children}</a></h2>;
                },
                h3: ({ children }) => {
                  const text = String(children);
                  const id = slugify(text);
                  return <h3 id={id}><a href={`#${id}`}>{children}</a></h3>;
                },
                normal: ({ children }) => <p>{children}</p>,
                blockquote: ({ children }) => <blockquote>{children}</blockquote>,
              },
              list: {
                bullet: ({ children }) => <ul>{children}</ul>,
                number: ({ children }) => <ol>{children}</ol>,
              },
              listItem: {
                bullet: ({ children }) => <li>{children}</li>,
                number: ({ children }) => <li>{children}</li>,
              },
              marks: {
                link: ({ children, value }) => {
                  const href = value?.href || '#';
                  const isExternal = /^https?:\/\//i.test(href);
                  return isExternal ? (
                    <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>
                  ) : (
                    <a href={href}>{children}</a>
                  );
                },
                em: ({ children }) => <em>{children}</em>,
                strong: ({ children }) => <strong>{children}</strong>,
                highlight: ({ children }) => <mark className="mark-highlight">{children}</mark>,
              },
              types: {
                image: ({ value }) => {
                  try {
                    const src = urlFor(value).width(1200).url();
                    const alt = value?.alt || '';
                    return (
                      <figure className="my-4">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={src} alt={alt} className="rounded-lg border border-white/10" />
                        {alt ? <figcaption className="text-xs text-white/60 mt-1">{alt}</figcaption> : null}
                      </figure>
                    );
                  } catch {
                    return null;
                  }
                },
                code: ({ value }) => (
                  <pre className="bg-black/50 rounded-md p-3 overflow-x-auto border border-white/10 text-xs">
                    <code>{value?.code || ''}</code>
                  </pre>
                ),
                table: ({ value }) => (
                  <div className="table-wrap">
                    {/* Fallback: expect standard table schema with rows/cells */}
                    <table>
                      <tbody>
                        {(value?.rows || []).map((row: any, i: number) => (
                          <tr key={i}>
                            {(row?.cells || []).map((cell: any, j: number) => (
                              <td key={j}>{String(cell || '')}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ),
              },
            }}
          />
        </div>
      ) : null}

      {/* Back to top */}
      <div className="mt-6 text-right">
        <a href="#top" className="btn btn-ghost text-xs">
          {params.locale === 'pt' ? 'Voltar ao topo' : params.locale === 'en' ? 'Back to top' : 'Volver arriba'}
        </a>
      </div>

      <BackToTopFab
        label={params.locale === 'pt' ? 'Topo' : params.locale === 'en' ? 'Top' : 'Arriba'}
      />

      {/* CTA Footer (unificado) */}
      <div className="mt-10 card-surface rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="text-white/90 font-semibold">{tCTA.title}</div>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <a href={`${basePath}/solutions`} className="btn btn-primary shadow-md">{tCTA.primary}</a>
          <a href={`${basePath}/services`} className="btn btn-outline-primary">{tCTA.secondary}</a>
          <a
            href={`https://wa.me/5492233544057?text=${encodeURIComponent(params.locale === 'pt' ? 'Olá! Quero saber mais.' : params.locale === 'en' ? 'Hi! I want to know more.' : '¡Hola! Quiero saber más.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-success pulse-2s transition transform hover:-translate-y-0.5 shadow-[0_0_0_rgba(0,0,0,0)] hover:shadow-[0_0_24px_rgba(34,197,94,0.35)]"
            aria-label="WhatsApp"
          >
            WhatsApp
          </a>
        </div>
      </div>

      {/* Related posts */}
      {related && related.length ? (
        <div className="mt-10">
          <h3 className="text-xl font-semibold mb-4">{params.locale === 'pt' ? 'Artigos relacionados' : params.locale === 'en' ? 'Related posts' : 'Notas relacionadas'}</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {related.map((p: any) => (
              <a key={p._id} href={`${basePath}/blog/${p.slug}`} className="spotlight card-surface p-5 block">
                {p.mainImage ? (
                  <div className="mb-3 aspect-[4/3] relative rounded-md overflow-hidden" style={{background: "rgba(255,255,255,0.03)"}}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={urlFor(p.mainImage).width(600).height(450).url()} alt={p.title} className="absolute inset-0 w-full h-full object-cover" />
                  </div>
                ) : null}
                <div className="font-medium mb-1">{p.title}</div>
                {p.short ? <div className="text-sm text-white/70 line-clamp-2">{p.short}</div> : null}
              </a>
            ))}
          </div>
        </div>
      ) : null}
    </main>
  );
}

export async function generateMetadata({ params }: { params: { locale: string; slug: string } }) {
  const data = await sanityClient.fetch(query, { slug: params.slug, locale: params.locale }).catch(() => null);
  const { seoPatterns, brandShort, image: siteImg, base } = await fetchSiteMeta(params.locale);
  const brand = brandShort || 'Showtime Prop';
  const patTitle = seoPatterns?.titlePostLoc?.[params.locale] || (params.locale === 'pt' ? '[PostTitle] | [Brand]' : params.locale === 'en' ? '[PostTitle] | [Brand]' : '[PostTitle] | [Brand]');
  const patDesc = seoPatterns?.descPostLoc?.[params.locale] || (params.locale === 'pt' ? 'Resumo do artigo em uma frase.' : params.locale === 'en' ? 'One-line summary of the article.' : 'Resumen del artículo en una frase.');
  const postTitle = data?.title || (params.locale === 'pt' ? 'Artigo' : params.locale === 'en' ? 'Post' : 'Nota');
  const perItemTitle = (data as any)?.seoTitleLoc?.[params.locale] as string | undefined;
  const perItemDesc = (data as any)?.seoDescriptionLoc?.[params.locale] as string | undefined;
  const t = (perItemTitle && perItemTitle.trim()) || renderPattern(patTitle, { Brand: brand, PostTitle: postTitle }, { title: 60 }).title;
  const d = (perItemDesc && perItemDesc.trim()) || renderPattern(patDesc, { PostTitle: postTitle }, { description: 155 }).description;
  const ogImage = (data as any)?.ogImage ? urlFor((data as any).ogImage).width(1200).height(630).url() : (data?.mainImage ? urlFor(data.mainImage).width(1200).height(630).url() : siteImg);
  return {
    title: t,
    description: d,
    metadataBase: new URL(base),
    openGraph: {
      title: t,
      description: d,
      type: 'article',
      url: `${base}/${params.locale}/blog/${params.slug}`,
      images: ogImage ? [{ url: ogImage, width: 1200, height: 630, alt: t }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: t,
      description: d,
      images: ogImage ? [ogImage] : undefined,
    },
  } as any;
}
