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
    defineField({
      name: "seoPatterns",
      title: "SEO Patterns",
      type: "object",
      fields: [
        defineField({ name: "brandShortLoc", title: "Brand short (localized)", type: "localeString" }),
        // Listings
        defineField({ name: "titleServicesLoc", title: "Title: Services (localized)", type: "localeString", options: { }, description: "Tokens: [Brand]" }),
        defineField({ name: "descServicesLoc", title: "Description: Services (localized)", type: "localeText" }),
        defineField({ name: "titleSolutionsLoc", title: "Title: Solutions (localized)", type: "localeString", description: "Tokens: [Brand]" }),
        defineField({ name: "descSolutionsLoc", title: "Description: Solutions (localized)", type: "localeText" }),
        defineField({ name: "titlePortfolioLoc", title: "Title: Portfolio (localized)", type: "localeString", description: "Tokens: [Brand]" }),
        defineField({ name: "descPortfolioLoc", title: "Description: Portfolio (localized)", type: "localeText" }),
        defineField({ name: "titleBlogLoc", title: "Title: Blog (localized)", type: "localeString", description: "Tokens: [Brand]" }),
        defineField({ name: "descBlogLoc", title: "Description: Blog (localized)", type: "localeText" }),
        // Details
        defineField({ name: "titleServiceLoc", title: "Title: Service detail (localized)", type: "localeString", description: "Tokens: [ServiceTitle] [Brand]" }),
        defineField({ name: "descServiceLoc", title: "Description: Service detail (localized)", type: "localeText", description: "Tokens: [ServiceTitle]" }),
        defineField({ name: "titleSolutionLoc", title: "Title: Solution detail (localized)", type: "localeString", description: "Tokens: [SolutionTitle] [Brand]" }),
        defineField({ name: "descSolutionLoc", title: "Description: Solution detail (localized)", type: "localeText", description: "Tokens: [SolutionTitle]" }),
        defineField({ name: "titleProjectLoc", title: "Title: Project detail (localized)", type: "localeString", description: "Tokens: [ProjectTitle] [Brand]" }),
        defineField({ name: "descProjectLoc", title: "Description: Project detail (localized)", type: "localeText", description: "Tokens: [ProjectTitle]" }),
        defineField({ name: "titlePostLoc", title: "Title: Post detail (localized)", type: "localeString", description: "Tokens: [PostTitle] [Brand]" }),
        defineField({ name: "descPostLoc", title: "Description: Post detail (localized)", type: "localeText", description: "Tokens: [PostTitle]" }),
      ]
    })
  ],
});
