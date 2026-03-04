"use client";

import { Home, LayoutGrid, ShoppingCart } from "lucide-react";

/* ════════════════════════════════════════════════════════════════════
   BottomNav — Glassmorphism bottom navigation bar
   ════════════════════════════════════════════════════════════════════ */

interface BottomNavProps {
    activeTab: "inicio" | "pasillos" | "carrito";
    onInicioClick: () => void;
    onPasillosClick: () => void;
    onCarritoClick?: () => void;
    cartCount?: number;
}

export function BottomNav({
    activeTab,
    onInicioClick,
    onPasillosClick,
    onCarritoClick,
    cartCount = 0,
}: BottomNavProps) {
    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/85 backdrop-blur-2xl border-t border-white/40 shadow-[0_-4px_30px_rgba(0,0,0,0.1)]">
            <div className="max-w-md mx-auto flex items-center justify-around px-4 py-2.5">
                {/* Inicio */}
                <button
                    onClick={onInicioClick}
                    className="flex flex-col items-center gap-1"
                    aria-current={activeTab === "inicio" ? "page" : undefined}
                >
                    <Home className={`w-6 h-6 ${activeTab === "inicio" ? "text-go-red" : "text-[#64748b]"}`} />
                    <span className={`text-[10px] ${activeTab === "inicio" ? "font-black text-go-red" : "font-bold text-[#64748b]"}`}>
                        Inicio
                    </span>
                    {activeTab === "inicio" && <div className="w-1 h-1 rounded-full bg-go-red" />}
                </button>

                {/* Pasillos */}
                <button
                    onClick={onPasillosClick}
                    className="flex flex-col items-center gap-1"
                    aria-current={activeTab === "pasillos" ? "page" : undefined}
                >
                    <LayoutGrid className={`w-6 h-6 ${activeTab === "pasillos" ? "text-go-red" : "text-[#64748b]"}`} />
                    <span className={`text-[10px] ${activeTab === "pasillos" ? "font-black text-go-red" : "font-bold text-[#64748b]"}`}>
                        Pasillos
                    </span>
                    {activeTab === "pasillos" && <div className="w-1 h-1 rounded-full bg-go-red" />}
                </button>

                {/* Carrito */}
                <button
                    onClick={onCarritoClick}
                    className="relative flex flex-col items-center gap-1"
                    aria-current={activeTab === "carrito" ? "page" : undefined}
                >
                    <div className="relative">
                        <ShoppingCart className={`w-6 h-6 ${activeTab === "carrito" ? "text-go-red" : "text-[#64748b]"}`} />
                        <span className="absolute -top-1.5 -right-2 flex items-center justify-center w-[18px] h-[18px] rounded-full bg-go-red text-white text-[10px] font-black shadow-sm shadow-red-500/30">
                            {cartCount}
                        </span>
                    </div>
                    <span className={`text-[10px] ${activeTab === "carrito" ? "font-black text-go-red" : "font-bold text-[#64748b]"}`}>
                        Carrito
                    </span>
                    {activeTab === "carrito" && <div className="w-1 h-1 rounded-full bg-go-red" />}
                </button>
            </div>
        </nav>
    );
}
