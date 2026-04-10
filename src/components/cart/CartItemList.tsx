"use client";

// ═══════════════════════════════════════════
// CartItemList — Lista de items del carrito
// Conecta con Zustand y mapea CartItemCard[]
// ═══════════════════════════════════════════

import { useCartStore } from "@/store/cartStore";
import { CartItemCard } from "./CartItemCard";
import { Trash2 } from "lucide-react";
import { useState } from "react";

export function CartItemList() {
    const items = useCartStore((s) => s.items);
    const addItem = useCartStore((s) => s.addItem);
    const removeItem = useCartStore((s) => s.removeItem);
    const updateQuantity = useCartStore((s) => s.updateQuantity);
    const clearCart = useCartStore((s) => s.clearCart);
    const [showClearConfirm, setShowClearConfirm] = useState(false);

    return (
        <div className="px-4 pb-4">
            {/* Header con contador + vaciar */}
            <div className="flex items-center justify-between mb-2 pt-1">
                <h2 className="text-sm font-bold text-gray-500">
                    {items.length} {items.length === 1 ? "producto" : "productos"}
                </h2>
                <button
                    onClick={() => setShowClearConfirm(true)}
                    className="flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-red-500 active:scale-95 transition-all py-1 px-2 rounded-lg"
                >
                    <Trash2 className="w-3.5 h-3.5" />
                    Vaciar
                </button>
            </div>

            {/* Lista de items */}
            {items.map((item) => (
                <CartItemCard
                    key={item.product.id}
                    item={item}
                    onIncrease={() => addItem(item.product)}
                    onDecrease={() => updateQuantity(item.product.id, item.quantity - 1)}
                    onRemove={() => removeItem(item.product.id)}
                />
            ))}

            {/* Confirmación de vaciar carrito */}
            {showClearConfirm && (
                <div className="fixed inset-0 z-[80] flex items-center justify-center p-6">
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={() => setShowClearConfirm(false)}
                    />
                    <div className="relative bg-white rounded-2xl p-6 max-w-[300px] w-full shadow-2xl text-center">
                        <Trash2 className="w-10 h-10 text-red-400 mx-auto mb-3" />
                        <h3 className="text-lg font-extrabold text-gray-900 mb-1">
                            ¿Vaciar carrito?
                        </h3>
                        <p className="text-sm text-gray-500 mb-5">
                            Se eliminarán todos los productos
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowClearConfirm(false)}
                                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-700 active:scale-95 transition-transform"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => {
                                    clearCart();
                                    setShowClearConfirm(false);
                                }}
                                className="flex-1 py-2.5 rounded-xl bg-red-500 text-sm font-bold text-white shadow-lg shadow-red-500/30 active:scale-95 transition-transform"
                            >
                                Sí, vaciar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
