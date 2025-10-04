import React from "react";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import Image from "next/image";
import { urlFor } from "@/lib/sanity/image";

export default function EditorialBody({ value, locale = "es" as "es" | "en" | "pt" }: { value: any; locale?: "es" | "en" | "pt" }) {
  if (!Array.isArray(value) || value.length === 0) return null;

  const t = (k: string) => {
    const dict: Record<string, Record<string, string>> = {
      es: { figure: "Figura", table: "Tabla" },
      en: { figure: "Figure", table: "Table" },
      pt: { figure: "Figura", table: "Tabela" },
    };
    return dict[locale]?.[k] || dict.en[k];
  };

  const components: PortableTextComponents = {
    block: {
      h2: ({ children }) => <h2 className="mt-10 scroll-mt-24 text-[1.6rem] sm:text-3xl font-extrabold tracking-tight">{children}</h2>,
      h3: ({ children }) => <h3 className="mt-8 scroll-mt-24 text-[1.25rem] sm:text-2xl font-bold tracking-tight">{children}</h3>,
      normal: ({ children }) => <p className="leading-7 text-white/85">{children}</p>,
      blockquote: ({ children }) => (
        <blockquote className="my-6 border-l-4 border-white/20 pl-4 italic text-white/80">{children}</blockquote>
      ),
    },
    list: {
      bullet: ({ children }) => <ul className="my-6 ml-6 list-disc marker:text-white/60">{children}</ul>,
      number: ({ children }) => <ol className="my-6 ml-6 list-decimal marker:text-white/60">{children}</ol>,
    },
    listItem: {
      bullet: ({ children }) => <li className="mb-1 leading-7">{children}</li>,
      number: ({ children }) => <li className="mb-1 leading-7">{children}</li>,
    },
    types: {
      image: ({ value }) => {
        const src = value ? urlFor(value).width(1200).url() : null;
        if (!src) return null;
        const alt = value?.alt || "";
        return (
          <figure className="my-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={alt} className="w-full rounded-lg border border-white/10" loading="lazy" />
            {alt ? <figcaption className="mt-2 text-sm text-white/60">{t("figure")}: {alt}</figcaption> : null}
          </figure>
        );
      },
      code: ({ value }) => (
        <pre className="my-6 overflow-x-auto rounded-lg bg-black/60 p-4 text-sm border border-white/10">
          <code>{value?.code || ""}</code>
        </pre>
      ),
      youtube: ({ value }) => {
        const id = value?.id || value?.videoId;
        if (!id) return null;
        return (
          <div className="my-6 aspect-video relative rounded-xl overflow-hidden border border-white/10">
            <iframe
              className="absolute inset-0 w-full h-full"
              src={`https://www.youtube.com/embed/${id}`}
              allow="accelerometer; gyroscope; encrypted-media; picture-in-picture;"
              allowFullScreen
              loading="lazy"
            />
          </div>
        );
      },
    },
    marks: {
      link: ({ value, children }) => {
        const href = value?.href as string;
        const rel = href?.startsWith("/") ? undefined : "noopener noreferrer";
        const target = href?.startsWith("/") ? undefined : "_blank";
        return (
          <a href={href} rel={rel} target={target} className="underline decoration-white/30 underline-offset-2 hover:decoration-white/60">
            {children}
          </a>
        );
      },
      strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
      em: ({ children }) => <em className="italic text-white/90">{children}</em>,
    },
  };

  return (
    <div className="prose prose-invert max-w-none editorial">
      <PortableText value={value} components={components} />
      <style jsx>{`
        /* Drop cap and lead paragraph like blog */
        .editorial :global(p:first-of-type) {
          font-size: 1.05rem;
          line-height: 1.9;
          color: rgba(255,255,255,0.92);
        }
        .editorial :global(p:first-of-type)::first-letter {
          float: left;
          font-size: 3.1rem;
          line-height: 1;
          padding-right: 8px;
          padding-top: 4px;
          font-weight: 800;
          color: #facc15; /* amber-400 accent similar to blog */
        }
        .editorial :global(ul) { margin-top: 1rem; margin-bottom: 1.25rem; }
        .editorial :global(ol) { margin-top: 1rem; margin-bottom: 1.25rem; }
        .editorial :global(li) { margin-bottom: 0.35rem; }
        .editorial :global(hr) { border-color: rgba(255,255,255,0.08); margin: 2rem 0; }
        .editorial :global(img) { box-shadow: 0 10px 30px rgba(0,0,0,0.25); }
      `}</style>
    </div>
  );
}
