"use client";

// ═══════════════════════════════════════════
// OrderSummary — Resumen del pedido en checkout
// Lista compacta: nombre × qty = subtotal, total
// ═══════════════════════════════════════════

import { ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { formatCOP } from "@/lib/money";

export function OrderSummary() {
    const items = useCartStore((s) => s.items);
    const total = useCartStore((s) => s.getTotal());
    const itemCount = useCartStore((s) => s.getItemCount());

    return (
        <section className="px-4 pt-4 pb-2">
            <h2 className="text-base font-extrabold text-gray-900 mb-3 flex items-center gap-2">
                <ShoppingBag className="w-4.5 h-4.5 text-emerald-500" />
                Tu pedido ({itemCount} {itemCount === 1 ? "producto" : "productos"})
            </h2>

            <div className="bg-gray-50 rounded-2xl p-3.5 border border-gray-100">
                {/* Lista de items */}
                {items.map((item) => {
                    const unitPrice = Math.round(Number(item.product.sellPrice || 0));
                    const subtotal = unitPrice * item.quantity;

                    return (
                        <div
                            key={item.product.id}
                            className="flex items-center justify-between py-2 border-b border-gray-200/60 last:border-b-0"
                        >
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-800 truncate pr-3">
                                    {item.product.name}
                                </p>
                                <p className="text-xs text-gray-400 font-medium">
                                    {formatCOP(unitPrice)} × {item.quantity}
                                </p>
                            </div>
                            <p className="text-sm font-bold text-gray-900 flex-shrink-0">
                                {formatCOP(subtotal)}
                            </p>
                        </div>
                    );
                })}

                {/* Separador */}
                <div className="h-px bg-gray-200 my-2.5" />

                {/* Subtotal */}
                <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-500">Subtotal</span>
                    <span className="text-sm font-bold text-gray-700">{formatCOP(total)}</span>
                </div>

                {/* Envío */}
                <div className="flex items-center justify-between mt-1">
                    <span className="text-sm font-semibold text-gray-500">Envío</span>
                    <span className="text-sm font-bold text-emerald-600">Gratis 🎉</span>
                </div>

                {/* Total */}
                <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-gray-200">
                    <span className="text-base font-extrabold text-gray-900">Total</span>
                    <span className="text-lg font-black text-gray-900">{formatCOP(total)}</span>
                </div>
            </div>
        </section>
    );
}
