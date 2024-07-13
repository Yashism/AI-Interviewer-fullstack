/** @type {import("next").NextConfig} */
const config = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:5000/api/:path*',
      },
    ];
  },
  // Add this to enable App Router
  experimental: {
    // @ts-ignore
    appDir: true,
  },
};

export default config;