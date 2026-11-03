export type Property = {
  slug: string;
  title: string;
  city: string;
  neighbourhood: string;
  type: string;
  bedrooms: number;
  bathrooms: number;
  toilets: number;
  sizeM2: number;
  rent: number;
  fee: number;
  securing: number;
  furnished: string;
  parking: string;
  description: string;
  amenities: string[];
  images: string[];
  available: boolean;
};

// No seed list any more, on purpose. The Supabase properties table
// is the only source of homes. If it fails to load, the app shows
// an empty state or a not found page, instead of stale prices from
// a hard coded list that could drift away from the database.
// The type and the eur helper stay, everything else reads the table.
export const properties: Property[] = [];

export function getProperty(slug: string) {
  return properties.find((p) => p.slug === slug);
}

export function eur(n: number) {
  return '€' + n.toLocaleString('en-US');
}
