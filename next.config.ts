import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "http://localhost",
    "localhost",
    "http://127.0.0.1",
    "127.0.0.1",
  ],
};

export default nextConfig;
