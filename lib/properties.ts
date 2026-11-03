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

const img = (id: string) =>
  `https://images.unsplash.com/${id}?w=1200&q=80&auto=format&fit=crop`;

export const properties: Property[] = [
  {
    slug: 'modern-two-bedroom-apartment-jordaan',
    title: 'Modern 2 bedroom apartment, Jordaan',
    city: 'Amsterdam',
    neighbourhood: 'Jordaan, Herengracht area',
    type: 'Apartment',
    bedrooms: 2,
    bathrooms: 1,
    toilets: 1,
    sizeM2: 68,
    rent: 2450,
    fee: 75,
    securing: 4900,
    furnished: 'Furnished option available',
    parking: 'No parking',
    description:
      'Light filled corner apartment close to canals, trams, and shops. Quiet street, bright living room, and a practical kitchen.',
    amenities: ['Balcony', 'Washing machine', 'High speed internet ready', 'Bike storage'],
    images: [img('photo-1502672260266-1c1ef2d93688'), img('photo-1522708323590-d24dbb6b0267'), img('photo-1493809842364-78817add7ffb')],
    available: true,
  },
  {
    slug: 'bright-one-bedroom-apartment-katendrecht',
    title: 'Bright 1 bedroom apartment, Katendrecht',
    city: 'Rotterdam',
    neighbourhood: 'Katendrecht, Wilhelminapier area',
    type: 'Apartment',
    bedrooms: 1,
    bathrooms: 1,
    toilets: 1,
    sizeM2: 52,
    rent: 1850,
    fee: 60,
    securing: 3700,
    furnished: 'Unfurnished',
    parking: 'Street parking nearby',
    description:
      'Modern 1 bedroom apartment with a balcony, near the metro and river views. Good for one person or a couple.',
    amenities: ['Balcony', 'Lift', 'Bike storage'],
    images: [img('photo-1560448204-e02f11c3d0e2'), img('photo-1502672260266-1c1ef2d93688'), img('photo-1600607687939-ce8a6c25118c')],
    available: true,
  },
  {
    slug: 'cozy-two-bedroom-apartment-wittevrouwen',
    title: 'Cozy 2 bedroom apartment, Wittevrouwen',
    city: 'Utrecht',
    neighbourhood: 'Wittevrouwen, near Griftpark',
    type: 'Apartment',
    bedrooms: 2,
    bathrooms: 1,
    toilets: 1,
    sizeM2: 61,
    rent: 1695,
    fee: 60,
    securing: 3390,
    furnished: 'Partly furnished',
    parking: 'No parking',
    description:
      'Quiet street in Utrecht, near Griftpark and the city centre. Ideal for a couple or a small household.',
    amenities: ['Garden access', 'Bike storage', 'Washing machine'],
    images: [img('photo-1522708323590-d24dbb6b0267'), img('photo-1493809842364-78817add7ffb'), img('photo-1502672260266-1c1ef2d93688')],
    available: true,
  },
  {
    slug: 'light-two-bedroom-apartment-de-pijp',
    title: 'Light 2 bedroom apartment, De Pijp',
    city: 'Amsterdam',
    neighbourhood: 'De Pijp',
    type: 'Apartment',
    bedrooms: 2,
    bathrooms: 1,
    toilets: 1,
    sizeM2: 64,
    rent: 2150,
    fee: 75,
    securing: 4300,
    furnished: 'Furnished option available',
    parking: 'No parking',
    description:
      'Bright apartment in a lively neighbourhood, close to markets, cafes, and trams. Two good sized bedrooms.',
    amenities: ['Balcony', 'Lift', 'Bike storage'],
    images: [img('photo-1493809842364-78817add7ffb'), img('photo-1522708323590-d24dbb6b0267'), img('photo-1560448204-e02f11c3d0e2')],
    available: true,
  },
  {
    slug: 'spacious-three-bedroom-house-kralingen',
    title: 'Spacious 3 bedroom house, Kralingen',
    city: 'Rotterdam',
    neighbourhood: 'Kralingen',
    type: 'Terraced house',
    bedrooms: 3,
    bathrooms: 2,
    toilets: 2,
    sizeM2: 92,
    rent: 1980,
    fee: 80,
    securing: 3960,
    furnished: 'Unfurnished',
    parking: 'Street parking nearby',
    description:
      'Family house with a garden, three bedrooms, and two bathrooms. Quiet area, close to parks and public transport.',
    amenities: ['Garden', 'Bike storage', 'Washing machine'],
    images: [img('photo-1600585154340-be6161a56a0c'), img('photo-1600607687939-ce8a6c25118c'), img('photo-1502672260266-1c1ef2d93688')],
    available: true,
  },
  {
    slug: 'modern-two-bedroom-apartment-oud-west',
    title: 'Modern 2 bedroom apartment, Oud-West',
    city: 'Amsterdam',
    neighbourhood: 'Oud-West',
    type: 'Apartment',
    bedrooms: 2,
    bathrooms: 1,
    toilets: 1,
    sizeM2: 70,
    rent: 2290,
    fee: 75,
    securing: 4580,
    furnished: 'Furnished option available',
    parking: 'No parking',
    description:
      'Modern apartment with an open living space, close to Vondelpark and local shops. Good light all day.',
    amenities: ['Balcony', 'Lift', 'High speed internet ready'],
    images: [img('photo-1600607687939-ce8a6c25118c'), img('photo-1502672260266-1c1ef2d93688'), img('photo-1522708323590-d24dbb6b0267')],
    available: true,
  },
];

export function getProperty(slug: string) {
  return properties.find((p) => p.slug === slug);
}

export function eur(n: number) {
  return '€' + n.toLocaleString('en-US');
}
