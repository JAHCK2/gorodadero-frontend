import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "GoRodadero — Tu Super en Minutos",
  description: "Pide lo que necesites desde El Rodadero, Santa Marta. Entrega en 15 minutos, 24/7.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0f172a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} antialiased overflow-hidden overscroll-none fixed inset-0`}>
      <body className="w-full h-[100dvh] flex flex-col font-sans overflow-hidden overscroll-none bg-gray-50 fixed inset-0 m-0 p-0">{children}</body>
    </html>
  );
}
