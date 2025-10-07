import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { buildAlternates, getBaseUrl, jsonLdOrganization, jsonLdWebsite, toLdJson } from "@/lib/seo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Showtime Prop — Real Estate Marketing",
    template: "%s | Showtime Prop",
  },
  description:
    "Servicios de marketing inmobiliario: fotografía profesional, tours virtuales, video 360, edición, planos Unreal Engine e IA con n8n.",
  metadataBase: new URL(getBaseUrl()),
  alternates: buildAlternates("/"),
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-icon.png",
  },
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    title: "Showtime Prop — Real Estate Marketing",
    description:
      "Servicios de marketing inmobiliario: fotografía profesional, tours virtuales, video 360, edición, planos Unreal Engine e IA con n8n.",
    url: getBaseUrl(),
  },
  twitter: {
    card: "summary_large_image",
    title: "Showtime Prop",
    description:
      "Servicios de marketing inmobiliario: fotografía profesional, tours virtuales, video 360, edición, planos Unreal Engine e IA con n8n.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Google Tag Manager OR Meta Pixel fallback */}
        {process.env.NEXT_PUBLIC_GTM_ID ? (
          <>
            {/* GTM: dataLayer init + loader */}
            <script
              dangerouslySetInnerHTML={{
                __html: `window.dataLayer=window.dataLayer||[];window.dataLayer.push({'gtm.start': new Date().getTime(), event:'gtm.js'}); (function(w,d,s,l,i){w[l]=w[l]||[];var f=d.getElementsByTagName(s)[0], j=d.createElement(s), dl=l!='dataLayer'?'&l='+l:''; j.async=true; j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl; f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${process.env.NEXT_PUBLIC_GTM_ID}');`,
              }}
            />
            {/* GTM noscript */}
            <noscript>
              <iframe src={`https://www.googletagmanager.com/ns.html?id=${process.env.NEXT_PUBLIC_GTM_ID}`} height="0" width="0" style={{display:'none',visibility:'hidden'}}></iframe>
            </noscript>
            {/* Event delegation: push to dataLayer */}
            <script
              dangerouslySetInnerHTML={{
                __html: `document.addEventListener('click',function(e){var el=e.target; if(!(el instanceof Element)) return; var a=el.closest('a,button'); if(!a) return; var href=a.getAttribute('href')||''; var isWA=/^https?:\/\/wa\.me\//i.test(href); var isLead=a.hasAttribute('data-lead')||a.classList.contains('track-lead'); if(isWA){window.dataLayer&&window.dataLayer.push({event:'whatsapp_click', href: href});} if(isLead||isWA){window.dataLayer&&window.dataLayer.push({event:'lead'});} }, true);`,
              }}
            />
          </>
        ) : process.env.NEXT_PUBLIC_META_PIXEL_ID ? (
          <>
            {/* Fallback: direct Meta Pixel only if GTM not present */}
            <script
              dangerouslySetInnerHTML={{
                __html: `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod? n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window, document,'script','https://connect.facebook.net/en_US/fbevents.js'); fbq('init', '${process.env.NEXT_PUBLIC_META_PIXEL_ID}'); fbq('track', 'PageView');`,
              }}
            />
            <noscript>
              <img height="1" width="1" style={{ display: 'none' }} src={`https://www.facebook.com/tr?id=${process.env.NEXT_PUBLIC_META_PIXEL_ID}&ev=PageView&noscript=1`} />
            </noscript>
          </>
        ) : null}
        {/* JSON-LD: Organization */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: toLdJson(jsonLdOrganization()) }} />
        {/* JSON-LD: WebSite (sitelinks search) */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: toLdJson(jsonLdWebsite()) }} />
        {children}
        {process.env.NODE_ENV === 'production' && <SpeedInsights />}
      </body>
    </html>
  );
}
