import Image from "next/image";
import Link from "next/link";
import { sanityClient } from "@/lib/sanity/client";
import { urlFor } from "@/lib/sanity/image";
import { PortableText } from "@portabletext/react";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type Params = { params: { slug: string } };

const query = `*[_type == "project" && slug.current == $slug][0]{
  _id,
  title,
  tags,
  thumb,
  gallery,
  body
}`;

export async function generateMetadata({ params }: Params) {
  const data = await sanityClient.fetch(query, { slug: params.slug }).catch(() => null);
  const title = data?.title ? `${data.title} | Portfolio` : "Proyecto";
  const description = data?.tags?.join(" / ") || "Detalle del proyecto";
  return { title, description };
}

export default async function ProjectDetail({ params }: Params) {
  const data: any = await sanityClient.fetch(query, { slug: params.slug }).catch(() => null);

  if (!data) {
    return (
      <div className="px-6 py-12 max-w-5xl mx-auto">
        <h1 className="text-2xl font-semibold mb-3">Proyecto no encontrado</h1>
        <Link href="/portfolio" className="text-sm underline">Volver al portfolio</Link>
      </div>
    );
  }

  const cover = data.thumb ? urlFor(data.thumb).width(1280).height(720).fit("crop").url() : null;
  const gallery: any[] = Array.isArray(data.gallery) ? data.gallery : [];

  return (
    <div className="px-6 py-12 max-w-5xl mx-auto">
      <div className="mb-6">
        <Link href="/portfolio" className="text-sm underline">← Volver</Link>
      </div>
      <h1 className="text-3xl font-bold mb-2">{data.title}</h1>
      {data.tags?.length ? (
        <p className="text-xs text-neutral-500 mb-4">{data.tags.join(" / ")}</p>
      ) : null}

      {cover ? (
        <div className="aspect-video relative rounded-lg overflow-hidden border mb-6">
          <Image src={cover} alt={data.title} fill className="object-cover" />
        </div>
      ) : null}

      {Array.isArray(data.body) && data.body.length ? (
        <div className="prose prose-neutral max-w-none mb-10">
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

      {gallery.length ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {gallery.map((img: any, i: number) => {
            const src = urlFor(img).width(1200).height(800).fit("crop").url();
            return (
              <div key={i} className="aspect-[3/2] relative rounded-md overflow-hidden border">
                <Image src={src} alt={`Imagen ${i + 1}`} fill className="object-cover" />
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
