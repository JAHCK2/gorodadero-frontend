"use client";

// ═══════════════════════════════════════════
// EmptyCart — Estado vacío del carrito
// Muestra mensaje + CTA para explorar tienda
// ═══════════════════════════════════════════

import { ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";
import { BottomNav } from "@/components/organisms/BottomNav";

export function EmptyCart() {
    const router = useRouter();

    return (
        <div className="flex flex-col items-center justify-center min-h-[75vh] px-6 text-center">
            {/* Premium Decorative Icon */}
            <div className="relative mb-8">
                <div className="w-32 h-32 rounded-full bg-orange-50 flex items-center justify-center shadow-[inset_0_-4px_10px_rgba(0,0,0,0.02)]">
                    <ShoppingCart className="w-16 h-16 text-orange-400" strokeWidth={1.5} />
                </div>
                {/* Micro-animations and floating specs */}
                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-blue-100 shadow-sm animate-pulse" />
                <div className="absolute bottom-2 -left-3 w-4 h-4 rounded-full bg-yellow-100 shadow-sm" />
            </div>

            <h2 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">
                Tu carrito está vacío
            </h2>
            <p className="text-[15px] text-gray-500 mb-8 max-w-[280px] leading-relaxed">
                Parece que aún no has encontrado lo que buscas. ¡Veamos los pasillos!
            </p>

            <button
                onClick={() => router.push("/")}
                className="px-8 py-4 w-full max-w-[240px] bg-[#F97316] text-white font-black text-base rounded-[20px] shadow-[0_8px_20px_rgba(249,115,22,0.3)] active:scale-95 transition-transform hover:bg-[#EA580C]"
            >
                Explorar Tienda
            </button>
            <BottomNav />
        </div>
    );
}
