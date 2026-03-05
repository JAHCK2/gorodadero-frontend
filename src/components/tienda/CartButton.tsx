"use client";

import { Plus, Minus } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import type { Product } from "@/types/product";

// ═══════════════════════════════════════════
// CartButton — Botón smart para la card de producto
// Muestra "+" cuando qty=0, +/qty/- cuando qty>0
// ═══════════════════════════════════════════

interface CartButtonProps {
    product: Product;
}

export function CartButton({ product }: CartButtonProps) {
    const addItem = useCartStore((s) => s.addItem);
    const removeItem = useCartStore((s) => s.removeItem);
    const updateQuantity = useCartStore((s) => s.updateQuantity);
    const qty = useCartStore((s) => s.getItemQuantity(product.id));

    if (qty === 0) {
        return (
            <button
                className="absolute top-2 right-2 z-10 flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500 text-white shadow-md shadow-emerald-500/30 active:scale-90 transition-transform"
                aria-label={`Añadir ${product.name} al carrito`}
                onClick={(e) => {
                    e.stopPropagation();
                    addItem(product);
                }}
            >
                <Plus className="w-4 h-4" strokeWidth={2.5} />
            </button>
        );
    }

    return (
        <div
            className="absolute top-2 right-2 z-10 flex items-center gap-0.5 rounded-full bg-emerald-500 shadow-md shadow-emerald-500/30"
            onClick={(e) => e.stopPropagation()}
        >
            <button
                className="flex items-center justify-center w-7 h-7 rounded-full text-white active:scale-90 transition-transform"
                onClick={() => updateQuantity(product.id, qty - 1)}
                aria-label="Quitar uno"
            >
                <Minus className="w-3.5 h-3.5" strokeWidth={2.5} />
            </button>
            <span className="text-white text-xs font-black min-w-[16px] text-center">
                {qty}
            </span>
            <button
                className="flex items-center justify-center w-7 h-7 rounded-full text-white active:scale-90 transition-transform"
                onClick={() => addItem(product)}
                aria-label="Agregar uno más"
            >
                <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
            </button>
        </div>
    );
}
