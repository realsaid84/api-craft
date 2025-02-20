import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone', // This creates a standalone build
  reactStrictMode: true,
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],

};

export default nextConfig;
