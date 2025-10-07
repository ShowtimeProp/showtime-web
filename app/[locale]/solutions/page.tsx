import { sanityClient } from "@/lib/sanity/client";
import ServicesIndexClient from "@/components/ServicesIndexClient";
import Breadcrumbs from "@/components/Breadcrumbs";
import { fetchSiteMeta } from "@/lib/site";
import { buildAlternates, renderPattern } from "@/lib/seo";

export const revalidate = 60;

const query = `*[_type == "solution"] | order(coalesce(order, 999) asc, title asc){
  _id,
  "title": coalesce(titleLoc[$locale], titleLoc.es, titleLoc.en, titleLoc.pt, title),
  "short": coalesce(shortLoc[$locale], shortLoc.es, shortLoc.en, shortLoc.pt, short),
  price,
  oldPrice,
  cashDiscountPct,
  badge,
  category,
  categories,
  allInOne,
  icon,
  "slug": slug.current
}`;

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const { seoPatterns, brandShort, base } = await fetchSiteMeta(params.locale);
  const brand = brandShort || 'Showtime Prop';
  const patTitle = seoPatterns?.titleSolutionsLoc?.[params.locale] || (params.locale === 'pt' ? 'Soluções para Imobiliárias | [Brand]' : params.locale === 'en' ? 'Solutions for Real Estate | [Brand]' : 'Soluciones para Inmobiliarias | [Brand]');
  const patDesc = seoPatterns?.descSolutionsLoc?.[params.locale] || (params.locale === 'pt' ? 'IA + conteúdo 360 para captar e converter.' : params.locale === 'en' ? 'AI + 360 content to capture and convert.' : 'IA + contenido 360 para captar y convertir.');
  const t = renderPattern(patTitle, { Brand: brand }, { title: 60 }).title;
  const d = renderPattern(patDesc, { Brand: brand }, { description: 155 }).description;
  return {
    title: t,
    description: d,
    alternates: buildAlternates(`/${params.locale}/solutions`),
    openGraph: { title: t, description: d, type: 'website', url: `${base}/${params.locale}/solutions` },
    twitter: { card: 'summary', title: t, description: d },
  } as any;
}

export default async function SolutionsPage({ params }: { params: { locale: string } }) {
  const basePath = `/${params.locale}`;

  let items: any[] = [];
  try {
    items = await sanityClient.fetch(query, { locale: params.locale });
  } catch {}

  let rates: Record<string, number> | null = null;
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/USD", { next: { revalidate: 3600 } });
    if (res.ok) {
      const json = await res.json();
      rates = json?.rates || null;
    }
  } catch {}

  const tTitle = params.locale === 'pt' ? 'Soluções' : params.locale === 'en' ? 'Solutions' : 'Soluciones';
  const tHome = params.locale === 'pt' ? 'Início' : params.locale === 'en' ? 'Home' : 'Inicio';

  return (
    <main className="halo-page px-6 py-20 sm:px-10 md:px-16 max-w-[1280px] mx-auto">
      <div className="mb-6">
        <Breadcrumbs items={[{ label: tHome, href: basePath || '/' }, { label: tTitle }]} />
      </div>

      <ServicesIndexClient
        locale={params.locale}
        basePath={basePath}
        rates={rates || undefined}
        items={items}
        title={tTitle}
        detailBaseSegment="solutions"
        labels={{
          search: params.locale === 'pt' ? 'Buscar soluções' : params.locale === 'en' ? 'Search solutions' : 'Buscar soluciones',
        }}
      />
    </main>
  );
}
