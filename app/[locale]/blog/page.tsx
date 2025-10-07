import { sanityClient } from "@/lib/sanity/client";
import BlogIndexClient from "@/components/BlogIndexClient";
import Breadcrumbs from "@/components/Breadcrumbs";
import { fetchSiteMeta } from "@/lib/site";
import { buildAlternates, renderPattern } from "@/lib/seo";

export const revalidate = 60;

const query = `*[_type == "post"] | order(coalesce(publishedAt, _createdAt) desc){
  _id,
  "title": coalesce(titleLoc[$locale], titleLoc.es, titleLoc.en, titleLoc.pt, title),
  "short": coalesce(excerptLoc[$locale], excerptLoc.es, excerptLoc.en, excerptLoc.pt, excerpt),
  mainImage,
  categories,
  tags,
  "slug": slug.current
}`;

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const { seoPatterns, brandShort, base } = await fetchSiteMeta(params.locale);
  const brand = brandShort || 'Showtime Prop';
  const patTitle = seoPatterns?.titleBlogLoc?.[params.locale] || (params.locale === 'pt' ? 'Artigos de [Brand] | Marketing Imobiliário' : params.locale === 'en' ? 'Blog by [Brand] | Real Estate Marketing' : 'Notas de [Brand] | Marketing Inmobiliario');
  const patDesc = seoPatterns?.descBlogLoc?.[params.locale] || (params.locale === 'pt' ? 'Guias e tendências para captar clientes.' : params.locale === 'en' ? 'Guides and trends to attract clients.' : 'Guías y tendencias para captar clientes.');
  const t = renderPattern(patTitle, { Brand: brand }, { title: 60 }).title;
  const d = renderPattern(patDesc, { Brand: brand }, { description: 155 }).description;
  return {
    title: t,
    description: d,
    alternates: buildAlternates(`/${params.locale}/blog`),
    openGraph: { title: t, description: d, type: 'website', url: `${base}/${params.locale}/blog` },
    twitter: { card: 'summary', title: t, description: d },
  } as any;
}

export default async function BlogPage({ params }: { params: { locale: string } }) {
  const basePath = `/${params.locale}`;
  const items = await sanityClient.fetch(query, { locale: params.locale }).catch(() => []);

  const tTitle = params.locale === 'pt' ? 'Artigos' : params.locale === 'en' ? 'Posts' : 'Notas';
  const tHome = params.locale === 'pt' ? 'Início' : params.locale === 'en' ? 'Home' : 'Inicio';

  return (
    <main className="halo-page px-6 py-20 sm:px-10 md:px-16 max-w-[1280px] mx-auto">
      <div className="mb-6">
        <Breadcrumbs items={[{ label: tHome, href: basePath || '/' }, { label: tTitle }]} />
      </div>

      <BlogIndexClient locale={params.locale} basePath={basePath} items={items} />
    </main>
  );
}
