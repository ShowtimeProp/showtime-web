import { sanityClient } from "@/lib/sanity/client";
import Packs from "@/components/Packs";
import ServicesIndexClient from "@/components/ServicesIndexClient";
import Breadcrumbs from "@/components/Breadcrumbs";
import { fetchSiteMeta } from "@/lib/site";
import { buildAlternates, renderPattern } from "@/lib/seo";

export const revalidate = 60;

const servicesQuery = `*[_type == "service"] | order(coalesce(order, 999) asc, title asc){
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
  const patTitle = seoPatterns?.titleServicesLoc?.[params.locale] || (params.locale === 'pt' ? 'Serviços de [Brand] | Marketing Imobiliário 360' : params.locale === 'en' ? 'Services by [Brand] | Real Estate Marketing 360' : 'Servicios de [Brand] | Marketing Inmobiliario 360');
  const patDesc = seoPatterns?.descServicesLoc?.[params.locale] || (params.locale === 'pt' ? 'Foto HDR, tours 360, vídeo e IA. Mais visitas qualificadas e vendas.' : params.locale === 'en' ? 'HDR photos, 360 tours, video and AI. More qualified visits and sales.' : 'Foto HDR, tours 360, video e IA. Más visitas cualificadas y ventas.');
  const t = renderPattern(patTitle, { Brand: brand }, { title: 60 }).title;
  const d = renderPattern(patDesc, { Brand: brand }, { description: 155 }).description;
  return {
    title: t,
    description: d,
    alternates: buildAlternates(`/${params.locale}/services`),
    openGraph: { title: t, description: d, type: 'website', url: `${base}/${params.locale}/services` },
    twitter: { card: 'summary', title: t, description: d },
  } as any;
}

export default async function ServicesPage({ params }: { params: { locale: string } }) {
  const basePath = `/${params.locale}`;

  // Fetch all services
  let services: any[] = [];
  try {
    services = await sanityClient.fetch(servicesQuery, { locale: params.locale });
  } catch {}

  // Fetch FX rates (USD base) and pass down to Packs
  let rates: Record<string, number> | null = null;
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/USD", { next: { revalidate: 3600 } });
    if (res.ok) {
      const json = await res.json();
      rates = json?.rates || null;
    }
  } catch {}

  const tTitle = params.locale === 'pt' ? 'Serviços' : params.locale === 'en' ? 'Services' : 'Servicios';
  const tHome = params.locale === 'pt' ? 'Início' : params.locale === 'en' ? 'Home' : 'Inicio';

  return (
    <main className="halo-page px-6 py-20 sm:px-10 md:px-16 max-w-[1280px] mx-auto">
      <div className="mb-6">
        <Breadcrumbs items={[
          { label: tHome, href: basePath || '/' },
          { label: tTitle },
        ]} />
      </div>

      <ServicesIndexClient
        locale={params.locale}
        basePath={basePath}
        rates={rates || undefined}
        items={services}
      />
    </main>
  );
}
