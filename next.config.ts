import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    // Optimización de imágenes: permite cargar desde Supabase Storage e ImageKit
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "*.supabase.co",
                pathname: "/storage/v1/object/public/**",
            },
            {
                protocol: "https",
                hostname: "ik.imagekit.io",
                pathname: "/**",
            },
        ],
    },
};

export default nextConfig;
