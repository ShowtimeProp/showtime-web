import imageUrlBuilder from "@sanity/image-url";
import type { Image } from "sanity";

// Prefer NEXT_PUBLIC_* (works on both server and client). Fallback to server-only SANITY_* to be resilient.
const projectId =
  (process.env.NEXT_PUBLIC_SANITY_PROJECT_ID as string) ||
  (process.env.SANITY_PROJECT_ID as string) ||
  "";
const dataset =
  (process.env.NEXT_PUBLIC_SANITY_DATASET as string) ||
  (process.env.SANITY_DATASET as string) ||
  "production";

const builder = imageUrlBuilder({ projectId, dataset });

export function urlFor(source: any) {
  return builder.image(source);
}

export type SanityImageSource = Image | string | any;

// Helper to standardize URL params (format, quality, fit, size)
export function imgUrl(
  source: SanityImageSource,
  opts: { w?: number; h?: number; q?: number; fit?: "crop" | "clip" | "fill" | "scale"; format?: "webp" | "jpg" | "png" } = {}
) {
  if (!source) return null as unknown as string;
  const { w, h, q = 78, fit = "crop", format = "webp" } = opts;
  let b = builder.image(source);
  // If we have hotspot metadata and we're cropping, use focal point to avoid cutting heads
  const hotspot = (source as any)?.hotspot;
  if (w) b = b.width(w);
  if (h) b = b.height(h);
  if (fit) {
    b = b.fit(fit as any);
    if (fit === "crop" && hotspot && typeof hotspot.x === "number" && typeof hotspot.y === "number") {
      b = (b as any).crop("focalpoint").focalPoint(hotspot.x, hotspot.y);
    }
  }
  if (q) b = b.quality(q);
  if (format) b = b.format(format as any);
  return b.url();
}

// Common presets
export const imgPresets = {
  // Wider and slightly higher quality to reduce softness in large hero containers
  hero: (source: SanityImageSource) => imgUrl(source, { w: 1600, h: 900, q: 82, fit: "crop", format: "webp" }),
  // Portrait-friendly crop used where we want a bit more headroom
  heroTall: (source: SanityImageSource) => imgUrl(source, { w: 1600, h: 1000, q: 82, fit: "crop", format: "webp" }),
  cover: (source: SanityImageSource) => imgUrl(source, { w: 1280, h: 720, q: 80, fit: "crop", format: "webp" }),
  thumb: (source: SanityImageSource) => imgUrl(source, { w: 900, h: 675, q: 80, fit: "crop", format: "webp" }),
  tile: (source: SanityImageSource) => imgUrl(source, { w: 900, h: 506, q: 80, fit: "crop", format: "webp" }),
  gallery: (source: SanityImageSource) => imgUrl(source, { w: 1400, h: 933, q: 80, fit: "crop", format: "webp" }),
};
