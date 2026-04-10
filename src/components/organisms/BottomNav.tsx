"use client";

import { useState, useEffect } from "react";
import { useNavigation } from "@/hooks/useNavigation";
import { useRouter } from "next/navigation";
import { Home, LayoutGrid, ShoppingCart } from "lucide-react";
import { useCartStore } from "@/store/cartStore";

export function BottomNav() {
    const { navState, goHome, goToMaster } = useNavigation();
    const router = useRouter();
    const items = useCartStore(s => s.getItemCount());
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-[80] bg-white/75 backdrop-blur-xl border-t border-white/40 shadow-[0_-4px_30px_rgba(0,0,0,0.08)] pb-[env(safe-area-inset-bottom)]">
            <div className="max-w-md mx-auto flex items-center justify-around px-2 py-1.5">
                {/* Inicio */}
                <button
                    onClick={() => {
                        goHome();
                        router.push("/");
                    }}
                    className="flex flex-col items-center gap-0.5 active:scale-95 transition-transform w-16"
                >
                    <Home className={`w-5 h-5 ${navState === "home" ? "text-red-500" : "text-[#64748b]"}`} />
                    <span className={`text-[9px] ${navState === "home" ? "font-black text-red-500" : "font-semibold text-[#64748b]"}`}>
                        Inicio
                    </span>
                    {navState === "home" && <div className="w-1 h-1 rounded-full bg-red-500 mt-0.5" />}
                </button>

                {/* Pasillos */}
                <button
                    onClick={() => {
                        goToMaster();
                        router.push("/");
                    }}
                    className="flex flex-col items-center gap-0.5 active:scale-95 transition-transform w-16"
                >
                    <LayoutGrid className={`w-5 h-5 ${navState === "masterView" ? "text-red-500" : "text-[#64748b]"}`} />
                    <span className={`text-[9px] ${navState === "masterView" ? "font-black text-red-500" : "font-semibold text-[#64748b]"}`}>
                        Pasillos
                    </span>
                    {navState === "masterView" && <div className="w-1 h-1 rounded-full bg-red-500 mt-0.5" />}
                </button>

                {/* Carrito */}
                <button
                    onClick={() => router.push("/carrito")}
                    className="relative flex flex-col items-center gap-0.5 active:scale-95 transition-transform w-16"
                >
                    <div className="relative">
                        <ShoppingCart className={`w-5 h-5 text-[#64748b]`} />
                        {(mounted && items > 0) && (
                            <span className="absolute -top-1.5 -right-2 flex items-center justify-center w-[16px] h-[16px] rounded-full bg-red-500 text-white text-[9px] font-black shadow-sm shadow-red-500/30 border border-white">
                                {items}
                            </span>
                        )}
                    </div>
                    <span className={`text-[9px] font-semibold text-[#64748b]`}>
                        Carrito
                    </span>
                </button>
            </div>
        </nav>
    );
}
