import type { MetadataRoute } from "next";
import { getBaseUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  const base = getBaseUrl();
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/"],
        // Disallow admin and internal routes on main domain
        disallow: [
          "/studio",
          "/api",
          "/api/",
          // Legacy Woo/old site cart URLs
          "/*?add-to-cart=*",
          "/es?add-to-cart=*",
          "/en?add-to-cart=*",
          "/pt?add-to-cart=*",
          // Legacy content that shouldn't be indexed anymore
          "/maral-explanada-torres-pelli-mar-del-plata/",
          "/maral-explanada-torres-pelli-mar-del-plata",
          "/edificio-palacio-cosmos-mar-del-plata/",
          "/edificio-palacio-cosmos-mar-del-plata",
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
