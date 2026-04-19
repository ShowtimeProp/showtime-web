import { redirect } from "next/navigation";

/** Rutas que viven bajo /[locale]/… — si vienen sin prefijo (/policy), mandar a /es/… y no al home. */
const ROOT_LOCALE_ROUTES = new Set([
  "policy",
  "privacy",
  "terms",
  "contact",
  "portfolio",
  "blog",
  "services",
  "solutions",
]);

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function CatchAllPage({ params }: { params: Promise<{ rest: string[] }> }) {
  const { rest } = await params;
  const segments = Array.isArray(rest) ? rest : [];

  if (segments.length === 1) {
    const seg = segments[0];
    if (seg && ROOT_LOCALE_ROUTES.has(seg)) {
      redirect(`/es/${seg}`);
    }
  }

  redirect(`/es`);
}
