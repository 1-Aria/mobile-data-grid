import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  reactStrictMode: true,
  images: {
    // Add the domain where your Firestore images are hosted
    domains: ['firebasestorage.googleapis.com', 'storage.googleapis.com'],
  },
};

export default nextConfig;
