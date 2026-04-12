"use client";

import Image from "next/image";
import { ProductBadge, ProductPrice, AddButton, GoLogo } from "@/components/atoms";
import { Product } from "@/types/product";
import { useCartStore } from "@/store/cartStore";

export interface ProductCardProps {
    product: Product;
    onTap?: (product: Product) => void;
    onAdd?: (product: Product) => void;
}

export function ProductCard({ product, onTap, onAdd }: ProductCardProps) {
    const quantityInCart = useCartStore((state) => 
        state.items.find(i => i.product.id === product.id)?.quantity || 0
    );

    return (
        <div
            onClick={() => onTap?.(product)}
            className="relative flex flex-col rounded-2xl overflow-hidden border border-white/40 transition-transform active:scale-[0.97] cursor-pointer p-2"
            style={{
                background: "rgba(255,255,255,0.45)",
                backdropFilter: "blur(12px) saturate(1.3)",
                WebkitBackdropFilter: "blur(12px) saturate(1.3)",
                boxShadow: "0 4px 16px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.6)",
            }}
        >
            {/* Minimalist White Image Container */}
            <div className="relative w-full h-[120px] rounded-xl bg-white shadow-[0_2px_8px_rgba(0,0,0,0.05)] border border-gray-100/50 flex items-center justify-center p-2 mb-2 overflow-visible">
                {product.imageUrl ? (
                    <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        unoptimized={product.imageUrl?.startsWith('http')}
                        sizes="(max-width: 768px) 50vw, 33vw"
                        className="object-contain p-2 hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center opacity-10">
                        <GoLogo className="w-12 h-auto grayscale" />
                    </div>
                )}
                
                {/* Floating Add Button Top Right exactly on the edge */}
                <div className="absolute top-1 right-1 z-10">
                    <AddButton 
                        quantityInCart={quantityInCart}
                        onClick={(e) => { e.stopPropagation(); onAdd?.(product); }} 
                    />
                </div>

                {/* Removed Floating Unit Badge Bottom Left */}
            </div>

                {/* Info entirely inside the glass card */}
                <div className="flex flex-col px-1 pb-1">
                    {/* Price prominent like Rappi */}
                    <ProductPrice amount={Number(product.sellPrice || 0)} size="md" />
                    
                    {/* Rappi short title */}
                    <h3 className="text-[12px] mt-0.5 font-bold text-gray-900 leading-[1.2] line-clamp-2 h-[28px]">
                        {product.name}
                    </h3>

                    {/* Embalaje / Cantidad (Rappi style) */}
                    <div className="flex flex-col mt-0.5">
                        <span className="text-[11px] text-gray-500 truncate leading-none">
                            1 x {product.unitValue || 1} {product.unitType || "Und"}
                        </span>
                        {product.unitValue && product.sellPrice && product.unitType && (
                            <span className="text-[10px] text-gray-400 mt-0.5 leading-none">
                                ${(product.sellPrice / product.unitValue).toFixed(1)}/{product.unitType.toLowerCase()}
                            </span>
                        )}
                    </div>
                </div>
        </div>
    );
}
