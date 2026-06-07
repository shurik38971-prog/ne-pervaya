import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  env: {
    ADMIN_SECRET: process.env.ADMIN_SECRET,
  },
};

export default nextConfig;
