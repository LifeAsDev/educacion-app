// @ts-check

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname:
          process.env.NEXT_PUBLIC_DOMAIN_CONFIG_BASE_URL ||
          "default.hostname.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
