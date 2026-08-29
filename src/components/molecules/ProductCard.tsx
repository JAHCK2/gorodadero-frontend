"use client";

import { ProductPrice, AddButton, GoLogo } from "@/components/atoms";
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
            {/* Contenedor Transparente Oficial Media V2 (Glassmorphism sin fondo blanco) */}
            <div className="product-image-stage relative w-full h-[120px] mb-2 rounded-xl">
                {product.imageUrl ? (
                    <img
                        src={product.imageUrl}
                        alt={product.name}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-contain p-1"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center opacity-15">
                        <GoLogo className="w-12 h-auto grayscale" />
                    </div>
                )}
                
                {/* Botón flotante de agregar al carrito en esquina superior derecha */}
                <div className="absolute top-1 right-1 z-10">
                    <AddButton 
                        quantityInCart={quantityInCart}
                        onClick={(e) => { e.stopPropagation(); onAdd?.(product); }} 
                    />
                </div>
            </div>

            {/* Información del Producto */}
            <div className="flex flex-col px-1 pb-1">
                {/* Precio destacado */}
                <ProductPrice amount={Number(product.sellPrice || 0)} size="md" />

                {/* Marca (si está disponible en catálogo maestro) */}
                {product.brand && (
                    <span className="text-[9px] font-extrabold uppercase text-gray-700 tracking-wider truncate mt-0.5 opacity-75">
                        {product.brand}
                    </span>
                )}
                
                {/* Nombre del Producto */}
                <h3 className="text-[12px] mt-0.5 font-bold text-gray-900 leading-[1.2] line-clamp-2 h-[28px]">
                    {product.name}
                </h3>

                {/* Embalaje / Cantidad y Unidad de Medida */}
                <div className="flex flex-col mt-0.5">
                    <span className="text-[11px] text-gray-600 font-medium truncate leading-none">
                        1 x {product.unitValue || 1} {product.unitType || "Und"}
                    </span>
                    {product.unitValue && product.sellPrice && product.unitType && product.unitValue > 1 && (
                        <span className="text-[10px] text-gray-500 mt-0.5 leading-none">
                            ${(product.sellPrice / product.unitValue).toFixed(1)}/{product.unitType.toLowerCase()}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
