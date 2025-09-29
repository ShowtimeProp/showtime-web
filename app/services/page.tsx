import { sanityClient } from "@/lib/sanity/client";

export const metadata = {
  title: "Servicios",
  description:
    "Fotografía profesional, tours virtuales y video 360, edición de video, planos Unreal Engine y automatizaciones de IA/n8n.",
};

const query = `*[_type == "service"] | order(coalesce(order, 999) asc, title asc){
  _id,
  title,
  short,
  "slug": slug.current
}`;

export default async function ServicesPage() {
  let services: { _id: string; title: string; short?: string; slug?: string }[] = [];
  try {
    services = await sanityClient.fetch(query);
  } catch {}

  const fallback = services.length === 0;
  const list =
    services.length > 0
      ? services
      : [
          {
            _id: "1",
            title: "Fotografía profesional",
            short:
              "Sesiones con óptica de alta calidad, iluminación y postproducción para destacar cada propiedad.",
          },
          {
            _id: "2",
            title: "Tours virtuales & Video 360",
            short: "Experiencias inmersivas para visitas remotas. Compatibles con web y VR.",
          },
          {
            _id: "3",
            title: "Edición de video profesional",
            short: "Narrativa visual enfocada en conversión: ritmo, música y gráficos.",
          },
          {
            _id: "4",
            title: "Planos interactivos (Unreal Engine)",
            short: "Modelos 3D navegables y renders en tiempo real para proyectos y preventa.",
          },
          {
            _id: "5",
            title: "Automatizaciones & IA (n8n)",
            short:
              "Flujos inteligentes para captación de leads, seguimiento, y respuestas automáticas.",
          },
        ];

  return (
    <div className="px-6 py-12 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Servicios</h1>
      <p className="text-neutral-600 mb-8">
        {fallback
          ? "Mostrando servicios de ejemplo. Crea documentos 'Service' en el Studio para verlos aquí."
          : "Soluciones integrales de marketing inmobiliario para elevar el valor percibido y acelerar la venta."}
      </p>
      <div className="grid sm:grid-cols-2 gap-6">
        {list.map((s) => (
          <a key={s._id} href={s.slug ? `/services/${s.slug}` : "#"} className="rounded-lg border p-5 hover:bg-neutral-50 block">
            <h2 className="font-semibold mb-2">{s.title}</h2>
            <p className="text-sm text-neutral-600">{s.short}</p>
          </a>
        ))}
      </div>
    </div>
  );
}
