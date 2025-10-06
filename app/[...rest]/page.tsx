import { headers } from "next/headers";
import { redirect } from "next/navigation";

// Catch-all for any non-matched route at root (without locale)
// Redirects to default locale root to avoid UI deformation from legacy/garbage URLs.

export const dynamic = "force-static";

function detectLocaleFromHeaders(): "es" | "en" | "pt" {
  const h = headers();
  const al = (h.get("accept-language") || "").toLowerCase();
  const cand = al.split(",").map((s) => s.split(";")[0].trim().slice(0, 2));
  for (const c of cand) {
    if (c === "es" || c === "en" || c === "pt") return c as any;
  }
  return "es";
}

export default function CatchAllPage() {
  const locale = detectLocaleFromHeaders();
  redirect(`/${locale}`);
}
