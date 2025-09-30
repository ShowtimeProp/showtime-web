import Link from "next/link";
import { sanityClient } from "@/lib/sanity/client";
import { PortableText } from "@portabletext/react";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type Params = { params: { slug: string } };

const query = `*[_type == "service" && slug.current == $slug][0]{
  _id,
  title,
  short,
  body
}`;

export async function generateMetadata({ params }: Params) {
  const data = await sanityClient.fetch(query, { slug: params.slug }).catch(() => null);
  const title = data?.title ? `${data.title} | Servicios` : "Servicio";
  const description = data?.short || "Detalle del servicio";
  return { title, description };
}

export default async function ServiceDetail({ params }: Params) {
  const data = await sanityClient.fetch(query, { slug: params.slug }).catch(() => null);

  if (!data) {
    return (
      <div className="px-6 py-12 max-w-3xl mx-auto">
        <h1 className="text-2xl font-semibold mb-3">Servicio no encontrado</h1>
        <a href="/services" className="text-sm underline">Volver a servicios</a>
      </div>
    );
  }

  return (
    <div className="px-6 py-12 max-w-3xl mx-auto">
      <div className="mb-6">
        <a href="/services" className="text-sm underline">← Volver</a>
      </div>
      <h1 className="text-3xl font-bold mb-3">{data.title}</h1>
      {data.short ? (
        <p className="text-neutral-600 mb-6">{data.short}</p>
      ) : null}
      {Array.isArray(data.body) && data.body.length ? (
        <div className="prose prose-neutral max-w-none">
          <PortableText
            value={data.body}
            components={{
              block: {
                h2: ({ children }) => <h2 className="mt-8">{children}</h2>,
                h3: ({ children }) => <h3 className="mt-6">{children}</h3>,
              },
            }}
          />
        </div>
      ) : null}
    </div>
  );
}
