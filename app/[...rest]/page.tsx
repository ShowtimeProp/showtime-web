import { redirect } from "next/navigation";

// Catch-all for any non-matched route at root (without locale)
// Redirects to default locale root to avoid UI deformation from legacy/garbage URLs.

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function CatchAllPage() {
  redirect(`/es`);
}
