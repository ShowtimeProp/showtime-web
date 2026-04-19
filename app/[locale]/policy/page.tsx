import { permanentRedirect } from "next/navigation";

/** Alias: muchos enlaces usan /policy; el contenido oficial está en /privacy */
export default async function PolicyAliasPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  permanentRedirect(`/${locale}/privacy`);
}
