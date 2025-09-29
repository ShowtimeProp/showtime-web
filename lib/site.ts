import { sanityClient } from "@/lib/sanity/client";
import { urlFor } from "@/lib/sanity/image";
import { getBaseUrl } from "@/lib/seo";

export async function fetchSiteMeta(locale: string) {
  try {
    const data = await sanityClient.fetch(`*[_type == "siteSettings"][0]{
      siteTitle,
      siteTitleLoc,
      description,
      descriptionLoc,
      ogImage
    }`);
    const title = (data?.siteTitleLoc?.[locale]) || data?.siteTitleLoc?.es || data?.siteTitle || "Showtime Prop";
    const description = (data?.descriptionLoc?.[locale]) || data?.descriptionLoc?.es || data?.description || "";
    const image = data?.ogImage ? urlFor(data.ogImage).width(1200).height(630).url() : undefined;
    const base = getBaseUrl();
    return { title, description, image, base };
  } catch {
    const base = getBaseUrl();
    return { title: "Showtime Prop", description: "", image: undefined, base };
  }
}
