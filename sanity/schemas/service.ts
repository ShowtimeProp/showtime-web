import { defineType, defineField } from "sanity";

export default defineType({
  name: "service",
  title: "Service",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Title", type: "string", validation: (r) => r.required() }),
    defineField({ name: "titleLoc", title: "Title (localized)", type: "localeString" }),
    defineField({ name: "slug", title: "Slug", type: "slug", options: { source: "title" } }),
    defineField({ name: "short", title: "Short description", type: "text" }),
    defineField({ name: "shortLoc", title: "Short description (localized)", type: "localeText" }),
    defineField({ name: "body", title: "Body", type: "array", of: [{ type: "block" }] }),
    defineField({ name: "bodyLoc", title: "Body (localized)", type: "localeBlock" }),
    defineField({ name: "icon", title: "Icon", type: "image", options: { hotspot: true } }),
    defineField({ name: "videoUrl", title: "Video URL (Bunny/YouTube/Vimeo/MP4)", type: "url", description: "If set, the detail page will show this video instead of the image." }),
    defineField({ name: "videoPoster", title: "Video Poster (optional)", type: "image", options: { hotspot: true } }),
    defineField({ name: "order", title: "Order", type: "number" }),

    // Pricing
    defineField({ name: "price", title: "Price (number)", type: "number" }),
    defineField({ name: "oldPrice", title: "Old price (optional)", type: "number" }),
    defineField({ name: "cashDiscountPct", title: "Cash discount % (Contado / À vista)", type: "number", description: "Optional. Example: 15 for 15% off when paying cash.", validation: (r) => r.min(0).max(90) }),

    // Listing flags
    defineField({ name: "featured", title: "Featured (show in Packs)", type: "boolean", initialValue: false }),
    defineField({ name: "badge", title: "Badge (e.g., Sale, New)", type: "string" }),
    defineField({ name: "allInOne", title: "All in One (bundle pack)", type: "boolean", initialValue: false, description: "Mark if this service is a bundle that includes multiple services." }),

    // Taxonomy for filters
    defineField({ name: "category", title: "Category (single)", type: "string", options: { list: [
      { title: "Photography", value: "photography" },
      { title: "Video", value: "video" },
      { title: "Tours 360", value: "tours360" },
      { title: "Editing", value: "editing" },
      { title: "Plans / 3D", value: "plans3d" },
      { title: "Automation / AI", value: "automation" },
    ] } }),
    defineField({ name: "categories", title: "Categories (multi)", type: "array", of: [{ type: "string" }], options: { list: [
      { title: "Photography", value: "photography" },
      { title: "Video", value: "video" },
      { title: "Tours 360", value: "tours360" },
      { title: "Editing", value: "editing" },
      { title: "Plans / 3D", value: "plans3d" },
      { title: "Automation / AI", value: "automation" },
    ] } }),

    // SEO per item
    defineField({ name: "seoTitleLoc", title: "SEO Title (localized)", type: "localeSeoTitle" }),
    defineField({ name: "seoDescriptionLoc", title: "SEO Description (localized)", type: "localeSeoDescription" }),
    defineField({ name: "ogImage", title: "OG Image (optional)", type: "image", options: { hotspot: true } }),
    defineField({ name: "autoSyncSeo", title: "Auto-sync translations if not manually edited", type: "boolean", initialValue: true }),
  ],
  preview: {
    select: { title: "title", media: "icon" },
  },
});
