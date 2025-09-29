import Image from "next/image";
import { fetchGoogleReviews } from "@/lib/reviews";

export const revalidate = 60;

export default async function Reviews({ locale }: { locale: string }) {
  const data = await fetchGoogleReviews(locale);
  if (!data || !data.reviews?.length) return null;

  const t = (key: string): string => {
    const dict: Record<string, Record<string, string>> = {
      es: { title: "Opiniones de Google", total: "opiniones", rating: "calificación", showing: "Mostrando", of: "de", view: "Ver en Google", updated: "Actualizado", every: "cada ~1 min", more: "Ver más opiniones" },
      pt: { title: "Avaliações do Google", total: "avaliações", rating: "classificação", showing: "Mostrando", of: "de", view: "Ver no Google", updated: "Atualizado", every: "a cada ~1 min", more: "Ver mais avaliações" },
      en: { title: "Google Reviews", total: "reviews", rating: "rating", showing: "Showing", of: "of", view: "View on Google", updated: "Updated", every: "every ~1 min", more: "View more reviews" },
    };
    return dict[locale as keyof typeof dict]?.[key] || dict.en[key];
  };

  const targetCount = 6; // always show 6 tiles in the grid
  const reviews = data.reviews.slice(0, targetCount);
  const shownCount = data.reviews.length; // real number of reviews fetched (<= 5)
  const totalCount = data.user_ratings_total || shownCount;
  const placeId = process.env.NEXT_PUBLIC_GOOGLE_PLACE_ID || "ChIJYegDmDTdhJUReTDkupXw8go";
  const placeUrl = `https://www.google.com/maps/place/?q=place_id:${encodeURIComponent(placeId)}`;
  const now = new Date();
  const updatedAt = now.toLocaleTimeString(locale === 'pt' ? 'pt-BR' : locale === 'es' ? 'es-AR' : 'en-US', { hour: '2-digit', minute: '2-digit' });

  const fillerCount = Math.max(0, targetCount - reviews.length);

  const GoogleIcon = (
    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden fill="currentColor">
      <path d="M21.35 11.1h-9.17v2.96h5.26c-.23 1.36-1.58 4-5.26 4-3.17 0-5.76-2.62-5.76-5.85s2.6-5.85 5.76-5.85c1.8 0 3.01.77 3.7 1.43l2.52-2.43C16.65 3.7 14.7 2.8 12.18 2.8 7.44 2.8 3.6 6.64 3.6 11.4s3.84 8.6 8.58 8.6c4.94 0 8.2-3.46 8.2-8.34 0-.56-.06-1-.13-1.56z" />
    </svg>
  );

  return (
    <section className="max-w-6xl mx-auto px-6">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold mb-1">{t("title")}</h2>
          <div className="text-muted text-sm flex flex-wrap items-center gap-x-3 gap-y-1">
            {typeof data.rating === "number" ? (
              <span>{data.rating.toFixed(1)} ★</span>
            ) : null}
            <span>· {totalCount} {t("total")}</span>
            <span className="text-xs bg-white/10 text-white/80 rounded-full px-2 py-0.5">
              {t("showing")} {shownCount} {t("of")} {totalCount}
            </span>
          </div>
          <div className="text-xs text-white/60 mt-1">{t("updated")} {updatedAt} · {t("every")}</div>
        </div>
        <div>
          <a href={placeUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-white/90 hover:bg-white/20 transition-colors">
            <span className="opacity-80">{GoogleIcon}</span>
            <span>{t("view")}</span>
          </a>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {reviews.map((r, idx) => (
          <article key={idx} className="spotlight card-surface p-4 rounded-xl min-h-[160px]">
            <div className="flex items-center gap-3 mb-3">
              {r.profile_photo_url ? (
                <div className="relative w-9 h-9 rounded-full overflow-hidden">
                  <Image src={r.profile_photo_url} alt={r.author_name} fill className="object-cover" />
                </div>
              ) : (
                <div className="w-9 h-9 rounded-full bg-white/10" />
              )}
              <div className="min-w-0">
                <div className="font-medium text-sm truncate">{r.author_name}</div>
                <div className="text-xs text-muted">{r.relative_time_description || ""}</div>
              </div>
            </div>
            <div className="text-yellow-400 text-sm mb-2">{"★".repeat(Math.round(r.rating || 0))}</div>
            {r.text ? (
              <p className="text-sm text-white/80 line-clamp-5">{r.text}</p>
            ) : null}
          </article>
        ))}

        {Array.from({ length: fillerCount }).map((_, i) => (
          <a
            key={`cta-${i}`}
            href={placeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="spotlight card-surface p-4 rounded-xl flex items-center justify-center group transform transition-transform hover:scale-[1.02] min-h-[160px]"
          >
            <div className="text-center">
              <div className="mb-2 inline-flex items-center justify-center w-9 h-9 rounded-full bg-white/10 text-white/80 group-hover:bg-white/15 transition-colors">
                {GoogleIcon}
              </div>
              <div className="text-sm font-medium text-white/90 group-hover:underline">{t("more")}</div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
