import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  serverExternalPackages: ["@react-pdf/renderer"],
  allowedDevOrigins: ["*.space-z.ai"],
};

export default nextConfig;
