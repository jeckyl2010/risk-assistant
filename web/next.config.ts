import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone", // Enable standalone output for Docker

  turbopack: {
    root: path.resolve(__dirname, ".."),
  },
};

export default nextConfig;
