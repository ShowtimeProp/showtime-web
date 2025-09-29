import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = "https://showtimeprop.com";
  return {
    rules: {
      userAgent: "*",
      allow: ["/"],
      disallow: [],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
