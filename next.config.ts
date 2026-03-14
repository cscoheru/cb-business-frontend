import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://api.zenconsult.top',
  },
  // Disable prefetching to prevent HTTP requests
  experimental: {
    optimizeCss: false,
  },
};

export default nextConfig;
