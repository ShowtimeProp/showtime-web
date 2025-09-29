import { sanityClient } from "@/lib/sanity/client";
import BlogIndexClient from "@/components/BlogIndexClient";
import Breadcrumbs from "@/components/Breadcrumbs";

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

      <BlogIndexClient
        locale={params.locale}
        basePath={basePath}
        items={items}
      />
    </main>
  );
}
