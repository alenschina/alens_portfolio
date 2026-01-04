import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,

  // Performance optimizations
  experimental: {
    // Enable optimizations for better performance
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-dialog',
      '@radix-ui/react-select',
      '@radix-ui/react-checkbox',
    ],
  },

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '*.myqcloud.com',
      },
    ],
    // Disable optimization for external images (COS/Unsplash)
    // Next.js cannot access private COS IPs in VPC
    unoptimized: true,
  },

  // Compression and optimization
  compress: true,
  poweredByHeader: false,

  // Generate a static build for better performance
  output: 'standalone',
};

export default nextConfig;
