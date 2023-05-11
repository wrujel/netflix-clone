/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [
      "upload.wikimedia.org",
      "uhdtv.io",
      "mango.blender.org",
      "download.blender.org",
      "themoviedb.org",
    ],
  },
};

module.exports = nextConfig;
