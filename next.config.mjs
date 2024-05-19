// @ts-check

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  images: {
    domains: [process.env.NEXT_PUBLIC_BASE_URL || "","localhost"],
  },
};

export default nextConfig;
