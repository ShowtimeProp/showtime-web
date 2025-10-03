import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
        {/* JSON-LD: Organization */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: toLdJson(jsonLdOrganization()) }} />
        {/* JSON-LD: WebSite (sitelinks search) */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: toLdJson(jsonLdWebsite()) }} />
        {children}
      </body>
    </html>
  );
}
