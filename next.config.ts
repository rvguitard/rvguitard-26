import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: {
    position: "top-right",
  },
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
