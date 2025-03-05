import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export', // This builds a static export of the app
  //reactStrictMode: true,
  //pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],

};

module.exports = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
}

export default nextConfig;
