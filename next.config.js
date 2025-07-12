/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  webpack: (config, { isServer }) => {
    // This is the important part.
    if (!isServer) {
      // We don't want to bundle these for the client.
      config.externals.push("bufferutil", "utf-8-validate");
    }

    return config;
  },
};

module.exports = nextConfig;
