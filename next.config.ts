import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: 50 * 1024 * 1024, // 10 MB
    },
    optimizeCss: false,
  },
  reactStrictMode: true,
  // swcMinify: false,
};

export default nextConfig;
