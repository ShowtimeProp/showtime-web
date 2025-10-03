import { ReactNode } from 'react';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import HaloParallax from '@/components/HaloParallax';
import WhatsAppWidget from '@/components/WhatsAppWidget';

export default function LocaleLayout({
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
  return (
    <>
      <HaloParallax />
      <SiteHeader locale={locale} basePath={basePath} />
      <main className="pt-20">{children}</main>
      <SiteFooter locale={locale} />
      {/* Floating WhatsApp widget */}
      <WhatsAppWidget locale={locale as 'es' | 'en' | 'pt'} />
    </>
  );
}
