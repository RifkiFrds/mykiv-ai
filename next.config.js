/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: false },
  images: { unoptimized: true },
  output: 'export',
  distDir: 'dist',
  experimental: {
    serverActions: true,
  },
};

module.exports = nextConfig;
