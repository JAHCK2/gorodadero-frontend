"use client";

import Image from "next/image";
import { Plus } from "lucide-react";
import { GoLogoFull } from "./GoLogoFull";

export function GoWatermark() {
    return (
        <div className="absolute inset-0 flex items-center justify-center opacity-10">
            <GoLogoFull className="w-16 h-auto grayscale" />
        </div>
    );
}

interface CatalogProductCardProps {
    product: any;
    onClick?: () => void;
}

export function CatalogProductCard({ product, onClick }: CatalogProductCardProps) {
    // Safely parse prices (handles both Prisma Decimal and pre-mapped Number)
    const sellPrice = Number(product.sellPrice || product.sell_price || 0);
    const originalPrice = product.originalPrice ? Number(product.originalPrice) : null;
    const discount = product.discountPercentage ? Number(product.discountPercentage) : null;

    const formattedPrice = `$${sellPrice.toLocaleString("es-CO")}`;
    const formattedOriginal = originalPrice ? `$${originalPrice.toLocaleString("es-CO")}` : null;

    return (
        <div
            className="relative bg-white rounded-xl overflow-hidden active:scale-[0.98] transition-all cursor-pointer"
            onClick={onClick}
        >
            {/* Image container */}
            <div className="relative aspect-square bg-white flex items-center justify-center overflow-hidden">
                {product.imageUrl && product.imageUrl !== "" ? (
                    <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        sizes="(max-width: 768px) 50vw, 33vw"
                        className="object-contain p-3"
                    />
                ) : (
                    <GoWatermark />
                )}

                {/* Green floating add button (Rappi-style) */}
                <button
                    className="absolute top-2 right-2 z-10 flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500 text-white shadow-md shadow-emerald-500/30 active:scale-90 transition-transform"
                    aria-label={`Añadir ${product.name} al carrito`}
                    onClick={(e) => { e.stopPropagation(); }}
                >
                    <Plus className="w-4.5 h-4.5" strokeWidth={2.5} />
                </button>
            </div>

            {/* Product info */}
            <div className="px-1.5 pb-2.5">
                {/* Price */}
                <p className="text-[15px] font-extrabold text-gray-900 leading-tight">
                    {formattedPrice}
                </p>

                {/* Discount + original price */}
                {discount && formattedOriginal && (
                    <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-1 py-0.5 rounded">
                            {`-${discount}%`}
                        </span>
                        <span className="text-[11px] text-gray-400 line-through font-medium">
                            {formattedOriginal}
                        </span>
                    </div>
                )}

                {/* Product name */}
                <p className="mt-1 text-xs font-medium text-gray-700 leading-snug line-clamp-2 min-h-[32px]">
                    {product.name}
                </p>

                {/* Unit info */}
                <p className="mt-0.5 text-[10px] text-gray-400 font-medium">
                    1 Und
                </p>
            </div>
        </div>
    );
}
