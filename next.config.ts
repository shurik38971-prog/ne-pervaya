import type { NextConfig } from "next";

const adminSecret = process.env.ADMIN_SECRET ?? "";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  env: {
    ADMIN_SECRET: adminSecret,
    NEXT_PUBLIC_ADMIN_SECRET: adminSecret,
  },
};

export default nextConfig;
