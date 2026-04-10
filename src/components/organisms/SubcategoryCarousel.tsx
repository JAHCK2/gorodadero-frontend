"use client";

import { forwardRef } from "react";
import { ProductCard } from "@/components/molecules/ProductCard";
import type { Product } from "@/types/product";
import { useCartStore } from "@/store/cartStore";

interface SubcategoryCarouselProps {
    subcategoryName: string;
    subcategoryId: string;
    products: Product[];
    onProductClick: (product: Product) => void;
    onSeeMore?: () => void;
}

export const SubcategoryCarousel = forwardRef<HTMLDivElement, SubcategoryCarouselProps>(
    ({ subcategoryName, subcategoryId, products, onProductClick, onSeeMore }, ref) => {
        if (products.length === 0) return null;

        return (
            <div
                ref={ref}
                id={`cat-${subcategoryId}`}
                className="mb-0.5 scroll-mt-[80px]"
            >
                {/* Section header: Rappi styling */}
                <div className="flex items-center justify-between px-0.5 pr-3 mb-1.5">
                    <h2 
                        className="text-[18px] font-bold text-gray-900 tracking-tight capitalize"
                    >
                        {subcategoryName.toLowerCase()}
                    </h2>
                    <button
                        onClick={onSeeMore}
                        className="flex-shrink-0 px-3 py-1.5 rounded-full bg-white/50 text-[11px] font-bold text-gray-700 active:scale-95 transition-all"
                    >
                        Ver más
                    </button>
                </div>

                {/* Horizontal carousel (Rappi-style) */}
                <div
                    className="flex overflow-x-auto gap-2.5 pb-1.5 snap-x snap-mandatory px-0.5"
                    style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                    {products.map((product) => (
                        <div key={product.id} className="flex-none w-[120px] snap-start">
                            <ProductCard
                                product={product}
                                onTap={() => onProductClick(product)}
                                onAdd={() => useCartStore.getState().addItem(product)}
                            />
                        </div>
                    ))}
                    
                    {/* Tarjeta fantasma al final para motivar a "Ver más" si deslizan hasta el fondo */}
                    {products.length > 3 && (
                        <div className="flex-none w-[70px] snap-center flex items-center justify-center p-2 opacity-80 pl-2 pr-4">
                            <button 
                                onClick={onSeeMore}
                                className="w-10 h-10 rounded-full bg-white/40 backdrop-blur-md flex items-center justify-center shadow-sm active:scale-95 transition-transform"
                            >
                                <svg className="w-4 h-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    }
);

SubcategoryCarousel.displayName = "SubcategoryCarousel";
