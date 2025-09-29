import Breadcrumbs from "@/components/Breadcrumbs";
import ContactForm from "@/components/ContactForm";
import { fetchSiteMeta } from "@/lib/site";
import { buildAlternates } from "@/lib/seo";

export const revalidate = 60;

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const basePath = `/${locale}`;
  const t = (k: string) => {
    const dict: Record<string, Record<string, string>> = {
      es: { title: "Contacto", home: "Inicio", subtitle: "¿Listo para impulsar tu marketing inmobiliario?", info: "Información de contacto", email: "Email", phone: "Teléfono", whatsapp: "WhatsApp", instagram: "Instagram", hours: "Horario", hoursVal: "Lun a Vie 9–18 hs" },
      pt: { title: "Contato", home: "Início", subtitle: "Pronto para impulsionar seu marketing imobiliário?", info: "Informações de contacto", email: "Email", phone: "Telefone", whatsapp: "WhatsApp", instagram: "Instagram", hours: "Horário", hoursVal: "Seg a Sex 9–18 h" },
      en: { title: "Contact", home: "Home", subtitle: "Ready to boost your real estate marketing?", info: "Contact information", email: "Email", phone: "Phone", whatsapp: "WhatsApp", instagram: "Instagram", hours: "Hours", hoursVal: "Mon–Fri 9am–6pm" },
    };
    return dict[locale as keyof typeof dict]?.[k] || dict.en[k];
  };

  const waPrefill = (() => {
    if (locale === 'pt') return 'Olá! Gostaria de consultar sobre os serviços da Showtime Prop.';
    if (locale === 'en') return "Hi! I'd like to ask about Showtime Prop services.";
    return '¡Hola! Me gustaría consultar por los servicios de Showtime Prop.';
  })();
  const waHref = `https://wa.me/5492233544057?text=${encodeURIComponent(waPrefill)}`;

  return (
    <main className="px-6 py-20 sm:px-10 md:px-16 max-w-[1280px] mx-auto">
      {/* Breadcrumbs */}
      <div className="mb-6">
        <Breadcrumbs items={[{ label: t("home"), href: basePath }, { label: t("title") }]} />
      </div>

      {/* Heading */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{t("title")}</h1>
        <p className="text-white/70">{t("subtitle")}</p>
      </div>

      {/* Two-column layout */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Info card */}
        <section className="spotlight card-surface p-5 rounded-xl">
          <h3 className="text-lg font-semibold mb-3">{t("info")}</h3>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-3">
              <span className="inline-flex w-7 h-7 items-center justify-center rounded-md bg-white/10">☎</span>
              <div>
                <div className="text-white/80">{t("phone")}</div>
                <a className="hover:underline" href="tel:+5492233544057">+54 9 223 354-4057</a>
              </div>
            </li>
            <li className="flex items-center gap-3">
              <span className="inline-flex w-7 h-7 items-center justify-center rounded-md bg-white/10">🟢</span>
              <div>
                <div className="text-white/80">{t("whatsapp")}</div>
                <a className="hover:underline" target="_blank" rel="noopener noreferrer" href={waHref}>wa.me/5492233544057</a>
              </div>
            </li>
            <li className="flex items-center gap-3">
              <span className="inline-flex w-7 h-7 items-center justify-center rounded-md bg-white/10">�</span>
              <div>
                <div className="text-white/80">{t("instagram")}</div>
                <a className="hover:underline" target="_blank" rel="noopener noreferrer" href="https://instagram.com/showtimeprop">@showtimeprop</a>
              </div>
            </li>
            <li className="flex items-center gap-3">
              <span className="inline-flex w-7 h-7 items-center justify-center rounded-md bg-white/10">⏰</span>
              <div>
                <div className="text-white/80">{t("hours")}</div>
                <div>{t("hoursVal")}</div>
              </div>
            </li>
          </ul>
        </section>

        {/* Form card */}
        <ContactForm locale={locale} />
      </div>
    </main>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const { title, description, image, base } = await fetchSiteMeta(locale);
  const pageTitle = `${title} | ${locale === 'es' ? 'Contacto' : locale === 'pt' ? 'Contato' : 'Contact'}`;
  return {
    title: pageTitle,
    description,
    alternates: buildAlternates('/contact'),
    metadataBase: new URL(base),
    openGraph: {
      title: pageTitle,
      description,
      type: 'website',
      url: `${base}/${locale}/contact`,
      images: image ? [{ url: image, width: 1200, height: 630, alt: pageTitle }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description,
      images: image ? [image] : undefined,
    },
  } as any;
}
