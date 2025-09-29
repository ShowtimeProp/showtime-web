import { defineType, defineField } from "sanity";

export default defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  fields: [
    defineField({ name: "siteTitle", title: "Site title", type: "string", validation: (r) => r.required() }),
    defineField({ name: "siteTitleLoc", title: "Site title (localized)", type: "localeString" }),
    defineField({ name: "description", title: "Description", type: "text" }),
    defineField({ name: "descriptionLoc", title: "Description (localized)", type: "localeText" }),
    defineField({ name: "logo", title: "Logo", type: "image", options: { hotspot: true } }),
    defineField({
      name: "navigation",
      title: "Navigation",
      type: "array",
      of: [
        defineField({
          name: "navItem",
          title: "Nav Item",
          type: "object",
          fields: [
            defineField({ name: "label", title: "Label", type: "string" }),
            defineField({ name: "labelLoc", title: "Label (localized)", type: "localeString" }),
            defineField({ name: "href", title: "Href", type: "string" }),
          ],
        }),
      ],
    }),
    defineField({ name: "ogImage", title: "OG Image", type: "image", options: { hotspot: true } }),
  ],
});
