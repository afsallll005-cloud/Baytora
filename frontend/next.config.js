/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'images.unsplash.com',
      'static-assets.propertyfinder.com',
      'plus.unsplash.com',
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async rewrites() {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL;
    if (backendUrl && !backendUrl.includes('localhost')) {
      return [
        {
          source: '/api/:path*',
          destination: `${backendUrl.replace(/\/api\/?$/, '')}/api/:path*`,
        },
      ];
    }
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: '/api/:path*',
          destination: 'http://localhost:5000/api/:path*',
        },
      ];
    }
    return [];
  },
};

module.exports = nextConfig;
