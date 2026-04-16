import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone", // Enable standalone output for Docker
  allowedDevOrigins: ["192.168.2.85"],
  turbopack: {
    root: path.resolve(__dirname, ".."),
  },
};

export default nextConfig;
