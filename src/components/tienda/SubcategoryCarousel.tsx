"use client";

import { forwardRef } from "react";
import { CatalogProductCard } from "./CatalogProductCard";
import type { Product } from "@/types/product";

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
                data-subcategory-id={subcategoryId}
                className="mb-2"
            >
                {/* Section header: big title + Ver más pill */}
                <div className="flex items-start justify-between px-3 pt-5 pb-3">
                    <h3 className="text-[22px] font-extrabold text-gray-900 leading-tight max-w-[65%]">
                        {subcategoryName}
                    </h3>
                    <button
                        onClick={onSeeMore}
                        className="flex-shrink-0 mt-1 px-3.5 py-1.5 rounded-full border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors active:scale-95"
                    >
                        Ver más
                    </button>
                </div>

                {/* Horizontal carousel (Rappi-style) */}
                <div
                    className="flex overflow-x-auto gap-3 px-3 pb-4 snap-x snap-mandatory"
                    style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                    {products.map((product) => (
                        <div key={product.id} className="flex-none w-[150px] snap-start">
                            <CatalogProductCard
                                product={product}
                                onClick={() => onProductClick(product)}
                            />
                        </div>
                    ))}
                </div>
            </div>
        );
    }
);

SubcategoryCarousel.displayName = "SubcategoryCarousel";
