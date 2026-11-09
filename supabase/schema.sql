-- HOUZQORA Supabase schema.
-- Run this once in the Supabase SQL editor (Dashboard -> SQL editor -> New query).
-- It creates the tables the app queries, turns on row level security,
-- and seeds the six properties that were previously hard coded in the app.
-- It is safe to run again: inserts use on conflict do nothing.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null default '',
  email text not null default '',
  phone text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.properties (
  slug text primary key,
  title text not null,
  city text not null,
  neighbourhood text not null,
  type text not null,
  bedrooms int not null,
  bathrooms int not null,
  toilets int not null,
  size_m2 int not null,
  rent int not null,
  fee int not null,
  securing int not null,
  furnished text not null,
  parking text not null,
  description text not null,
  amenities text[] not null default '{}',
  images text[] not null default '{}',
  available boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.saved_homes (
  user_id uuid not null references auth.users (id) on delete cascade,
  property_slug text not null references public.properties (slug) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, property_slug)
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  property_slug text not null references public.properties (slug) on delete cascade,
  fee_paid boolean not null default false,
  viewing_slot text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, property_slug)
);

alter table public.profiles enable row level security;
alter table public.properties enable row level security;
alter table public.saved_homes enable row level security;
alter table public.bookings enable row level security;

-- Properties are public to read, so the landing page and detail pages
-- work without a login. Everything else is owned by the signed in user.
drop policy if exists "properties read" on public.properties;
create policy "properties read" on public.properties for select using (true);

drop policy if exists "profiles own" on public.profiles;
create policy "profiles own" on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "saved_homes own" on public.saved_homes;
create policy "saved_homes own" on public.saved_homes for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "bookings own" on public.bookings;
create policy "bookings own" on public.bookings for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

insert into public.properties
  (slug, title, city, neighbourhood, type, bedrooms, bathrooms, toilets, size_m2, rent, fee, securing, furnished, parking, description, amenities, images)
values
  ('modern-two-bedroom-apartment-jordaan', 'Modern 2 bedroom apartment, Jordaan', 'Amsterdam', 'Jordaan, Herengracht area', 'Apartment', 2, 1, 1, 68, 1225, 75, 2450, 'Furnished option available', 'No parking', 'Light filled corner apartment close to canals, trams, and shops. Quiet street, bright living room, and a practical kitchen.', array['Balcony', 'Washing machine', 'High speed internet ready', 'Bike storage'], array['https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?w=1200&q=80&auto=format&fit=crop', 'https://images.unsplash.com/photo-1595526051245-4506e0005bd0?w=1200&q=80&auto=format&fit=crop', 'https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?w=1200&q=80&auto=format&fit=crop']),
  ('bright-one-bedroom-apartment-katendrecht', 'Bright 1 bedroom apartment, Katendrecht', 'Rotterdam', 'Katendrecht, Wilhelminapier area', 'Apartment', 1, 1, 1, 52, 925, 60, 1850, 'Unfurnished', 'Street parking nearby', 'Modern 1 bedroom apartment with a balcony, near the metro and river views. Good for one person or a couple.', array['Balcony', 'Lift', 'Bike storage'], array['https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=1200&q=80&auto=format&fit=crop', 'https://live.staticflickr.com/5106/5621505925_acc68ecab8.jpg', 'https://live.staticflickr.com/5265/5622129494_9525559b19.jpg']),
  ('cozy-two-bedroom-apartment-wittevrouwen', 'Cozy 2 bedroom apartment, Wittevrouwen', 'Utrecht', 'Wittevrouwen, near Griftpark', 'Apartment', 2, 1, 1, 61, 848, 60, 1695, 'Partly furnished', 'No parking', 'Quiet street in Utrecht, near Griftpark and the city centre. Ideal for a couple or a small household.', array['Garden access', 'Bike storage', 'Washing machine'], array['https://live.staticflickr.com/171/465852851_a341bac227_b.jpg', 'https://live.staticflickr.com/203/481696481_a42f476447_b.jpg', 'https://images.unsplash.com/photo-1493150134366-cacb0bdc03fe?w=1200&q=80&auto=format&fit=crop']),
  ('light-two-bedroom-apartment-de-pijp', 'Light 2 bedroom apartment, De Pijp', 'Amsterdam', 'De Pijp', 'Apartment', 2, 1, 1, 64, 1075, 75, 2150, 'Furnished option available', 'No parking', 'Bright apartment in a lively neighbourhood, close to markets, cafes, and trams. Two good sized bedrooms.', array['Balcony', 'Lift', 'Bike storage'], array['https://images.unsplash.com/photo-1617806118233-18e1de247200?w=1200&q=80&auto=format&fit=crop', 'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=1200&q=80&auto=format&fit=crop', 'https://live.staticflickr.com/5343/17962466086_10dbd657db_b.jpg']),
  ('spacious-three-bedroom-house-kralingen', 'Spacious 3 bedroom house, Kralingen', 'Rotterdam', 'Kralingen', 'Terraced house', 3, 2, 2, 92, 990, 80, 1980, 'Unfurnished', 'Street parking nearby', 'Family house with a garden, three bedrooms, and two bathrooms. Quiet area, close to parks and public transport.', array['Garden', 'Bike storage', 'Washing machine'], array['https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=1200&q=80&auto=format&fit=crop', 'https://live.staticflickr.com/3359/3640924252_21e2e7d3ff_b.jpg', 'https://live.staticflickr.com/5065/5622095124_1ebfd1dffc.jpg']),
  ('modern-two-bedroom-apartment-oud-west', 'Modern 2 bedroom apartment, Oud-West', 'Amsterdam', 'Oud-West', 'Apartment', 2, 1, 1, 70, 1145, 75, 2290, 'Furnished option available', 'No parking', 'Modern apartment with an open living space, close to Vondelpark and local shops. Good light all day.', array['Balcony', 'Lift', 'High speed internet ready'], array['https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1200&q=80&auto=format&fit=crop', 'https://images.rawpixel.com/editor_1024/cHJpdmF0ZS9zdGF0aWMvaW1hZ2Uvd2Vic2l0ZS8yMDIyLTA0L2xyL3B4NjU4MDk1LWltYWdlLWt3dnY4ZWkxLmpwZw.jpg', 'https://live.staticflickr.com/5028/5621505703_a1304b18a3.jpg']),
  ('sunny-two-bedroom-apartment-oost', 'Sunny 2 bedroom apartment, Oost', 'Amsterdam', 'Oost', 'Apartment', 2, 1, 1, 62, 1095, 75, 2190, 'Partly furnished', 'Street parking nearby', 'Sunny corner apartment in Oost, close to Oosterpark and the Dappermarkt. Bright living room and a quiet bedroom at the back.', array['Balcony', 'Washing machine', 'High speed internet ready', 'Bike storage'], array['https://images.unsplash.com/photo-1556912167-f556f1f39fdf?w=1200&q=80&auto=format&fit=crop', 'https://live.staticflickr.com/3905/14448948114_7f800eacc7_b.jpg', 'https://live.staticflickr.com/2923/14047892633_6804bf921d_b.jpg']),
  ('bright-one-bedroom-apartment-noord', 'Bright 1 bedroom apartment, Noord', 'Amsterdam', 'Noord', 'Apartment', 1, 1, 1, 48, 950, 65, 1900, 'Unfurnished', 'No parking', 'Compact one bedroom across the IJ in Noord, a short ferry ride from Central Station. Light and easy to keep.', array['Bike storage', 'Washing machine', 'High speed internet ready'], array['https://images.unsplash.com/photo-1576941089067-2de3c901e126?w=1200&q=80&auto=format&fit=crop', 'https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=1200&q=80&auto=format&fit=crop', 'https://upload.wikimedia.org/wikipedia/commons/a/a3/Modern_kitchen_interior_featuring_wooden_shelving_and_organized_dishware_in_a_cozy_setting.jpg']),
  ('modern-three-bedroom-apartment-rivierenbuurt', 'Modern 3 bedroom apartment, Rivierenbuurt', 'Amsterdam', 'Rivierenbuurt', 'Apartment', 3, 2, 2, 84, 1700, 80, 3400, 'Furnished', 'Street parking nearby', 'Three bedroom apartment in the quiet Rivierenbuurt, near the Amstel and the RAI. Good for a small household.', array['Balcony', 'Lift', 'Dishwasher', 'Bike storage'], array['https://images.unsplash.com/photo-1618220179428-22790b461013?w=1200&q=80&auto=format&fit=crop', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&q=80&auto=format&fit=crop', 'https://live.staticflickr.com/5069/5622104990_ab93a05c36.jpg']),
  ('light-two-bedroom-apartment-ijburg', 'Light 2 bedroom apartment, IJburg', 'Amsterdam', 'IJburg', 'Apartment', 2, 1, 1, 70, 1125, 75, 2250, 'Furnished option available', 'Private parking', 'Modern two bedroom in IJburg with water views and a balcony. New build, quiet streets, close to the tram.', array['Balcony', 'Washing machine', 'Dishwasher', 'Bike storage'], array['https://live.staticflickr.com/5216/5388657026_32c07fe664_b.jpg', 'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?w=1200&q=80&auto=format&fit=crop', 'https://live.staticflickr.com/2052/2301310989_79aa1822c4_b.jpg']),
  ('cozy-two-bedroom-apartment-delfshaven', 'Cozy 2 bedroom apartment, Delfshaven', 'Rotterdam', 'Delfshaven', 'Apartment', 2, 1, 1, 58, 895, 65, 1790, 'Partly furnished', 'Street parking nearby', 'Two bedroom apartment in historic Delfshaven, by the harbour and the metro. Characterful street, bright rooms.', array['Balcony', 'Washing machine', 'Bike storage'], array['https://live.staticflickr.com/5015/5388054365_288cf72f15_b.jpg', 'https://live.staticflickr.com/3059/2336288488_c3f50bb4a1_b.jpg', 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=1200&q=80&auto=format&fit=crop']),
  ('spacious-three-bedroom-house-hillegersberg', 'Spacious 3 bedroom house, Hillegersberg', 'Rotterdam', 'Hillegersberg', 'Terraced house', 3, 2, 2, 96, 1395, 80, 2790, 'Unfurnished', 'Private parking', 'Three bedroom family house in green Hillegersberg, near the lake. Garden and room for everyone.', array['Garden', 'Bike storage', 'Washing machine', 'Storage room'], array['https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1200&q=80&auto=format&fit=crop', 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&q=80&auto=format&fit=crop', 'https://images.unsplash.com/photo-1615875605825-5eb9bb5d52ac?w=1200&q=80&auto=format&fit=crop']),
  ('bright-one-bedroom-studio-feijenoord', 'Bright 1 bedroom studio, Feijenoord', 'Rotterdam', 'Feijenoord', 'Studio', 1, 1, 1, 38, 745, 60, 1490, 'Furnished', 'No parking', 'Furnished studio in Feijenoord, a short walk from Rotterdam South station. Small, bright, and ready to move into.', array['Washing machine', 'High speed internet ready', 'Bike storage'], array['https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1200&q=80&auto=format&fit=crop', 'https://live.staticflickr.com/3574/3771284560_170e357487.jpg', 'https://live.staticflickr.com/5300/5388048563_61c3bd3306_b.jpg']),
  ('modern-two-bedroom-apartment-lombok', 'Modern 2 bedroom apartment, Lombok', 'Utrecht', 'Lombok', 'Apartment', 2, 1, 1, 64, 985, 70, 1970, 'Partly furnished', 'Street parking nearby', 'Two bedroom apartment in Lombok, Utrecht, close to the station and the Kanaalstraat shops. Lively street, quiet flat.', array['Balcony', 'Washing machine', 'Bike storage', 'Dishwasher'], array['https://images.unsplash.com/photo-1616627561839-074385245ff6?w=1200&q=80&auto=format&fit=crop', 'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=1200&q=80&auto=format&fit=crop', 'https://live.staticflickr.com/5110/5622095298_5aed39c411.jpg']),
  ('spacious-three-bedroom-house-leidsche-rijn', 'Spacious 3 bedroom house, Leidsche Rijn', 'Utrecht', 'Leidsche Rijn', 'Terraced house', 3, 2, 2, 98, 1495, 80, 2990, 'Unfurnished', 'Private parking', 'Three bedroom house in Leidsche Rijn, Utrecht, with a garden and parking. New neighbourhood, close to the A2 and the centre.', array['Garden', 'Washing machine', 'Dishwasher', 'Storage room'], array['https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=1200&q=80&auto=format&fit=crop', 'https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?w=1200&q=80&auto=format&fit=crop', 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=1200&q=80&auto=format&fit=crop']),
  ('bright-one-bedroom-apartment-oog-in-al', 'Bright 1 bedroom apartment, Oog in Al', 'Utrecht', 'Oog in Al', 'Apartment', 1, 1, 1, 46, 875, 65, 1750, 'Furnished', 'No parking', 'One bedroom apartment in Oog in Al, by the park and the canal. Quiet and green, ten minutes from the centre.', array['Bike storage', 'Washing machine', 'High speed internet ready'], array['https://live.staticflickr.com/3724/10656909925_862077c842_b.jpg', 'https://images.unsplash.com/photo-1605146769289-440113cc3d00?w=1200&q=80&auto=format&fit=crop', 'https://images.unsplash.com/photo-1416331108676-a22ccb276e35?w=1200&q=80&auto=format&fit=crop']),
  ('modern-two-bedroom-apartment-centrum-den-haag', 'Modern 2 bedroom apartment, Centrum, The Hague', 'The Hague', 'Centrum', 'Apartment', 2, 1, 1, 66, 1045, 75, 2090, 'Furnished option available', 'Street parking nearby', 'Two bedroom apartment in the centre of The Hague, near the Grote Markt and the tram. City life on your doorstep.', array['Balcony', 'Lift', 'Washing machine', 'Bike storage'], array['https://live.staticflickr.com/5214/5388052993_efdcb497f3_b.jpg', 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=1200&q=80&auto=format&fit=crop', 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200&q=80&auto=format&fit=crop']),
  ('bright-two-bedroom-apartment-scheveningen', 'Bright 2 bedroom apartment, Scheveningen', 'The Hague', 'Scheveningen', 'Apartment', 2, 1, 1, 72, 1125, 75, 2250, 'Partly furnished', 'Street parking nearby', 'Two bedroom apartment a short walk from Scheveningen beach and the pier. Sea air, balcony, and light rooms.', array['Balcony', 'Washing machine', 'High speed internet ready', 'Bike storage'], array['https://live.staticflickr.com/18/23695009_f6588835f5.jpg', 'https://images.unsplash.com/photo-1604709177225-055f99402ea3?w=1200&q=80&auto=format&fit=crop', 'https://live.staticflickr.com/5012/5388652886_653aa47ec8_b.jpg']),
  ('cozy-one-bedroom-apartment-bezuidenhout', 'Cozy 1 bedroom apartment, Bezuidenhout', 'The Hague', 'Bezuidenhout', 'Apartment', 1, 1, 1, 52, 925, 65, 1850, 'Unfurnished', 'No parking', 'One bedroom apartment in Bezuidenhout, near Central Station and the Haagse Bos. Quiet street, quick commute.', array['Bike storage', 'Washing machine', 'High speed internet ready'], array['https://images.unsplash.com/photo-1620626011761-996317b8d101?w=1200&q=80&auto=format&fit=crop', 'https://live.staticflickr.com/3332/3640921488_c3a578da95_b.jpg', 'https://images.unsplash.com/photo-1615874959474-d609969a20ed?w=1200&q=80&auto=format&fit=crop']),
  ('spacious-three-bedroom-house-statenkwartier', 'Spacious 3 bedroom house, Statenkwartier', 'The Hague', 'Statenkwartier', 'Terraced house', 3, 2, 2, 104, 1595, 80, 3190, 'Unfurnished', 'Private parking', 'Three bedroom house in the Statenkwartier, near the beach and the international quarter. Garden and a big living room.', array['Garden', 'Terrace', 'Washing machine', 'Bike storage'], array['https://images.unsplash.com/photo-1449844908441-8829872d2607?w=1200&q=80&auto=format&fit=crop', 'https://live.staticflickr.com/5146/5621505745_d733eeda44.jpg', 'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=1200&q=80&auto=format&fit=crop']),
  ('modern-two-bedroom-apartment-strijp', 'Modern 2 bedroom apartment, Strijp', 'Eindhoven', 'Strijp', 'Apartment', 2, 1, 1, 60, 895, 65, 1790, 'Partly furnished', 'Street parking nearby', 'Two bedroom apartment in Strijp, Eindhoven, in the old Philips quarter. Industrial character, close to the station.', array['Balcony', 'Washing machine', 'High speed internet ready', 'Bike storage'], array['https://live.staticflickr.com/5028/5621506169_4351a13ff4.jpg', 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200&q=80&auto=format&fit=crop', 'https://live.staticflickr.com/5057/5388055503_bdfec0a3d5_b.jpg']),
  ('bright-three-bedroom-house-woensel', 'Bright 3 bedroom house, Woensel', 'Eindhoven', 'Woensel', 'Terraced house', 3, 1, 1, 88, 995, 70, 1990, 'Unfurnished', 'Private parking', 'Three bedroom house in Woensel, Eindhoven, with a garden and parking. Family street, close to shops and schools.', array['Garden', 'Washing machine', 'Storage room', 'Bike storage'], array['https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=1200&q=80&auto=format&fit=crop', 'https://live.staticflickr.com/3388/3640922830_279fd38fa1_b.jpg', 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=1200&q=80&auto=format&fit=crop']),
  ('cozy-two-bedroom-apartment-centrum-groningen', 'Cozy 2 bedroom apartment, Centrum', 'Groningen', 'Centrum', 'Apartment', 2, 1, 1, 58, 825, 60, 1650, 'Furnished', 'No parking', 'Two bedroom apartment in the centre of Groningen, near the Grote Markt. Lively, furnished, and easy to live in.', array['Balcony', 'Washing machine', 'High speed internet ready'], array['https://images.unsplash.com/photo-1600585152915-d208bec867a1?w=1200&q=80&auto=format&fit=crop', 'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=1200&q=80&auto=format&fit=crop', 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1200&q=80&auto=format&fit=crop']),
  ('spacious-three-bedroom-house-helpman', 'Spacious 3 bedroom house, Helpman', 'Groningen', 'Helpman', 'Terraced house', 3, 2, 2, 92, 945, 70, 1890, 'Unfurnished', 'Street parking nearby', 'Three bedroom house in Helpman, Groningen, near the Sterrebos. Garden, quiet street, and a short cycle to the centre.', array['Garden', 'Bike storage', 'Washing machine', 'Dishwasher'], array['https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&q=80&auto=format&fit=crop', 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200&q=80&auto=format&fit=crop', 'https://live.staticflickr.com/7196/6859957080_8f1ca6d839_b.jpg']),
  ('bright-two-bedroom-apartment-wyck', 'Bright 2 bedroom apartment, Wyck', 'Maastricht', 'Wyck', 'Apartment', 2, 1, 1, 63, 895, 65, 1790, 'Partly furnished', 'Street parking nearby', 'Two bedroom apartment in Wyck, Maastricht, across the river from the old town. Bright rooms and a balcony.', array['Balcony', 'Washing machine', 'High speed internet ready', 'Bike storage'], array['https://live.staticflickr.com/8334/29300385324_361473db02_b.jpg', 'https://images.unsplash.com/photo-1599809275671-b5942cabc7a2?w=1200&q=80&auto=format&fit=crop', 'https://images.unsplash.com/photo-1617104551722-3b2d51366400?w=1200&q=80&auto=format&fit=crop']),
  ('charming-one-bedroom-apartment-jekerkwartier', 'Charming 1 bedroom apartment, Jekerkwartier', 'Maastricht', 'Jekerkwartier', 'Apartment', 1, 1, 1, 47, 795, 60, 1590, 'Furnished', 'No parking', 'One bedroom apartment in the Jekerkwartier, Maastricht, by the city wall and the park. Character and quiet in the centre.', array['Washing machine', 'High speed internet ready', 'Bike storage'], array['https://images.unsplash.com/photo-1605276373954-0c4a0dac5b12?w=1200&q=80&auto=format&fit=crop', 'https://live.staticflickr.com/5185/5621505611_6c676488a2.jpg', 'https://live.staticflickr.com/4040/4334861134_b003b7d3a8.jpg']),
  ('modern-two-bedroom-apartment-centrum-haarlem', 'Modern 2 bedroom apartment, Centrum, Haarlem', 'Haarlem', 'Centrum', 'Apartment', 2, 1, 1, 61, 975, 70, 1950, 'Partly furnished', 'Street parking nearby', 'Two bedroom apartment in the centre of Haarlem, near the Grote Markt. Old town charm with modern rooms.', array['Balcony', 'Lift', 'Washing machine', 'Bike storage'], array['https://images.unsplash.com/photo-1616486029423-aaa4789e8c9a?w=1200&q=80&auto=format&fit=crop', 'https://live.staticflickr.com/5294/5388046113_48d973bd16_b.jpg', 'https://images.unsplash.com/photo-1600566752229-250ed79470f8?w=1200&q=80&auto=format&fit=crop']),
  ('cozy-three-bedroom-house-kleverpark', 'Cozy 3 bedroom house, Kleverpark', 'Haarlem', 'Kleverpark', 'Terraced house', 3, 1, 1, 90, 1095, 75, 2190, 'Unfurnished', 'Private parking', 'Three bedroom house in Kleverpark, Haarlem, with a garden and parking. Quiet family street near the station.', array['Garden', 'Washing machine', 'Storage room', 'Bike storage'], array['https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=1200&q=80&auto=format&fit=crop', 'https://live.staticflickr.com/3078/3156631237_404f825e91_b.jpg', 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&q=80&auto=format&fit=crop']),
  ('bright-two-bedroom-apartment-merenwijk', 'Bright 2 bedroom apartment, Merenwijk', 'Leiden', 'Merenwijk', 'Apartment', 2, 1, 1, 59, 925, 65, 1850, 'Partly furnished', 'Street parking nearby', 'Two bedroom apartment in Merenwijk, Leiden, near the water and the cycle path to the centre. Light and practical.', array['Balcony', 'Washing machine', 'Bike storage', 'Dishwasher'], array['https://live.staticflickr.com/18/23695007_b73e411b5f.jpg', 'https://live.staticflickr.com/3811/19336249803_ee5a6ffb23_b.jpg', 'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=1200&q=80&auto=format&fit=crop']),
  ('modern-two-bedroom-apartment-tanthof', 'Modern 2 bedroom apartment, Tanthof', 'Delft', 'Tanthof', 'Apartment', 2, 1, 1, 57, 875, 65, 1750, 'Unfurnished', 'Street parking nearby', 'Two bedroom apartment in Tanthof, Delft, with a balcony and a green view. Quiet neighbourhood, close to the tram.', array['Balcony', 'Washing machine', 'High speed internet ready', 'Bike storage'], array['https://live.staticflickr.com/435/19769242770_0ff977f1bd_b.jpg', 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=1200&q=80&auto=format&fit=crop', 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1200&q=80&auto=format&fit=crop']),
  ('spacious-three-bedroom-house-ginneken', 'Spacious 3 bedroom house, Ginneken', 'Breda', 'Ginneken', 'Terraced house', 3, 2, 1, 94, 1045, 75, 2090, 'Unfurnished', 'Private parking', 'Three bedroom house in Ginneken, Breda, with a garden and parking. Village feel, ten minutes from the centre.', array['Garden', 'Terrace', 'Washing machine', 'Storage room'], array['https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1200&q=80&auto=format&fit=crop', 'https://images.unsplash.com/photo-1560185009-5bf9f2849488?w=1200&q=80&auto=format&fit=crop', 'https://images.rawpixel.com/editor_1024/czNmcy1wcml2YXRlL3Jhd3BpeGVsX2ltYWdlcy93ZWJzaXRlX2NvbnRlbnQvbHIvcHgxMjczNjAzLWltYWdlLWt3dnkwOHJnLmpwZw.jpg']),
  ('cozy-two-bedroom-apartment-bottendaal', 'Cozy 2 bedroom apartment, Bottendaal', 'Nijmegen', 'Bottendaal', 'Apartment', 2, 1, 1, 60, 895, 65, 1790, 'Partly furnished', 'No parking', 'Two bedroom apartment in Bottendaal, Nijmegen, near the station and the Waal. Popular neighbourhood, bright rooms.', array['Balcony', 'Washing machine', 'Bike storage'], array['https://live.staticflickr.com/5093/5388058111_cbf80b7902_b.jpg', 'https://images.unsplash.com/photo-1431576901776-e539bd916ba2?w=1200&q=80&auto=format&fit=crop', 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=1200&q=80&auto=format&fit=crop']),
  ('bright-two-bedroom-apartment-stadshagen', 'Bright 2 bedroom apartment, Stadshagen', 'Zwolle', 'Stadshagen', 'Apartment', 2, 1, 1, 62, 865, 65, 1730, 'Partly furnished', 'Street parking nearby', 'Two bedroom apartment in Stadshagen, Zwolle, in a new neighbourhood with a park nearby. Light, modern, and quiet.', array['Balcony', 'Washing machine', 'Dishwasher', 'Bike storage'], array['https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=1200&q=80&auto=format&fit=crop', 'https://live.staticflickr.com/419/19769242430_f6dd83d369_b.jpg', 'https://live.staticflickr.com/2291/2194426835_9aaf21b973.jpg']),
  ('modern-two-bedroom-apartment-klarendal', 'Modern 2 bedroom apartment, Klarendal', 'Arnhem', 'Klarendal', 'Apartment', 2, 1, 1, 58, 895, 65, 1790, 'Unfurnished', 'Street parking nearby', 'Two bedroom apartment in Klarendal, Arnhem, near the Modekwartier. Creative neighbourhood, close to the centre.', array['Balcony', 'Washing machine', 'High speed internet ready', 'Bike storage'], array['https://live.staticflickr.com/5225/5621506089_0c728b1d07.jpg', 'https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=1200&q=80&auto=format&fit=crop', 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=1200&q=80&auto=format&fit=crop']),
  ('cozy-two-bedroom-apartment-huiswaard', 'Cozy 2 bedroom apartment, Huiswaard', 'Alkmaar', 'Huiswaard', 'Apartment', 2, 1, 1, 60, 845, 60, 1690, 'Partly furnished', 'Street parking nearby', 'Two bedroom apartment in Huiswaard, Alkmaar, with a balcony and a view over the green. Quiet and practical.', array['Balcony', 'Washing machine', 'Bike storage'], array['https://live.staticflickr.com/65535/54595477920_b229a439f4_b.jpg', 'https://images.unsplash.com/photo-1600494603989-9650cf6ddd3d?w=1200&q=80&auto=format&fit=crop', 'https://images.unsplash.com/photo-1600585153490-76fb20a32601?w=1200&q=80&auto=format&fit=crop']),
  ('bright-three-bedroom-house-vathorst', 'Bright 3 bedroom house, Vathorst', 'Amersfoort', 'Vathorst', 'Terraced house', 3, 2, 2, 96, 1025, 70, 2050, 'Unfurnished', 'Private parking', 'Three bedroom house in Vathorst, Amersfoort, with a garden and parking. New build in a family neighbourhood.', array['Garden', 'Washing machine', 'Dishwasher', 'Storage room'], array['https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=1200&q=80&auto=format&fit=crop', 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200&q=80&auto=format&fit=crop', 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?w=1200&q=80&auto=format&fit=crop']),
  ('modern-two-bedroom-apartment-sterrenburg', 'Modern 2 bedroom apartment, Sterrenburg', 'Dordrecht', 'Sterrenburg', 'Apartment', 2, 1, 1, 61, 845, 60, 1690, 'Partly furnished', 'Street parking nearby', 'Two bedroom apartment in Sterrenburg, Dordrecht, near the park and the water. Light rooms and a balcony.', array['Balcony', 'Washing machine', 'High speed internet ready', 'Bike storage'], array['https://images.unsplash.com/photo-1558036117-15d82a90b9b1?w=1200&q=80&auto=format&fit=crop', 'https://live.staticflickr.com/7458/12221757635_f1ddeb72eb_b.jpg', 'https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=1200&q=80&auto=format&fit=crop']),
  ('spacious-three-bedroom-house-reeshof', 'Spacious 3 bedroom house, Reeshof', 'Tilburg', 'Reeshof', 'Terraced house', 3, 1, 2, 98, 975, 70, 1950, 'Unfurnished', 'Private parking', 'Three bedroom house in Reeshof, Tilburg, with a garden and parking. Room for a family, close to schools and the station.', array['Garden', 'Washing machine', 'Storage room', 'Bike storage'], array['https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=1200&q=80&auto=format&fit=crop', 'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=1200&q=80&auto=format&fit=crop', 'https://live.staticflickr.com/5269/5621505649_9661875c70.jpg']),
  ('cozy-two-bedroom-apartment-goverwelle', 'Cozy 2 bedroom apartment, Goverwelle', 'Gouda', 'Goverwelle', 'Apartment', 2, 1, 1, 57, 825, 60, 1650, 'Partly furnished', 'Street parking nearby', 'Two bedroom apartment in Goverwelle, Gouda, near the park and the station. Quiet street, light and easy.', array['Balcony', 'Washing machine', 'Bike storage'], array['https://images.rawpixel.com/editor_1024/czNmcy1wcml2YXRlL3Jhd3BpeGVsX2ltYWdlcy93ZWJzaXRlX2NvbnRlbnQvbHIvcHgxMDY3MjMyLWltYWdlLWt3dnk2OGI1LmpwZw.jpg', 'https://images.unsplash.com/photo-1571508601891-ca5e7a713859?w=1200&q=80&auto=format&fit=crop', 'https://live.staticflickr.com/5071/5857338309_4e127ec8a0_b.jpg']),
  ('bright-two-bedroom-apartment-roombeek', 'Bright 2 bedroom apartment, Roombeek', 'Enschede', 'Roombeek', 'Apartment', 2, 1, 1, 63, 875, 65, 1750, 'Partly furnished', 'Street parking nearby', 'Two bedroom apartment in Roombeek, Enschede, in the rebuilt quarter near the museum. Modern, bright, and quiet.', array['Balcony', 'Washing machine', 'High speed internet ready', 'Bike storage'], array['https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1200&q=80&auto=format&fit=crop', 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=1200&q=80&auto=format&fit=crop', 'https://live.staticflickr.com/3835/14965388366_0069e272ff_b.jpg'])
on conflict (slug) do nothing;



-- Storage bucket for admin image uploads. Already created on the
-- live project through the Storage API; this is here so a fresh
-- run of this file also creates it. Uploads go through the admin
-- server action with the service role key, which bypasses row level
-- security, so no storage policies are needed. Public read lets
-- visitors see house photos without signed links.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('property-images', 'property-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
on conflict (id) do nothing;

-- Per-user new-user discount, linked to the account, so it follows
-- the user across devices instead of living only in one browser.
-- One row per user: when the discount window starts, and whether
-- the user claimed it. The 7 day window is starts_at plus 7 days.
-- Row level security is owner only; the app reads and writes only
-- the signed in user's own row.
create table if not exists public.user_discounts (
  user_id uuid primary key references auth.users (id) on delete cascade,
  starts_at timestamptz not null default now(),
  claimed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_discounts enable row level security;

drop policy if exists "user_discounts own" on public.user_discounts;
create policy "user_discounts own" on public.user_discounts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Payments, for the real Mollie and Stripe pipeline. One row per
-- payment attempt, created by the server when checkout starts and
-- only marked paid by a provider webhook after the provider confirms
-- the money. The fee itself is never taken from the browser: the
-- server reads it from the properties table. Row level security is
-- read only for the owner; only the server, with the service role
-- key, writes payments, so a browser can never mark itself paid.
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  property_slug text not null references public.properties (slug) on delete cascade,
  provider text not null check (provider in ('mollie', 'stripe')),
  method text not null check (method in ('ideal', 'card')),
  provider_payment_id text not null unique,
  amount_cents int not null,
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.payments enable row level security;

drop policy if exists "payments own read" on public.payments;
create policy "payments own read" on public.payments for select using (auth.uid() = user_id);
