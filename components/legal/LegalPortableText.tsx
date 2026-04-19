"use client";

import { PortableText, type PortableTextComponents } from "@portabletext/react";

export default function LegalPortableText({
  value,
}: {
  value: unknown[] | undefined;
}) {
  if (!Array.isArray(value) || value.length === 0) return null;

  const components: PortableTextComponents = {
    block: {
      h2: ({ children }) => (
        <h2 className="text-lg font-semibold text-white mt-8 mb-3 scroll-mt-24">{children}</h2>
      ),
      h3: ({ children }) => (
        <h3 className="text-base font-semibold text-white mt-6 mb-2 scroll-mt-24">{children}</h3>
      ),
      normal: ({ children }) => <p className="mb-3 leading-relaxed text-white/80">{children}</p>,
      blockquote: ({ children }) => (
        <blockquote className="my-4 border-l-4 border-white/20 pl-4 text-white/75 italic">{children}</blockquote>
      ),
    },
    list: {
      bullet: ({ children }) => <ul className="list-disc pl-5 space-y-2 my-3">{children}</ul>,
      number: ({ children }) => <ol className="list-decimal pl-5 space-y-2 my-3">{children}</ol>,
    },
    listItem: {
      bullet: ({ children }) => <li className="leading-relaxed">{children}</li>,
      number: ({ children }) => <li className="leading-relaxed">{children}</li>,
    },
    marks: {
      link: ({ value: mark, children }) => {
        const href = (mark as { href?: string })?.href || "#";
        const external = /^https?:\/\//i.test(href);
        return (
          <a
            href={href}
            className="text-sky-400 hover:underline"
            {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          >
            {children}
          </a>
        );
      },
      strong: ({ children }) => <strong className="font-semibold text-white/95">{children}</strong>,
      em: ({ children }) => <em className="italic text-white/90">{children}</em>,
    },
  };

  return (
    <div className="legal-portable space-y-1">
      <PortableText value={value as never} components={components} />
    </div>
  );
}
