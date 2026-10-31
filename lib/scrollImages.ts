'use client';

import { useEffect, useState } from 'react';

const u = (id: string) =>
  `https://images.unsplash.com/${id}?w=1600&q=80&auto=format&fit=crop`;

/*
 * Refresh only image pools.
 * The server renders the first image in each pool, so server and client
 * match on first paint. On client mount, one option is picked at random
 * and stored in state. That pick never changes during scrolling, on
 * hover, or on any timer, so the image only changes on the next page
 * refresh. There is no hydration mismatch because the random pick
 * happens in useEffect, after hydration, not during render.
 */
export type CameraPair = {
  exterior: string;
  interior: string;
  exteriorAlt: string;
  interiorAlt: string;
};

export const cameraPairs: CameraPair[] = [
  {
    exterior: u('photo-1600596542815-ffad4c1539a9'),
    interior: u('photo-1600607687939-ce8a6c25118c'),
    exteriorAlt: 'Modern house exterior, wide view',
    interiorAlt: 'Bright modern living room interior',
  },
  {
    exterior: u('photo-1512917774080-9991f1c4c750'),
    interior: u('photo-1600210492486-724fe5c67fb0'),
    exteriorAlt: 'Luxury modern house exterior with garden',
    interiorAlt: 'Modern living room with large windows',
  },
  {
    exterior: u('photo-1600585154340-be6161a56a0c'),
    interior: u('photo-1600566753086-00f18fb6b3ea'),
    exteriorAlt: 'Finished modern house exterior',
    interiorAlt: 'Warm modern living room interior',
  },
  {
    exterior: u('photo-1580587771525-78b9dba3b914'),
    interior: u('photo-1493809842364-78817add7ffb'),
    exteriorAlt: 'White painted house exterior',
    interiorAlt: 'Light living room interior',
  },
];

/*
 * Plain wall textures for WindowReveal, not house exteriors.
 * Five options, picked only on page refresh by useRefreshPick.
 * 1 brown brick, 2 rough purple, 3 warm beige plaster,
 * 4 soft sage green textured paint, 5 wooden wall.
 * The rough purple entry is NOT a native purple photo: it is a
 * visually verified rough dark grey wall texture with a deep
 * purple tint overlay applied in WindowReveal, so the roughness
 * stays visible and the colour reads purple. The other four
 * entries were each checked visually as edge-to-edge textures
 * with no house, room, or foreground scene in them.
 */
export type WindowWall = { src: string; label: string; tint?: string };

export const windowWalls: WindowWall[] = [
  {
    src: 'https://res.halfphoto.com/o/1766251955928206/rustic_brick_wall_texture.jpg',
    label: 'Brown brick',
  },
  {
    src: u('photo-1585314062340-f1a5a7c9328d'),
    label: 'Rough purple',
    tint: '#7c3aed',
  },
  {
    src: 'https://atria-usa.com/_next/image?url=%2Fimages%2Fcolors%2Flimewash-c2-avorio.jpg&w=1080&q=75',
    label: 'Warm beige plaster',
  },
  {
    src: 'https://img.myloview.se/fototapeter/green-old-wall-background-texture-700-247921236.jpg',
    label: 'Soft sage green',
  },
  {
    src: 'https://depotimage.com/wp-content/uploads/2025/03/Wooden-Wall-Background.jpg',
    label: 'Wooden wall',
  },
];

export const windowInteriors: string[] = [
  u('photo-1600607687939-ce8a6c25118c'),
  u('photo-1502672260266-1c1ef2d93688'),
  u('photo-1522708323590-d24dbb6b0267'),
  u('photo-1493809842364-78817add7ffb'),
];

export const glassDoorInteriors: string[] = [
  u('photo-1600210492486-724fe5c67fb0'),
  u('photo-1600566753086-00f18fb6b3ea'),
  u('photo-1493809842364-78817add7ffb'),
  u('photo-1600607687939-ce8a6c25118c'),
];

export const blueprintFinals: string[] = [
  u('photo-1600585154340-be6161a56a0c'),
  u('photo-1600596542815-ffad4c1539a9'),
  u('photo-1512917774080-9991f1c4c750'),
  u('photo-1564013799919-ab600027ffc6'),
];

export function useRefreshPick<T>(pool: readonly T[]): T {
  const [pick, setPick] = useState<T>(pool[0]);
  useEffect(() => {
    if (pool.length > 1) {
      setPick(pool[Math.floor(Math.random() * pool.length)]);
    }
  }, [pool]);
  return pick;
}
