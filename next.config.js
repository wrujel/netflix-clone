/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // `images.domains` was removed in Next 16 in favour of remotePatterns.
    remotePatterns: [
      { protocol: "https", hostname: "upload.wikimedia.org" },
      { protocol: "https", hostname: "uhdtv.io" },
      { protocol: "https", hostname: "mango.blender.org" },
      { protocol: "https", hostname: "download.blender.org" },
      { protocol: "https", hostname: "www.themoviedb.org" },
      { protocol: "https", hostname: "resizing.flixster.com" },
    ],
  },
};

module.exports = nextConfig;
