import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker deployment
  output: "standalone",

  // Optimize for production
  poweredByHeader: false,

  // Enable experimental features if needed
  experimental: {
    // Server Actions are stable in Next.js 14+
  },
};

export default nextConfig;
