import Image from "next/image";
import { sanityClient } from "@/lib/sanity/client";
import { urlFor } from "@/lib/sanity/image";

export const metadata = {
  title: "Portfolio",
  description: "Proyectos y producciones destacadas para el sector inmobiliario.",
};

const query = `*[_type == "project"] | order(coalesce(date, now()) desc){
  _id,
  title,
  tags,
  thumb,
  "slug": slug.current
}`;

export default async function PortfolioPage() {
  let items: { _id: string; title: string; tags?: string[]; thumb?: any; slug?: string }[] = [];
  try {
    items = await sanityClient.fetch(query);
  } catch {}

  const fallback = items.length === 0;
  const list =
    items.length > 0
      ? items
      : [
          { _id: "1", title: "Proyecto de ejemplo", tags: ["Demo"], thumb: null },
          { _id: "2", title: "Proyecto 2", tags: ["Demo"], thumb: null },
          { _id: "3", title: "Proyecto 3", tags: ["Demo"], thumb: null },
        ];

  return (
    <div className="px-6 py-12 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Portfolio</h1>
      <p className="text-neutral-600 mb-8">
        {fallback
          ? "Mostrando proyectos de ejemplo. Crea documentos 'Project' en el Studio para verlos aquí."
          : "Una selección de trabajos que muestran nuestro enfoque visual, técnico y orientado a resultados."}
      </p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {list.map((it) => {
          const img = it.thumb ? urlFor(it.thumb).width(800).height(450).fit("crop").url() : null;
          return (
            <a key={it._id} href={it.slug ? `/project/${it.slug}` : "#"} className="border rounded-lg overflow-hidden block hover:bg-neutral-50">
              <div className="aspect-video bg-neutral-100 relative">
                {img ? (
                  <Image src={img} alt={it.title} fill className="object-cover" />
                ) : null}
              </div>
              <div className="p-4">
                <h3 className="font-semibold">{it.title}</h3>
                {it.tags?.length ? (
                  <p className="text-xs text-neutral-500">{it.tags.join(" / ")}</p>
                ) : null}
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
