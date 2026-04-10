import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: '**.supabase.in' },
      { protocol: 'https', hostname: 'ik.imagekit.io' },
      { protocol: 'https', hostname: 'chucho-v2.vercel.app' },
    ],
  },
  allowedDevOrigins: ['*.trycloudflare.com', '*.loca.lt', '*.lhr.life', 'township-russia-certainly-owns.trycloudflare.com'],
};

export default nextConfig;
