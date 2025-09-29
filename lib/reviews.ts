export type GoogleReview = {
  author_name: string;
  profile_photo_url?: string;
  rating: number;
  relative_time_description?: string;
  text?: string;
  time?: number; // unix seconds
};

export type ReviewsResponse = {
  rating?: number;
  user_ratings_total?: number;
  reviews: GoogleReview[];
};

const PLACE_ID = process.env.NEXT_PUBLIC_GOOGLE_PLACE_ID || "ChIJYegDmDTdhJUReTDkupXw8go"; // Place ID is not secret
const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY; // Must be provided by user

// Server-side fetch of Google reviews. Intended to be used from Server Components only.
export async function fetchGoogleReviews(locale?: string): Promise<ReviewsResponse | null> {
  if (!API_KEY) {
    return null;
  }
  // Map site locale to Google Places language and region params
  const lang = locale === 'es' ? 'es' : locale === 'pt' ? 'pt-BR' : 'en';
  const region = locale === 'es' ? 'AR' : locale === 'pt' ? 'BR' : 'US';
  const fields = ["rating", "user_ratings_total", "reviews"].join(",");
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(
    PLACE_ID
  )}&fields=${fields}&reviews_sort=newest&language=${encodeURIComponent(lang)}&region=${encodeURIComponent(region)}&key=${API_KEY}`;

  try {
    const res = await fetch(url, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const data = await res.json();
    const result = data?.result || {};
    const reviewsAll: GoogleReview[] = Array.isArray(result.reviews)
      ? (result.reviews as any[]).map((r) => ({
          author_name: r.author_name,
          profile_photo_url: r.profile_photo_url,
          rating: r.rating,
          relative_time_description: r.relative_time_description,
          text: r.text,
          time: r.time,
        }))
      : [];
    // Prefer 4 and 5 star reviews; if fewer than 6 are available, backfill with others (highest ratings first)
    const preferred = reviewsAll.filter((r) => (r.rating || 0) >= 4);
    const backfill = reviewsAll
      .filter((r) => (r.rating || 0) < 4)
      .sort((a, b) => (b.rating || 0) - (a.rating || 0));
    const combined = [...preferred, ...backfill];
    const reviews = combined.slice(0, 6);
    return {
      rating: result.rating,
      user_ratings_total: result.user_ratings_total,
      reviews,
    };
  } catch (e) {
    return null;
  }
}
