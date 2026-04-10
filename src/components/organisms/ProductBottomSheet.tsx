// ═══════════════════════════════════════════════════════════
// Organism: ProductBottomSheet — Product detail panel
// Hero image, badge, price-per-unit, quantity +/- and CTA
// ═══════════════════════════════════════════════════════════
"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { ProductBadge, ProductPrice, GoLogo } from "@/components/atoms";
import { formatCOP } from "@/lib/money";
import { Product } from "@/types/product";

interface ProductBottomSheetProps {
    product: Product | null;
    onClose: () => void;
    /** Called when user taps "Agregar" CTA */
    onAdd?: (product: Product, quantity: number) => void;
}

/** Calculate price per unit (ml or g) if applicable */
function pricePerUnit(
    price: number,
    unitType?: string | null,
    unitValue?: number | null,
): string | null {
    if (!unitValue || unitValue <= 0) return null;
    const type = (unitType || "").toLowerCase().trim();
    if (type === "ml" || type === "l" || type === "cc") {
        const ml = type === "l" ? unitValue * 1000 : unitValue;
        const perMl = price / ml;
        if (perMl < 10) return `$${perMl.toFixed(1)}/ml`;
        return `$${Math.round(perMl)}/ml`;
    }
    if (type === "g" || type === "kg") {
        const g = type === "kg" ? unitValue * 1000 : unitValue;
        const perG = price / g;
        if (perG < 10) return `$${perG.toFixed(1)}/g`;
        return `$${Math.round(perG)}/g`;
    }
    return null;
}

export function ProductBottomSheet({
    product,
    onClose,
    onAdd,
}: ProductBottomSheetProps) {
    const [qty, setQty] = useState(1);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (product) {
            setQty(1); // Reset quantity upon opening
            setTimeout(() => setIsVisible(true), 10);
            
            // Push history state to intercept Android Back button
            window.history.pushState({ productSheetOpen: true }, "");
            const handlePopState = () => {
                setIsVisible(false);
                setTimeout(onClose, 300);
            };
            window.addEventListener("popstate", handlePopState);
            return () => window.removeEventListener("popstate", handlePopState);
        } else {
            setIsVisible(false);
        }
    }, [product, onClose]);

    const closeSheet = useCallback(() => {
        // If we close manually, we should also pop the history state to keep it clean
        setIsVisible(false);
        setTimeout(() => {
            window.history.back(); // This naturally triggers the popstate or at least clears the stack
        }, 300);
    }, []);

    const handleBackdrop = useCallback(
        (e: React.MouseEvent) => {
            if (e.target === e.currentTarget) {
                window.history.back();
            }
        },
        [],
    );

    if (!product) return null;

    const perUnit = pricePerUnit(
        Number(product.sellPrice),
        product.unitType,
        product.unitValue,
    );
    const total = Number(product.sellPrice) * qty;

    return (
        <div
            className={`fixed inset-0 z-[100] flex items-end justify-center transition-colors duration-300 ${isVisible ? 'bg-black/15' : 'bg-transparent pointer-events-none'}`}
            onClick={handleBackdrop}
        >
            {/* ── Panel ── */}
            <div
                className={`relative w-full max-w-md bg-white/50 backdrop-blur-3xl saturate-150 rounded-t-3xl shadow-[0_-8px_40px_rgba(0,0,0,0.1)] flex flex-col transition-transform duration-300 transform ${isVisible ? 'translate-y-0' : 'translate-y-full'}`}
                style={{
                    maxHeight: '90vh',
                    borderTop: "1px solid rgba(255,255,255,0.6)"
                }}
            >
                {/* Drag handle */}
                <div className="flex justify-center pt-3 pb-1" onClick={() => window.history.back()}>
                    <div className="w-10 h-1 rounded-full bg-gray-300 cursor-pointer hover:bg-gray-400" />
                </div>

                <div className="overflow-y-auto no-scrollbar flex-1 pb-4">
                    {/* ── Hero image ── */}
                    <div className="flex items-center justify-center px-6 py-4">
                        <div className="relative w-[280px] h-[280px]">
                            {product.imageUrl ? (
                                <Image
                                    src={product.imageUrl}
                                    alt={product.name}
                                    fill
                                    unoptimized={product.imageUrl?.startsWith('http')}
                                    sizes="(max-width: 768px) 100vw, 400px"
                                    className="object-contain drop-shadow-[0_8px_24px_rgba(0,0,0,0.15)]"
                                />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center opacity-10">
                                    <GoLogo className="w-24 h-auto grayscale" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── Product info ── */}
                    <div className="px-5 pb-2">
                        {/* Badge + Price/unit row */}
                        <div className="flex items-center gap-2 mb-2">
                            <ProductBadge
                                unitType={product.unitType}
                                unitValue={product.unitValue}
                                size="md"
                            />
                            {perUnit && (
                                <span className="text-[11px] text-gray-400 font-medium">
                                    {perUnit}
                                </span>
                            )}
                        </div>

                        {/* Name */}
                        <h2 className="text-[20px] font-bold text-gray-900 leading-tight">
                            {product.name}
                        </h2>

                        {/* Category hint */}
                        <p className="text-[12px] text-gray-400 mt-0.5">
                            Producto · Tienda
                        </p>

                        {/* Price */}
                        <div className="mt-2">
                            <ProductPrice amount={Number(product.sellPrice)} size="lg" />
                        </div>
                    </div>
                </div>

                {/* ── Purchase zone ── */}
                <div className="px-5 py-4 border-t border-white/50 mt-auto bg-white/40 backdrop-blur-md rounded-t-3xl">
                    <div className="flex items-center gap-4">
                        {/* Quantity selector */}
                        <div className="flex items-center gap-3 bg-gray-100 rounded-full px-1 py-1">
                            <button
                                onClick={() =>
                                    setQty((q) => Math.max(1, q - 1))
                                }
                                className="w-9 h-9 rounded-full bg-white text-gray-600 flex items-center justify-center text-[20px] font-bold shadow-sm active:scale-95 transition-transform"
                            >
                                −
                            </button>
                            <span className="text-[18px] font-bold text-gray-900 w-6 text-center">
                                {qty}
                            </span>
                            <button
                                onClick={() => setQty((q) => q + 1)}
                                className="w-9 h-9 rounded-full bg-[#F97316] text-white flex items-center justify-center text-[20px] font-bold shadow-sm active:scale-95 transition-transform"
                            >
                                +
                            </button>
                        </div>

                        {/* CTA button */}
                        <button
                            onClick={() => {
                                onAdd?.(product, qty);
                                window.history.back();
                            }}
                            className="flex-1 h-12 rounded-2xl bg-[#F97316] hover:bg-orange-600 text-white font-bold text-[15px] flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 active:scale-[0.97] transition-all"
                        >
                            <svg
                                className="w-5 h-5"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <circle cx="8" cy="21" r="1" />
                                <circle cx="19" cy="21" r="1" />
                                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                            </svg>
                            Agregar {formatCOP(total)}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
