import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true,
  images: {
    unoptimized: true,
  },
  poweredByHeader: false,
  trailingSlash: false,
  experimental: {
    optimizePackageImports: ["hls.js"],
  },
};

export default nextConfig;
