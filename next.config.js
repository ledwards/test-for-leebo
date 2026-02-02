/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.starwarsunlimited.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.swu-db.com',
        pathname: '/images/**',
      },
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  // Enable static exports if needed, or remove for SSR
  // output: 'export',
}

export default nextConfig
