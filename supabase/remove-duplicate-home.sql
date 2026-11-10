-- Remove the duplicate house: Oudorp's cover (modern-24) shows the same
-- house as Princenhage's cover (modern-33). Oudorp is removed; Princenhage
-- keeps the daylight cover. Oudorp's 3 furnished interiors are kept as a
-- 5th photo on the first 3 furnished-compatible homes in listing order.
-- Oudorp's cover (modern-24) is retired, never reused, and its bucket
-- files were deleted.
DELETE FROM properties WHERE slug = 'spacious-three-bedroom-house-oudorp';
UPDATE properties SET images = array_append(images, 'https://mryhoedhyllfplsjhcce.supabase.co/storage/v1/object/public/property-images/homes/modern-two-bedroom-apartment-oud-west/5.jpg') WHERE slug = 'modern-two-bedroom-apartment-oud-west';
UPDATE properties SET images = array_append(images, 'https://mryhoedhyllfplsjhcce.supabase.co/storage/v1/object/public/property-images/homes/cozy-two-bedroom-apartment-wittevrouwen/5.jpg') WHERE slug = 'cozy-two-bedroom-apartment-wittevrouwen';
UPDATE properties SET images = array_append(images, 'https://mryhoedhyllfplsjhcce.supabase.co/storage/v1/object/public/property-images/homes/modern-two-bedroom-apartment-jordaan/5.jpg') WHERE slug = 'modern-two-bedroom-apartment-jordaan';
