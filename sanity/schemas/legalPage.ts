import { defineType, defineField } from "sanity";

export default defineType({
  name: "legalPage",
  title: "Legal (privacidad / términos)",
  type: "document",
  fields: [
    defineField({
      name: "kind",
      title: "Qué página es",
      type: "string",
      options: {
        list: [
          { title: "Política de privacidad (/privacy y /policy)", value: "privacy" },
          { title: "Términos y condiciones (/terms)", value: "terms" },
        ],
        layout: "radio",
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "titleLoc",
      title: "Título principal (H1, localizado)",
      type: "localeString",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "bodyLoc",
      title: "Contenido (localizado)",
      type: "localeBlock",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "lastUpdated",
      title: "Última actualización (texto bajo el título)",
      type: "datetime",
    }),
  ],
  preview: {
    select: { kind: "kind", t: "titleLoc.es" },
    prepare({ kind, t }) {
      const labels: Record<string, string> = {
        privacy: "Privacidad",
        terms: "Términos",
      };
      return {
        title: t || labels[kind] || "Legal",
        subtitle: kind === "privacy" ? "/privacy" : "/terms",
      };
    },
  },
});
