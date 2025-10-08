import { defineType, defineField } from "sanity";

export default defineType({
  name: "post",
  title: "Post",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Title", type: "string", validation: (r) => r.required() }),
    defineField({ name: "titleLoc", title: "Title (localized)", type: "localeString" }),
    defineField({ name: "slug", title: "Slug", type: "slug", options: { source: "title" }, validation: (r) => r.required() }),
    defineField({ name: "excerpt", title: "Excerpt", type: "text" }),
    defineField({ name: "excerptLoc", title: "Excerpt (localized)", type: "localeText" }),
    defineField({ name: "body", title: "Body", type: "array", of: [{ type: "block" }] }),
    defineField({ name: "bodyLoc", title: "Body (localized)", type: "localeBlock" }),
    defineField({ name: "mainImage", title: "Main image", type: "image", options: { hotspot: true } }),
    defineField({ name: "videoUrl", title: "Video URL (optional)", type: "url" }),
    defineField({ name: "videoPoster", title: "Video Poster (optional)", type: "image", options: { hotspot: true } }),
    defineField({ name: "categories", title: "Categories", type: "array", of: [{ type: "string" }] }),
    defineField({ name: "tags", title: "Tags", type: "array", of: [{ type: "string" }] }),
    defineField({ name: "publishedAt", title: "Published at", type: "datetime", initialValue: () => new Date().toISOString() }),

    // SEO per item
    defineField({ name: "seoTitleLoc", title: "SEO Title (localized)", type: "localeSeoTitle" }),
    defineField({ name: "seoDescriptionLoc", title: "SEO Description (localized)", type: "localeSeoDescription" }),
    defineField({ name: "ogImage", title: "OG Image (optional)", type: "image", options: { hotspot: true } }),
    defineField({ name: "autoSyncSeo", title: "Auto-sync translations if not manually edited", type: "boolean", initialValue: true }),
  ],
  preview: {
    select: { title: "title", media: "mainImage" },
  },
});
