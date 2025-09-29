import { defineType, defineField } from "sanity";

export default defineType({
  name: "project",
  title: "Project",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Title", type: "string", validation: (r) => r.required() }),
    defineField({ name: "titleLoc", title: "Title (localized)", type: "localeString" }),
    defineField({ name: "slug", title: "Slug", type: "slug", options: { source: "title" } }),
    defineField({ name: "thumb", title: "Thumbnail", type: "image", options: { hotspot: true } }),
    defineField({ name: "videoUrl", title: "Video URL (Bunny/YouTube/Vimeo/MP4)", type: "url", description: "If set, detail page will show this video instead of the thumbnail." }),
    defineField({ name: "videoPoster", title: "Video Poster (optional)", type: "image", options: { hotspot: true } }),
    defineField({ name: "tourUrl", title: "Virtual Tour URL (3D Vista or iframe URL)", type: "url", description: "If set, the detail page will show this tour embed above the body." }),
    defineField({ name: "tags", title: "Tags", type: "array", of: [{ type: "string" }] }),
    defineField({ name: "gallery", title: "Gallery", type: "array", of: [{ type: "image", options: { hotspot: true } }] }),
    defineField({ name: "body", title: "Body", type: "array", of: [{ type: "block" }] }),
    defineField({ name: "bodyLoc", title: "Body (localized)", type: "localeBlock" }),
    defineField({ name: "date", title: "Date", type: "datetime" }),
  ],
  preview: {
    select: { title: "title", media: "thumb" },
  },
});
