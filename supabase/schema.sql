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

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.properties enable row level security;
alter table public.saved_homes enable row level security;
alter table public.bookings enable row level security;
alter table public.messages enable row level security;

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

-- Contact messages can be inserted by anyone, read by no one from the
-- client. The agency reads them in the Supabase dashboard.
drop policy if exists "messages insert" on public.messages;
create policy "messages insert" on public.messages for insert with check (true);

insert into public.properties
  (slug, title, city, neighbourhood, type, bedrooms, bathrooms, toilets, size_m2, rent, fee, securing, furnished, parking, description, amenities, images)
values
  ('modern-two-bedroom-apartment-jordaan', 'Modern 2 bedroom apartment, Jordaan', 'Amsterdam', 'Jordaan, Herengracht area', 'Apartment', 2, 1, 1, 68, 2450, 75, 4900, 'Furnished option available', 'No parking', 'Light filled corner apartment close to canals, trams, and shops. Quiet street, bright living room, and a practical kitchen.', array['Balcony', 'Washing machine', 'High speed internet ready', 'Bike storage'], array['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&q=80&auto=format&fit=crop', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=80&auto=format&fit=crop', 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&q=80&auto=format&fit=crop']),
  ('bright-one-bedroom-apartment-katendrecht', 'Bright 1 bedroom apartment, Katendrecht', 'Rotterdam', 'Katendrecht, Wilhelminapier area', 'Apartment', 1, 1, 1, 52, 1850, 60, 3700, 'Unfurnished', 'Street parking nearby', 'Modern 1 bedroom apartment with a balcony, near the metro and river views. Good for one person or a couple.', array['Balcony', 'Lift', 'Bike storage'], array['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=80&auto=format&fit=crop', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&q=80&auto=format&fit=crop', 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80&auto=format&fit=crop']),
  ('cozy-two-bedroom-apartment-wittevrouwen', 'Cozy 2 bedroom apartment, Wittevrouwen', 'Utrecht', 'Wittevrouwen, near Griftpark', 'Apartment', 2, 1, 1, 61, 1695, 60, 3390, 'Partly furnished', 'No parking', 'Quiet street in Utrecht, near Griftpark and the city centre. Ideal for a couple or a small household.', array['Garden access', 'Bike storage', 'Washing machine'], array['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=80&auto=format&fit=crop', 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&q=80&auto=format&fit=crop', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&q=80&auto=format&fit=crop']),
  ('light-two-bedroom-apartment-de-pijp', 'Light 2 bedroom apartment, De Pijp', 'Amsterdam', 'De Pijp', 'Apartment', 2, 1, 1, 64, 2150, 75, 4300, 'Furnished option available', 'No parking', 'Bright apartment in a lively neighbourhood, close to markets, cafes, and trams. Two good sized bedrooms.', array['Balcony', 'Lift', 'Bike storage'], array['https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&q=80&auto=format&fit=crop', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=80&auto=format&fit=crop', 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=80&auto=format&fit=crop']),
  ('spacious-three-bedroom-house-kralingen', 'Spacious 3 bedroom house, Kralingen', 'Rotterdam', 'Kralingen', 'Terraced house', 3, 2, 2, 92, 1980, 80, 3960, 'Unfurnished', 'Street parking nearby', 'Family house with a garden, three bedrooms, and two bathrooms. Quiet area, close to parks and public transport.', array['Garden', 'Bike storage', 'Washing machine'], array['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80&auto=format&fit=crop', 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80&auto=format&fit=crop', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&q=80&auto=format&fit=crop']),
  ('modern-two-bedroom-apartment-oud-west', 'Modern 2 bedroom apartment, Oud-West', 'Amsterdam', 'Oud-West', 'Apartment', 2, 1, 1, 70, 2290, 75, 4580, 'Furnished option available', 'No parking', 'Modern apartment with an open living space, close to Vondelpark and local shops. Good light all day.', array['Balcony', 'Lift', 'High speed internet ready'], array['https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80&auto=format&fit=crop', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&q=80&auto=format&fit=crop', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=80&auto=format&fit=crop'])
on conflict (slug) do nothing;
