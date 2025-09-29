import Image from "next/image";
import Link from "next/link";
import { sanityClient } from "@/lib/sanity/client";
import { urlFor } from "@/lib/sanity/image";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import MobileNav from "@/components/MobileNav";

const query = `*[_type == "siteSettings"][0]{
  siteTitle,
  siteTitleLoc,
  description,
  descriptionLoc,
  logo,
  navigation[]{label, labelLoc, href}
}`;

export default async function SiteHeader({ locale, basePath = "" }: { locale?: string; basePath?: string }) {
  let data: any = {};
  try {
    data = await sanityClient.fetch(query);
  } catch {
    // ignore fetch errors in dev; show fallback header
  }

  const title = (locale && data?.siteTitleLoc?.[locale]) || data?.siteTitleLoc?.es || data?.siteTitle || "Showtime Prop";
  const nav = (data?.navigation || [
    { label: "Soluciones", href: "/solutions" },
    { label: "Servicios", href: "/services" },
    { label: "Blog", href: "/blog" },
    { label: "Portfolio", href: "/portfolio" },
    { label: "Contacto", href: "/contact" },
  ]).map((n: any) => ({
    label: (locale && n?.labelLoc?.[locale]) || n?.labelLoc?.es || n?.label,
    href: n?.href
  }));

  // Normalize any localized top-level segment to canonical, then prefix locale
  const toCanonical = (p: string) => {
    const map: Record<string, string> = {
      soluciones: 'solutions',
      solucoes: 'solutions',
      servicios: 'services',
      servicos: 'services',
      portafolio: 'portfolio',
      contato: 'contact',
      contacto: 'contact',
      projeto: 'project',
      proyecto: 'project',
      notas: 'blog',
      artigos: 'blog',
    };
    const seg = p.split('/')[1] || '';
    const normalized = map[seg] || seg;
    if (normalized === seg) return p;
    return `/${normalized}${p.slice(seg.length + 1)}`;
  };
  // Build localized, prefixed paths once for reuse (do NOT rewrite segments; pages live under canonical English segments)
  const localizePath = (path: string) => {
    if (!path?.startsWith("/")) return path || "#";
    const canonical = toCanonical(path);
    return `${basePath}${canonical}`;
  };
  const navItems = (nav as Array<{ label: string; href: string }>).map((item) => {
    const href = localizePath(item.href);
    let label = item.label;
    const seg = (item.href || "").split("/")[1];
    if (seg === "blog") {
      label = locale === "es" ? "Notas" : locale === "pt" ? "Artigos" : "Blog";
    }
    // Redirect Contact to WhatsApp external link
    const isContact = seg === "contact" || seg === "contato" || seg === "contacto";
    const external = isContact ? `https://wa.me/5492233544057?text=${encodeURIComponent(locale === 'pt' ? 'Olá! Quero saber mais.' : locale === 'en' ? 'Hi! I would like to know more.' : '¡Hola! Quiero saber más.')}` : undefined;
    // If it's contact, also override href so mobile menu can use it seamlessly
    const finalHref = external || href;
    return { label, href: finalHref, external, isContact } as any;
  });

  const logoUrl = data?.logo ? urlFor(data.logo).width(28).height(28).url() : null;

  return (
    <header className="fixed top-0 left-0 right-0 z-[9999] pointer-events-auto flex items-center justify-between px-6 py-4 border-b bg-[rgba(11,10,16,0.6)] backdrop-blur-md w-full">
      <Link href={basePath || "/"} aria-label="Go to home" className="brand-link flex items-center gap-2">
        {logoUrl ? (
          <Image src={logoUrl} alt="" aria-hidden width={28} height={28} className="brand-logo rounded" />
        ) : null}
        <span className="brand-title font-semibold">{title}</span>
      </Link>
      <div className="flex items-center gap-4 text-sm">
        {/* Desktop nav */}
        <nav className="hidden md:flex gap-4">
          {navItems.map((item: any) => (
            item.external ? (
              <a
                key={item.label}
                href={item.external}
                target="_blank"
                rel="noopener noreferrer"
                className={`hover:underline ${item.isContact ? 'text-green-400 hover:text-green-300' : ''}`}
              >
                {item.label}
              </a>
            ) : (
              <Link key={item.href + item.label} href={item.href} className="hover:underline">
                {item.label}
              </Link>
            )
          ))}
        </nav>
        {/* Mobile hamburger to the left of the language switcher */}
        <div className="md:hidden">
          <MobileNav items={navItems.map((i: any) => ({ label: i.label, href: i.href }))} />
        </div>
        <LanguageSwitcher currentLocale={locale || "es"} />
      </div>
    </header>
  );
}
