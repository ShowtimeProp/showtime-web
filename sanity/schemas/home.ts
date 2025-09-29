import { defineType, defineField } from "sanity";

export default defineType({
  name: "home",
  title: "Home",
  type: "document",
  fields: [
    defineField({ name: "order", title: "Order", type: "number" }),
    defineField({ name: "heroKicker", title: "Hero kicker (small overline)", type: "string" }),
    defineField({ name: "heroKickerLoc", title: "Hero kicker (localized)", type: "localeString" }),
    defineField({ name: "heroTitle", title: "Hero title", type: "string" }),
    defineField({ name: "heroTitleLoc", title: "Hero title (localized)", type: "localeString" }),
    defineField({ name: "heroSubtitle", title: "Hero subtitle", type: "text" }),
    defineField({ name: "heroSubtitleLoc", title: "Hero subtitle (localized)", type: "localeText" }),
    defineField({ name: "heroImage", title: "Hero image", type: "image", options: { hotspot: true } }),
    defineField({ name: "heroVideoUrl", title: "Hero video URL (mp4/webm)", type: "url", description: "Si se define, se usará el video en lugar de la imagen." }),
    defineField({ name: "heroVideoPoster", title: "Hero video poster", type: "image", options: { hotspot: true } }),
    defineField({ name: "heroOverlayOpacity", title: "Overlay opacity (0-0.6)", type: "number", initialValue: 0.2, validation: (r) => r.min(0).max(0.6) }),
    defineField({ name: "ctaPrimaryLabel", title: "CTA primary label", type: "string" }),
    defineField({ name: "ctaPrimaryLabelLoc", title: "CTA primary label (localized)", type: "localeString" }),
    defineField({ name: "ctaPrimaryHref", title: "CTA primary href", type: "string" }),
    defineField({ name: "ctaSecondaryLabel", title: "CTA secondary label", type: "string" }),
    defineField({ name: "ctaSecondaryLabelLoc", title: "CTA secondary label (localized)", type: "localeString" }),
    defineField({ name: "ctaSecondaryHref", title: "CTA secondary href", type: "string" }),

    // Packs section title (localized)
    defineField({ name: "packsTitleLoc", title: "Packs title (localized)", type: "localeString" }),

    // New: multiple hero blocks for carousel
    defineField({
      name: "heroBlocks",
      title: "Hero blocks",
      type: "array",
      of: [
        defineField({
          name: "heroBlock",
          title: "Hero block",
          type: "object",
          fields: [
            defineField({ name: "title", title: "Title", type: "string", validation: (r) => r.required() }),
            defineField({ name: "titleLoc", title: "Title (localized)", type: "localeString" }),
            defineField({ name: "subtitle", title: "Subtitle", type: "text" }),
            defineField({ name: "subtitleLoc", title: "Subtitle (localized)", type: "localeText" }),
            defineField({ name: "image", title: "Image", type: "image", options: { hotspot: true } }),
            defineField({ name: "videoUrl", title: "Video URL (mp4/webm o Vimeo/YouTube)", type: "url" }),
            defineField({ name: "videoPoster", title: "Video poster", type: "image", options: { hotspot: true } }),
            defineField({ name: "overlayOpacity", title: "Overlay opacity (0-0.6)", type: "number", initialValue: 0.2, validation: (r) => r.min(0).max(0.6) }),
            defineField({ name: "ctaPrimaryLabel", title: "CTA primary label", type: "string" }),
            defineField({ name: "ctaPrimaryLabelLoc", title: "CTA primary label (localized)", type: "localeString" }),
            defineField({ name: "ctaPrimaryHref", title: "CTA primary href", type: "string" }),
            defineField({ name: "ctaSecondaryLabel", title: "CTA secondary label", type: "string" }),
            defineField({ name: "ctaSecondaryLabelLoc", title: "CTA secondary label (localized)", type: "localeString" }),
            defineField({ name: "ctaSecondaryHref", title: "CTA secondary href", type: "string" }),
            defineField({ name: "order", title: "Order", type: "number" }),
          ],
          preview: { select: { title: "title", media: "image" } },
        }),
      ],
      options: { sortable: true },
    }),
  ],
});
