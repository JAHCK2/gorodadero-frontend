"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { useCartStore } from "@/store/cartStore";
import { MIN_ORDER_DELIVERY } from "@/lib/constants";
import { formatCOP } from "@/lib/money";
import { Plus, Minus, Trash2 } from "lucide-react";
import { GoLogo } from "@/components/atoms";

export function CartSummaryBar({ onCheckout, hidden = false }: { onCheckout: () => void, hidden?: boolean }) {
    const { items, getItemCount, getTotal } = useCartStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const totalItems = getItemCount();

    if (!mounted || totalItems === 0) return null;

    const total = getTotal();
    const isUnderMin = total < MIN_ORDER_DELIVERY;

    return (
        <>
            {/* ── QUICK CART BUBBLE & BANNER (PORTAL) ── */}
            {mounted && createPortal(
                <div className={`fixed bottom-3 pb-[env(safe-area-inset-bottom)] left-0 right-0 z-[9999] px-3 flex flex-col items-center gap-2 drop-shadow-2xl transition-all duration-300 ${hidden ? 'translate-y-32 opacity-0 pointer-events-none' : 'animate-in slide-in-from-bottom-5'}`}>
                    <div 
                        className="w-full max-w-md bg-white/90 backdrop-blur-lg text-gray-900 rounded-[20px] p-[6px] pr-5 flex items-center justify-between cursor-pointer border border-white/50 active:scale-[0.98] transition-transform select-none" 
                        onClick={onCheckout}
                        style={{
                            boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
                            touchAction: "manipulation",
                            WebkitTouchCallout: "none",
                            WebkitUserSelect: "none",
                        }}
                    >
                        <div className="flex items-center gap-3 pl-1">
                            {/* Thumbnails — decorative only, parent handles click */}
                            <div className="flex items-center -space-x-2 ml-0.5">
                                {items.slice(0, 3).map((item, i) => (
                                    <div key={item.product.id} className="w-[34px] h-[34px] rounded-[8px] bg-white overflow-hidden relative flex items-center justify-center p-[2px] shadow-sm border border-[#0de09d] drop-shadow-md select-none" style={{ zIndex: 3 - i }}>
                                        {item.product.imageUrl ? (
                                            <Image src={item.product.imageUrl} fill unoptimized={item.product.imageUrl.startsWith('http')} className="object-contain rounded-[6px] pointer-events-none" alt="img" sizes="34px" draggable={false} />
                                        ) : (
                                            <GoLogo className="w-4 grayscale opacity-30 bg-white rounded-[6px] w-full h-full p-0.5 pointer-events-none" />
                                        )}
                                    </div>
                                ))}
                                {items.length > 3 && (
                                    <div className="w-[34px] h-[34px] rounded-[8px] bg-gray-100 text-gray-700 flex items-center justify-center font-black text-[11px] shadow-sm tracking-tighter border border-gray-200" style={{ zIndex: 0 }}>
                                        +{items.length - 3}
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-col">
                                <span className="font-bold text-[14px] leading-tight tracking-tight text-gray-900">
                                    Ver carrito
                                </span>
                                {isUnderMin && (
                                    <span className="text-[11px] font-black text-orange-500 leading-tight mt-0.5">
                                        Faltan {formatCOP(MIN_ORDER_DELIVERY - total)}
                                    </span>
                                )}
                            </div>
                        </div>
                        <span className="font-black text-[22px] text-[#F97316] leading-none pt-0.5">{formatCOP(total)}</span>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}
