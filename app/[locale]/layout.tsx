import { ReactNode } from 'react';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import HaloParallax from '@/components/HaloParallax';
import WhatsAppWidget from '@/components/WhatsAppWidget';
import { sanityClient } from '@/lib/sanity/client';
import { urlFor } from '@/lib/sanity/image';

export default async function LocaleLayout({
  children,
  params
}: {
  children: ReactNode;
  params: { locale: string };
}) {
  // Passthrough layout; root app/layout.tsx handles <html>/<body> and fonts.
  // We removed next-intl provider to avoid config-file coupling for now.
  const locale = params.locale || 'es';
  const basePath = `/${locale}`;
  // Fetch logo for chat bubble avatar
  let logoUrl: string | null = null;
  let bubbleText: string | undefined = undefined;
  try {
    const data = await sanityClient.fetch(`*[_type == "siteSettings"][0]{logo, waBubbleTextLoc}`);
    if (data?.logo) logoUrl = urlFor(data.logo).width(24).height(24).url();
    bubbleText = (data?.waBubbleTextLoc?.[locale]) || data?.waBubbleTextLoc?.es;
  } catch {}
  return (
    <>
      <HaloParallax />
      <SiteHeader locale={locale} basePath={basePath} />
      <main className="pt-20">{children}</main>
      <SiteFooter locale={locale} />
      {/* Floating WhatsApp widget */}
      <WhatsAppWidget locale={locale as 'es' | 'en' | 'pt'} logoUrl={logoUrl || undefined} bubbleText={bubbleText} />
    </>
  );
}
