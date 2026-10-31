/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'res.halfphoto.com' },
      { protocol: 'https', hostname: 'img.myloview.se' },
      { protocol: 'https', hostname: 'atria-usa.com' },
      { protocol: 'https', hostname: 'depotimage.com' },
    ],
  },
};
export default nextConfig;
