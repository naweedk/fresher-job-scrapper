import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Enable React strict mode for better development experience
  reactStrictMode: true,

  // Ensure MUI emotion styles work correctly
  compiler: {
    emotion: true,
  },

  // Allow images from common sources
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.googleapis.com' },
      { protocol: 'https', hostname: '**.gstatic.com' },
    ],
  },
};

export default nextConfig;
