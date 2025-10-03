import type { MetadataRoute } from "next";
import { sanityClient } from "@/lib/sanity/client";
import { getBaseUrl, SUPPORTED_LOCALES } from "@/lib/seo";

// Build a comprehensive sitemap including localized sections and dynamic content
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getBaseUrl();
  const now = new Date();

  // Fetch dynamic slugs from Sanity
  const [services, solutions, projects, posts] = await Promise.all([
    sanityClient.fetch<string[]>("*[_type=='service']{ 's': slug.current }.s"),
    sanityClient.fetch<string[]>("*[_type=='solution']{ 's': slug.current }.s"),
    sanityClient.fetch<string[]>("*[_type=='project']{ 's': slug.current }.s"),
    sanityClient.fetch<string[]>("*[_type=='post']{ 's': slug.current }.s"),
  ]).catch(() => [[], [], [], []] as const);

  const staticPaths = [
    "/",
    "/services",
    "/solutions",
    "/portfolio",
    "/blog",
    "/contact",
  ];

  const urls: MetadataRoute.Sitemap = [];

  for (const loc of SUPPORTED_LOCALES) {
    for (const p of staticPaths) {
      const path = p === "/" ? `/${loc}` : `/${loc}${p}`;
      urls.push({ url: new URL(path, base).toString(), lastModified: now, changeFrequency: "weekly", priority: 0.7 });
    }
    for (const s of services) urls.push({ url: new URL(`/${loc}/services/${s}`, base).toString(), lastModified: now, changeFrequency: "weekly", priority: 0.6 });
    for (const s of solutions) urls.push({ url: new URL(`/${loc}/solutions/${s}`, base).toString(), lastModified: now, changeFrequency: "weekly", priority: 0.6 });
    for (const s of projects) urls.push({ url: new URL(`/${loc}/project/${s}`, base).toString(), lastModified: now, changeFrequency: "weekly", priority: 0.6 });
    for (const s of posts) urls.push({ url: new URL(`/${loc}/blog/${s}`, base).toString(), lastModified: now, changeFrequency: "weekly", priority: 0.5 });
  }

  // Also include root non-localized as a courtesy
  urls.push({ url: new URL(`/`, base).toString(), lastModified: now, priority: 0.5 });
  return urls;
}
