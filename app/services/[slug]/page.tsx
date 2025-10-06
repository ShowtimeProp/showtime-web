import { redirect } from "next/navigation";

type Params = { params: { slug: string } };

export const dynamic = "force-static";

export default function ServiceDetail({ params }: Params) {
  // Prevent non-locale detail route usage; send to default locale preserving slug
  const slug = params.slug;
  redirect(`/es/services/${encodeURIComponent(slug)}`);
}
