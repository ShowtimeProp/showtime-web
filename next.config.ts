import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.sanity.io" },
      { protocol: "https", hostname: "**.mediadelivery.net" as any },
      { protocol: "https", hostname: "lh1.googleusercontent.com" },
      { protocol: "https", hostname: "lh2.googleusercontent.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "lh4.googleusercontent.com" },
    ],
  },
  async redirects() {
    return [];
  },
};

export default nextConfig;
