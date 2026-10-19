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
    const imageRewrites = [
      {
        source: '/images/logo.png',
        destination: '/images/Logo.png',
      },
    ];

    const backendUrl = process.env.NEXT_PUBLIC_API_URL;
    if (backendUrl && !backendUrl.includes('localhost')) {
      return [
        ...imageRewrites,
        {
          source: '/api/:path*',
          destination: `${backendUrl.replace(/\/api\/?$/, '')}/api/:path*`,
        },
      ];
    }
    if (process.env.NODE_ENV === 'development') {
      return [
        ...imageRewrites,
        {
          source: '/api/:path*',
          destination: 'http://localhost:5000/api/:path*',
        },
      ];
    }
    return imageRewrites;
  },
};

module.exports = nextConfig;
