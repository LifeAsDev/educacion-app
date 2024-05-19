// @ts-check

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  images: {
    domains: [process.env.NEXT_PUBLIC_DOMAIN_CONFIG_BASE_URL || ""],
  },
};

export default nextConfig;
