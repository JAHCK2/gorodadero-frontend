"use client";

import { ShoppingCart } from "lucide-react";
import { useCartStore } from "@/store/cartStore";

// ═══════════════════════════════════════════
// PasillosFab — FAB flotante con badge del carrito
// Muestra la cantidad real de items en el carrito
// ═══════════════════════════════════════════

export function PasillosFab({ onClick }: { onClick: () => void }) {
    const itemCount = useCartStore((s) => s.getItemCount());

    return (
        <button
            onClick={onClick}
            className="fixed bottom-24 right-4 z-50 flex flex-col items-center justify-center w-16 h-16 rounded-full bg-black text-white shadow-xl shadow-black/40 hover:scale-105 active:scale-95 transition-transform"
            aria-label="Abrir Pasillos"
        >
            {/* Cart icon with badge */}
            <div className="relative">
                <ShoppingCart className="w-5 h-5" strokeWidth={2} />
                {itemCount > 0 && (
                    <span className="absolute -top-2 -right-2.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-go-red text-white text-[10px] font-black shadow-sm animate-bounce-once">
                        {itemCount > 99 ? "99+" : itemCount}
                    </span>
                )}
            </div>
            <span className="text-[7px] font-black uppercase tracking-wider mt-0.5">
                {itemCount > 0 ? "Carrito" : "Pasillos"}
            </span>

            <style>{`
                @keyframes bounce-once {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.3); }
                }
                .animate-bounce-once {
                    animation: bounce-once 0.3s ease-out;
                }
            `}</style>
        </button>
    );
}
