// Layout raíz — GoRodadero
// Google Fonts: Inter + Outfit

import type { Metadata, Viewport } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
    display: "swap",
});

const outfit = Outfit({
    subsets: ["latin"],
    variable: "--font-outfit",
    display: "swap",
});

export const metadata: Metadata = {
    title: "GoRodadero — Tu tienda, directo a tu puerta",
    description:
        "Pide los mejores productos con delivery rápido. Catálogo de 2500+ productos, pago fácil, entrega a domicilio en El Rodadero.",
    manifest: "/manifest.json",
    keywords: ["GoRodadero", "delivery", "tienda", "El Rodadero", "domicilio", "productos"],
    icons: {
        icon: [
            { url: "/favicon.png", sizes: "32x32", type: "image/png" },
            { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
            { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
        ],
        apple: [
            { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
        ],
    },
    openGraph: {
        title: "GoRodadero — Tu tienda, directo a tu puerta",
        description: "Catálogo de 2500+ productos con delivery rápido en El Rodadero.",
        type: "website",
    },
};

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    themeColor: "#FFFFFF",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="es" className={`${inter.variable} ${outfit.variable}`} suppressHydrationWarning={true}>
            <body suppressHydrationWarning={true}>
                {children}
            </body>
        </html>
    );
}
