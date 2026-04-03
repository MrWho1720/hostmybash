import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Trust the X-Forwarded-* headers from nginx
  serverExternalPackages: ["bcrypt"],
  poweredByHeader: false,
  compress: true,
};

export default nextConfig;
