/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  swcMinify: false, // avoid minifier crash in CI for SSR chunks (e.g., sanity/lib)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
      {
        protocol: 'https',
        hostname: '**.mediadelivery.net',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'lh1.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'lh2.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'lh4.googleusercontent.com',
      },
    ]
  },
  async rewrites() {
    return [
      // Services localized paths
      { source: '/es/servicios', destination: '/es/services' },
      { source: '/es/servicios/:slug', destination: '/es/services/:slug' },
      { source: '/pt/servicos', destination: '/pt/services' },
      { source: '/pt/servicos/:slug', destination: '/pt/services/:slug' },

      // Portfolio listing
      { source: '/es/portafolio', destination: '/es/portfolio' },
      // Portuguese keeps 'portfolio' as-is

      // Contact
      { source: '/es/contacto', destination: '/es/contact' },
      { source: '/pt/contato', destination: '/pt/contact' },

      // Project detail parent localized
      { source: '/es/proyecto/:slug', destination: '/es/project/:slug' },
      { source: '/pt/projeto/:slug', destination: '/pt/project/:slug' },
    ];
  }
};

export default nextConfig;
