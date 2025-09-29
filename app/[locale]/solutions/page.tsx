import { sanityClient } from "@/lib/sanity/client";
import ServicesIndexClient from "@/components/ServicesIndexClient";
import Breadcrumbs from "@/components/Breadcrumbs";

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
