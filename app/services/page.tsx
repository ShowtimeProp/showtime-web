import { redirect } from "next/navigation";

export const dynamic = "force-static";

export default function ServicesPage() {
  // Prevent non-locale route usage; send to default locale
  redirect("/es/services");
}
