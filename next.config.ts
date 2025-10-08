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
    return [
      // Force locale prefix for any root path not starting with allowed prefixes
      {
        source: '/:path((?!es|en|pt|_next|api|studio|favicon\\.ico|robots\\.txt|sitemap\\.xml).*)',
        destination: '/es',
        permanent: true,
      },
      // If locale-prefixed but first section is unknown, collapse to '/:locale'
      {
        source: '/:locale(es|en|pt)/:first((?!services|solutions|portfolio|project|blog|contact).*)',
        destination: '/:locale',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
