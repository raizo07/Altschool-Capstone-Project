


/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        // Apply headers to all routes
        source: '/(.*)',
        headers: [
          {
            key: 'Host',
            value: 'raizo.tech',
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/api/auth/:path*',
        destination: '/api/auth/:path*',
      },
    ];
  },
  experimental: {
    serverComponentsExternalPackages: ["pino", "pino-pretty"],
  },
};

export default nextConfig;
