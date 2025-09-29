import Link from "next/link";

export type Crumb = {
  label: string;
  href?: string; // if absent, render as current (no link)
};

export default function Breadcrumbs({ items = [] as Crumb[] }: { items?: Crumb[] }) {
  if (!items.length) return null;
  return (
    <nav aria-label="Breadcrumb" className="text-xs text-white/70">
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((c, i) => (
          <li key={i} className="flex items-center gap-1">
            {c.href ? (
              <Link href={c.href} className="hover:underline hover:text-white">
                {c.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-white/85">
                {c.label}
              </span>
            )}
            {i < items.length - 1 ? <span aria-hidden className="opacity-50">/</span> : null}
          </li>
        ))}
      </ol>
    </nav>
  );
}
