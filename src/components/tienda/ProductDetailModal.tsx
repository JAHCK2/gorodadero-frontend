"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { X, Plus, Minus, ShoppingBag, Heart } from "lucide-react";
import { GoWatermark } from "./CatalogProductCard";
import type { Product } from "@/types/product";

interface ProductDetailModalProps {
    product: Product;
    allProducts?: Product[];
    onClose: () => void;
    onAddToCart?: (product: Product, quantity: number) => void;
}

export function ProductDetailModal({ product, allProducts = [], onClose, onAddToCart }: ProductDetailModalProps) {
    const [quantity, setQuantity] = useState(1);
    const [closing, setClosing] = useState(false);
    const [entering, setEntering] = useState(true);

    // Animate entrance
    useEffect(() => {
        requestAnimationFrame(() => setEntering(false));
    }, []);

    const handleClose = () => {
        setClosing(true);
        setTimeout(onClose, 280);
    };

    // Parse prices safely
    const sellPrice = Number(product.sellPrice || 0);
    const originalPrice = product.originalPrice ? Number(product.originalPrice) : null;
    const discount = product.discountPercentage ? Number(product.discountPercentage) : null;
    const formattedPrice = `$${sellPrice.toLocaleString("es-CO")}`;
    const formattedOriginal = originalPrice ? `$${originalPrice.toLocaleString("es-CO")}` : null;
    const totalPrice = `$${(sellPrice * quantity).toLocaleString("es-CO")}`;

    // Real related products: same category, exclude self
    const relatedProducts = allProducts
        .filter(p => p.categoryId === product.categoryId && p.id !== product.id)
        .slice(0, 6);

    // Complementary: random products from different categories
    const complementaryProducts = allProducts
        .filter(p => p.categoryId !== product.categoryId)
        .sort(() => Math.random() - 0.5)
        .slice(0, 5);

    return (
        <div className="fixed inset-0 z-[70] flex justify-center">
            {/* Backdrop */}
            <div
                className={`absolute inset-0 bg-black transition-opacity duration-300 ${closing ? 'opacity-0' : entering ? 'opacity-0' : 'opacity-40'}`}
                onClick={handleClose}
            />

            {/* Modal Container — full bottom sheet */}
            <div
                className={`relative w-full max-w-md bg-white h-[calc(100vh-16px)] mt-[16px] rounded-t-[28px] overflow-hidden flex flex-col shadow-2xl transition-transform duration-300 ease-out ${closing ? 'translate-y-full' : entering ? 'translate-y-full' : 'translate-y-0'
                    }`}
            >
                {/* ─── DRAG INDICATOR ─── */}
                <div className="flex justify-center pt-2.5 pb-1 flex-shrink-0">
                    <div className="w-10 h-1 rounded-full bg-gray-300" />
                </div>

                {/* ─── CLOSE BUTTON (floating) ─── */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 left-4 z-20 flex items-center justify-center w-9 h-9 rounded-full bg-gray-100/80 backdrop-blur-md text-gray-700 active:scale-90 transition-transform hover:bg-gray-200"
                    aria-label="Cerrar"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* ─── FAVORITE BUTTON (floating) ─── */}
                <button
                    className="absolute top-4 right-4 z-20 flex items-center justify-center w-9 h-9 rounded-full bg-gray-100/80 backdrop-blur-md text-gray-700 active:scale-90 transition-transform hover:bg-gray-200"
                    aria-label="Favorito"
                >
                    <Heart className="w-5 h-5" />
                </button>

                {/* ─── SCROLLABLE CONTENT ─── */}
                <div className="flex-1 overflow-y-auto pb-28" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>

                    {/* ─── IMAGE AREA ─── */}
                    <div className="bg-white px-6 pt-4 pb-6 flex flex-col items-center">
                        <div className="relative w-64 h-64 flex items-center justify-center">
                            {product.imageUrl && product.imageUrl !== "" ? (
                                <Image
                                    src={product.imageUrl}
                                    alt={product.name}
                                    fill
                                    className="object-contain"
                                    sizes="(max-width: 768px) 80vw, 400px"
                                    priority
                                />
                            ) : (
                                <GoWatermark />
                            )}
                        </div>

                        {/* Image dots indicator */}
                        <div className="flex items-center gap-2 mt-4">
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                            <div className="w-2 h-2 rounded-full bg-gray-200" />
                            <div className="w-2 h-2 rounded-full bg-gray-200" />
                        </div>
                    </div>

                    {/* ─── PRODUCT INFO ─── */}
                    <div className="px-5 pb-5">
                        {/* Price row */}
                        <div className="flex items-end gap-3">
                            <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                                {formattedPrice}
                            </h1>
                            {discount && formattedOriginal && (
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-sm text-gray-400 line-through font-bold">
                                        {formattedOriginal}
                                    </span>
                                    <span className="text-xs font-black text-white bg-emerald-500 px-2 py-0.5 rounded-md">
                                        -{discount}%
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Product name */}
                        <h2 className="text-lg font-bold text-gray-900 leading-tight mt-2">
                            {product.name}
                        </h2>

                        {/* Unit info */}
                        <p className="text-sm text-gray-400 font-medium mt-1">
                            1 Unidad
                        </p>

                        {/* Description if available */}
                        {product.description && (
                            <p className="text-sm text-gray-500 mt-3 leading-relaxed">
                                {product.description}
                            </p>
                        )}
                    </div>

                    {/* ─── DIVIDER ─── */}
                    <div className="h-2 bg-gray-50" />

                    {/* ─── RELATED PRODUCTS ─── */}
                    {relatedProducts.length > 0 && (
                        <div className="pt-5 pb-4">
                            <h3 className="px-5 text-base font-extrabold text-gray-900 mb-3">
                                Productos relacionados
                            </h3>
                            <div
                                className="flex overflow-x-auto gap-3 px-5 snap-x snap-mandatory"
                                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                            >
                                {relatedProducts.map((item) => {
                                    const itemPrice = Number(item.sellPrice || 0);
                                    return (
                                        <div key={item.id} className="flex-none w-[130px] snap-start">
                                            <div className="bg-gray-50 rounded-2xl relative aspect-square mb-2 flex items-center justify-center overflow-hidden">
                                                {item.imageUrl && item.imageUrl !== "" ? (
                                                    <Image
                                                        src={item.imageUrl}
                                                        alt={item.name}
                                                        fill
                                                        sizes="130px"
                                                        className="object-contain p-2"
                                                    />
                                                ) : (
                                                    <GoWatermark />
                                                )}
                                                <button className="absolute top-2 right-2 w-7 h-7 rounded-full bg-emerald-500 shadow-md flex items-center justify-center text-white active:scale-90 transition-transform">
                                                    <Plus className="w-3.5 h-3.5" strokeWidth={3} />
                                                </button>
                                            </div>
                                            <p className="text-sm font-extrabold text-gray-900 leading-tight">
                                                ${itemPrice.toLocaleString("es-CO")}
                                            </p>
                                            <p className="text-[11px] font-medium text-gray-500 leading-tight line-clamp-2 mt-0.5">
                                                {item.name}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* ─── COMPLEMENTARY PRODUCTS ─── */}
                    {complementaryProducts.length > 0 && (
                        <div className="pt-3 pb-6">
                            <h3 className="px-5 text-base font-extrabold text-gray-900 mb-3">
                                Completa tu pedido 🛒
                            </h3>
                            <div
                                className="flex overflow-x-auto gap-3 px-5 snap-x snap-mandatory"
                                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                            >
                                {complementaryProducts.map((item) => {
                                    const itemPrice = Number(item.sellPrice || 0);
                                    return (
                                        <div key={item.id} className="flex-none w-[130px] snap-start">
                                            <div className="bg-gray-50 rounded-2xl relative aspect-square mb-2 flex items-center justify-center overflow-hidden">
                                                {item.imageUrl && item.imageUrl !== "" ? (
                                                    <Image
                                                        src={item.imageUrl}
                                                        alt={item.name}
                                                        fill
                                                        sizes="130px"
                                                        className="object-contain p-2"
                                                    />
                                                ) : (
                                                    <GoWatermark />
                                                )}
                                                <button className="absolute top-2 right-2 w-7 h-7 rounded-full bg-emerald-500 shadow-md flex items-center justify-center text-white active:scale-90 transition-transform">
                                                    <Plus className="w-3.5 h-3.5" strokeWidth={3} />
                                                </button>
                                            </div>
                                            <p className="text-sm font-extrabold text-gray-900 leading-tight">
                                                ${itemPrice.toLocaleString("es-CO")}
                                            </p>
                                            <p className="text-[11px] font-medium text-gray-500 leading-tight line-clamp-2 mt-0.5">
                                                {item.name}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* ─── STICKY BOTTOM ACTION BAR ─── */}
                <div className="absolute bottom-0 left-0 right-0 bg-white px-4 py-3.5 shadow-[0_-4px_16px_-4px_rgba(0,0,0,0.08)] border-t border-gray-100 flex items-center gap-3 z-30">

                    {/* Quantity Selector */}
                    <div className="flex items-center bg-gray-100 rounded-2xl p-1 h-12">
                        <button
                            className="w-10 h-10 rounded-xl flex items-center justify-center bg-white shadow-sm text-gray-800 active:scale-95 transition-transform disabled:opacity-40"
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            disabled={quantity <= 1}
                        >
                            <Minus className="w-4 h-4" strokeWidth={2.5} />
                        </button>
                        <span className="font-black text-lg w-9 text-center text-gray-900">{quantity}</span>
                        <button
                            className="w-10 h-10 rounded-xl flex items-center justify-center bg-white shadow-sm text-gray-800 active:scale-95 transition-transform"
                            onClick={() => setQuantity(quantity + 1)}
                        >
                            <Plus className="w-4 h-4" strokeWidth={2.5} />
                        </button>
                    </div>

                    {/* Add to Cart Button */}
                    <button
                        className="flex-1 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-lg shadow-emerald-500/30 hover:bg-emerald-600"
                        onClick={() => {
                            onAddToCart?.(product, quantity);
                            handleClose();
                        }}
                    >
                        <ShoppingBag className="w-4.5 h-4.5 text-white" />
                        <span className="text-white font-extrabold text-[15px]">Agregar</span>
                        <span className="text-white/90 font-bold text-xs bg-black/15 px-2 py-0.5 rounded-lg ml-1">
                            {totalPrice}
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
}
