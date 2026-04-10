"use client";

// ═══════════════════════════════════════════
// CartItemCard — Tarjeta individual de un item del carrito
// Imagen, nombre, precio, controles de cantidad, subtotal
// ═══════════════════════════════════════════

import Image from "next/image";
import { Plus, Minus, Trash2 } from "lucide-react";
import { GoLogo } from "@/components/atoms";
import { formatCOP } from "@/lib/money";
import type { CartItem } from "@/types/product";

interface CartItemCardProps {
    item: CartItem;
    onIncrease: () => void;
    onDecrease: () => void;
    onRemove: () => void;
}

export function CartItemCard({ item, onIncrease, onDecrease, onRemove }: CartItemCardProps) {
    const { product, quantity } = item;
    const unitPrice = Math.round(Number(product.sellPrice || 0));
    const subtotal = unitPrice * quantity;

    return (
        <div className="flex gap-3 py-4 border-b border-gray-100 last:border-b-0">
            {/* Imagen del producto */}
            <div className="relative w-20 h-20 flex-shrink-0 rounded-xl bg-gray-50 overflow-hidden flex items-center justify-center">
                {product.imageUrl && product.imageUrl !== "" ? (
                    <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        unoptimized={product.imageUrl.startsWith('http')}
                        sizes="80px"
                        className="object-contain p-1.5"
                    />
                ) : (
                    <GoLogo className="w-10 opacity-20 grayscale" />
                )}
            </div>

            {/* Info + controles */}
            <div className="flex-1 min-w-0 flex flex-col justify-between">
                {/* Nombre + botón eliminar */}
                <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-bold text-gray-900 leading-snug line-clamp-2">
                        {product.name}
                    </p>
                    <button
                        onClick={onRemove}
                        className="flex-shrink-0 p-1.5 text-gray-400 hover:text-red-500 active:scale-90 transition-all"
                        aria-label={`Eliminar ${product.name}`}
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>

                {/* Precio unitario */}
                <p className="text-xs text-gray-400 font-medium mt-0.5">
                    {formatCOP(unitPrice)} c/u
                </p>

                {/* Cantidad + subtotal */}
                <div className="flex items-center justify-between mt-2">
                    {/* Controles de cantidad */}
                    <div className="flex items-center gap-0 bg-gray-100 rounded-xl">
                        <button
                            onClick={onDecrease}
                            className="w-8 h-8 flex items-center justify-center rounded-l-xl text-gray-700 active:scale-90 transition-transform hover:bg-gray-200"
                            aria-label="Quitar uno"
                        >
                            <Minus className="w-3.5 h-3.5" strokeWidth={2.5} />
                        </button>
                        <span className="w-8 text-center text-sm font-black text-gray-900">
                            {quantity}
                        </span>
                        <button
                            onClick={onIncrease}
                            className="w-8 h-8 flex items-center justify-center rounded-r-xl text-gray-700 active:scale-90 transition-transform hover:bg-gray-200"
                            aria-label="Agregar uno más"
                        >
                            <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
                        </button>
                    </div>

                    {/* Subtotal */}
                    <p className="text-[15px] font-extrabold text-gray-900">
                        {formatCOP(subtotal)}
                    </p>
                </div>
            </div>
        </div>
    );
}
