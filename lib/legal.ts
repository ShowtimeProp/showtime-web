import { sanityClient } from "@/lib/sanity/client";

export type LegalKind = "privacy" | "terms";

export type LegalPageDoc = {
  titleLoc?: Record<string, string>;
  bodyLoc?: Record<string, unknown[]>;
  lastUpdated?: string;
} | null;

export async function fetchLegalPage(kind: LegalKind): Promise<LegalPageDoc> {
  try {
    return await sanityClient.fetch(
      `*[_type == "legalPage" && kind == $kind][0]{
        titleLoc,
        bodyLoc,
        lastUpdated
      }`,
      { kind }
    );
  } catch {
    return null;
  }
}
