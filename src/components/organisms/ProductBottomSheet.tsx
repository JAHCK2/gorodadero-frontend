// ═══════════════════════════════════════════════════════════
// Organism: ProductBottomSheet — Product detail panel
// Hero image, badge, price-per-unit, quantity +/- and CTA
// With suggested/related & complementary products carousel
// Bundled checkout logic (sums up main and recommended items)
// ═══════════════════════════════════════════════════════════
"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import { ZoomIn } from "lucide-react";
import { ProductBadge, ProductPrice, GoLogo } from "@/components/atoms";
import { ProductImageZoomModal } from "@/components/molecules";
import { formatCOP } from "@/lib/money";
import { Product } from "@/types/product";
import { useCartStore } from "@/store/cartStore";

interface ProductBottomSheetProps {
    product: Product | null;
    onClose: () => void;
    /** Called when user taps "Agregar" CTA */
    onAdd?: (product: Product, quantity: number) => void;
    allProducts?: Product[];
    onSelectProduct?: (product: Product) => void;
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
    allProducts = [],
    onSelectProduct,
}: ProductBottomSheetProps) {
    const [qty, setQty] = useState(1);
    const [isVisible, setIsVisible] = useState(false);
    const [isZoomOpen, setIsZoomOpen] = useState(false);
    const [recommendedQty, setRecommendedQty] = useState<Record<string, number>>({});
    const scrollRef = useRef<HTMLDivElement>(null);

    // Keep onClose in a ref to prevent dependency loops when parent passes inline function
    const onCloseRef = useRef(onClose);
    useEffect(() => {
        onCloseRef.current = onClose;
    }, [onClose]);

    const lastProductIdRef = useRef<string | null>(null);

    useEffect(() => {
        if (product) {
            // Prevent duplicate initialization on same product re-renders
            if (lastProductIdRef.current !== product.id) {
                lastProductIdRef.current = product.id;
                setQty(1); // Reset quantity upon opening
                setRecommendedQty({}); // Reset recommended quantities upon opening
                if (scrollRef.current) {
                    scrollRef.current.scrollTop = 0; // Scroll back to top
                }
            }

            setIsVisible(true);
            
            // Push history state to intercept Android Back button and Escape
            window.history.pushState({ productSheetOpen: true }, "");
            
            const handlePopState = () => {
                onCloseRef.current();
            };
            
            const handleKeyDown = (e: KeyboardEvent) => {
                if (e.key === 'Escape') {
                    window.history.back();
                }
            };

            window.addEventListener("popstate", handlePopState);
            window.addEventListener("keydown", handleKeyDown);
            
            return () => {
                window.removeEventListener("popstate", handlePopState);
                window.removeEventListener("keydown", handleKeyDown);
            };
        } else {
            setIsVisible(false);
            lastProductIdRef.current = null;
        }
    }, [product?.id]);

    const handleBackdrop = useCallback(
        (e: React.MouseEvent) => {
            if (e.target === e.currentTarget) {
                window.history.back();
            }
        },
        [],
    );

    // ── Related Products Query ──
    const relatedProducts = useMemo(() => {
        if (!allProducts || !product) return [];
        return allProducts
            .filter(p => p.categoryId === product.categoryId && p.id !== product.id)
            .slice(0, 6);
    }, [allProducts, product?.id, product?.categoryId]);

    // ── Complementary Products Query ──
    const complementaryProducts = useMemo(() => {
        if (!allProducts || !product) return [];
        return allProducts
            .filter(p => p.categoryId !== product.categoryId)
            .sort(() => 0.5 - Math.random())
            .slice(0, 5);
    }, [allProducts, product?.id, product?.categoryId]);

    // Helper functions for recommended items selectors
    const increaseRecommended = useCallback((id: string) => {
        setRecommendedQty(prev => ({
            ...prev,
            [id]: (prev[id] || 0) + 1
        }));
    }, []);

    const decreaseRecommended = useCallback((id: string) => {
        setRecommendedQty(prev => {
            const current = prev[id] || 0;
            if (current <= 1) {
                const next = { ...prev };
                delete next[id];
                return next;
            }
            return {
                ...prev,
                [id]: current - 1
            };
        });
    }, []);

    const recommendedPriceSum = useMemo(() => {
        let sum = 0;
        relatedProducts.forEach(item => {
            const q = recommendedQty[item.id] || 0;
            sum += Number(item.sellPrice) * q;
        });
        complementaryProducts.forEach(item => {
            const q = recommendedQty[item.id] || 0;
            sum += Number(item.sellPrice) * q;
        });
        return sum;
    }, [recommendedQty, relatedProducts, complementaryProducts]);

    if (!product) return null;

    const perUnit = pricePerUnit(
        Number(product.sellPrice),
        product.unitType,
        product.unitValue,
    );

    // Price Calculations
    const mainProductPrice = Number(product.sellPrice) * qty;
    const totalBundlePrice = mainProductPrice + recommendedPriceSum;

    return (
        <div
            className={`fixed inset-0 z-[100] flex items-end justify-center transition-colors duration-300 ${isVisible ? 'bg-black/15' : 'bg-transparent pointer-events-none'}`}
            onClick={handleBackdrop}
        >
            {/* ── Panel ── */}
            <div
                className={`relative w-full max-w-md bg-white/70 backdrop-blur-3xl saturate-150 rounded-t-3xl shadow-[0_-8px_40px_rgba(0,0,0,0.15)] flex flex-col transition-transform duration-300 transform ${isVisible ? 'translate-y-0' : 'translate-y-full'}`}
                style={{
                    maxHeight: '90vh',
                    borderTop: "1px solid rgba(255,255,255,0.6)"
                }}
            >
                {/* Drag handle */}
                <div className="flex justify-center pt-3 pb-1" onClick={() => window.history.back()}>
                    <div className="w-10 h-1 rounded-full bg-gray-300 cursor-pointer hover:bg-gray-400" />
                </div>

                <div 
                    ref={scrollRef}
                    className="overflow-y-auto no-scrollbar flex-1 pb-24"
                >
                    {/* ── Hero image (Transparent Media V2 Glassmorphism) ── */}
                    <div className="flex items-center justify-center px-6 py-2">
                        <div 
                            onClick={() => product.imageUrl && setIsZoomOpen(true)}
                            className={`product-image-stage relative w-[260px] h-[260px] ${product.imageUrl ? 'cursor-zoom-in active:scale-[0.98] transition-transform' : ''}`}
                        >
                            {product.imageUrl ? (
                                <>
                                    <img
                                        src={product.imageUrl}
                                        alt={product.name}
                                        loading="lazy"
                                        decoding="async"
                                        className="w-full h-full object-contain"
                                    />
                                    <div className="absolute bottom-2 right-2 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold flex items-center gap-1.5 shadow-md">
                                        <ZoomIn className="w-3 h-3 text-[#5eead4]" />
                                        <span>Ampliar</span>
                                    </div>
                                </>
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center opacity-15">
                                    <GoLogo className="w-24 h-auto grayscale" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── Product info ── */}
                    <div className="px-5 pb-5">
                        {/* Marca + Barcode Badge Row */}
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                            {product.brand ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-black/10 text-gray-800 backdrop-blur-sm border border-black/5">
                                    {product.brand}
                                </span>
                            ) : (
                                <span />
                            )}
                            {product.barcode && (
                                <span className="text-[10px] font-mono text-gray-500 tracking-tight">
                                    EAN: {product.barcode}
                                </span>
                            )}
                        </div>

                        {/* Badge + Price/unit row */}
                        <div className="flex items-center gap-2 mb-2">
                            <ProductBadge
                                unitType={product.unitType}
                                unitValue={product.unitValue}
                                size="md"
                            />
                            {perUnit && (
                                <span className="text-[11px] text-gray-500 font-bold">
                                    {perUnit}
                                </span>
                            )}
                        </div>

                        {/* Name */}
                        <h2 className="text-[20px] font-bold text-gray-900 leading-tight">
                            {product.name}
                        </h2>

                        {/* Category hint */}
                        <p className="text-[12px] text-gray-500 font-medium mt-0.5">
                            {product.subcategoryName || product.categoryName || product.category?.name || "Supermercado"} · GoRodadero
                        </p>

                        {/* Price */}
                        <div className="mt-2">
                            <ProductPrice amount={Number(product.sellPrice)} size="lg" />
                        </div>

                        {/* Description */}
                        {product.description && (
                            <p className="text-sm text-gray-600 mt-3 leading-relaxed">
                                {product.description}
                            </p>
                        )}
                    </div>

                    {/* Divider */}
                    {(relatedProducts.length > 0 || complementaryProducts.length > 0) && (
                        <div className="h-2 bg-gray-100/50 backdrop-blur-sm border-y border-gray-200/20" />
                    )}

                    {/* ── Related Products Carousel ── */}
                    {relatedProducts.length > 0 && (
                        <div className="pt-5 pb-4">
                            <h3 className="px-5 text-sm font-extrabold text-gray-900 mb-3 tracking-tight">
                                Productos relacionados
                            </h3>
                            <div
                                className="flex overflow-x-auto gap-3 px-5 snap-x snap-mandatory no-scrollbar"
                                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                            >
                                {relatedProducts.map((item) => {
                                    const recQty = recommendedQty[item.id] || 0;
                                    
                                    return (
                                        <div 
                                            key={item.id} 
                                            className="flex-none w-[125px] snap-start cursor-pointer active:scale-95 transition-transform"
                                            onClick={() => onSelectProduct?.(item)}
                                        >
                                            <div className="product-image-stage rounded-2xl relative aspect-square mb-2 overflow-hidden border border-white/30 bg-white/20 backdrop-blur-md">
                                                {item.imageUrl ? (
                                                    <img
                                                        src={item.imageUrl}
                                                        alt={item.name}
                                                        loading="lazy"
                                                        decoding="async"
                                                        className="w-full h-full object-contain p-2"
                                                    />
                                                ) : (
                                                    <div className="absolute inset-0 flex items-center justify-center opacity-15">
                                                        <GoLogo className="w-12 h-auto grayscale" />
                                                    </div>
                                                )}
                                                
                                                {/* Mini selector for recommended card */}
                                                {recQty > 0 ? (
                                                    <div 
                                                        className="absolute bottom-2 right-2 bg-emerald-500 border border-emerald-600 text-white rounded-lg flex items-center h-7 px-1.5 gap-2 shadow-sm select-none z-10"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <button 
                                                            onClick={() => decreaseRecommended(item.id)} 
                                                            className="w-4 h-full flex items-center justify-center font-black text-[13px] active:scale-75 transition-transform"
                                                        >
                                                            −
                                                        </button>
                                                        <span className="text-[11px] font-black">{recQty}</span>
                                                        <button 
                                                            onClick={() => increaseRecommended(item.id)} 
                                                            className="w-4 h-full flex items-center justify-center font-black text-[13px] active:scale-75 transition-transform"
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={(e) => {
                                                             e.stopPropagation();
                                                             increaseRecommended(item.id);
                                                        }}
                                                        className="absolute bottom-2 right-2 w-7 h-7 rounded-lg flex items-center justify-center shadow-sm border bg-white/80 backdrop-blur-sm border-gray-200/60 text-gray-800 hover:bg-white active:scale-90 transition-transform z-10"
                                                    >
                                                        <svg className="w-4 h-4 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                            <line x1="12" y1="5" x2="12" y2="19" />
                                                            <line x1="5" y1="12" x2="19" y2="12" />
                                                        </svg>
                                                    </button>
                                                )}
                                            </div>
                                            <p className="text-xs font-black text-[#F97316] leading-tight">
                                                {formatCOP(Number(item.sellPrice))}
                                            </p>
                                            <p className="text-[10px] font-bold text-gray-700 leading-snug line-clamp-2 mt-0.5">
                                                {item.name}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* ── Complementary Products Carousel ── */}
                    {complementaryProducts.length > 0 && (
                        <div className="pt-3 pb-6">
                            <h3 className="px-5 text-sm font-extrabold text-gray-900 mb-3 tracking-tight">
                                Completa tu pedido 🛒
                            </h3>
                            <div
                                className="flex overflow-x-auto gap-3 px-5 snap-x snap-mandatory no-scrollbar"
                                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                            >
                                {complementaryProducts.map((item) => {
                                    const recQty = recommendedQty[item.id] || 0;
                                    
                                    return (
                                        <div 
                                            key={item.id} 
                                            className="flex-none w-[125px] snap-start cursor-pointer active:scale-95 transition-transform"
                                            onClick={() => onSelectProduct?.(item)}
                                        >
                                            <div className="product-image-stage rounded-2xl relative aspect-square mb-2 overflow-hidden border border-white/30 bg-white/20 backdrop-blur-md">
                                                {item.imageUrl ? (
                                                    <img
                                                        src={item.imageUrl}
                                                        alt={item.name}
                                                        loading="lazy"
                                                        decoding="async"
                                                        className="w-full h-full object-contain p-2"
                                                    />
                                                ) : (
                                                    <div className="absolute inset-0 flex items-center justify-center opacity-15">
                                                        <GoLogo className="w-12 h-auto grayscale" />
                                                    </div>
                                                )}
                                                
                                                {/* Mini selector for recommended card */}
                                                {recQty > 0 ? (
                                                    <div 
                                                        className="absolute bottom-2 right-2 bg-emerald-500 border border-emerald-600 text-white rounded-lg flex items-center h-7 px-1.5 gap-2 shadow-sm select-none z-10"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <button 
                                                            onClick={() => decreaseRecommended(item.id)} 
                                                            className="w-4 h-full flex items-center justify-center font-black text-[13px] active:scale-75 transition-transform"
                                                        >
                                                            −
                                                        </button>
                                                        <span className="text-[11px] font-black">{recQty}</span>
                                                        <button 
                                                            onClick={() => increaseRecommended(item.id)} 
                                                            className="w-4 h-full flex items-center justify-center font-black text-[13px] active:scale-75 transition-transform"
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            increaseRecommended(item.id);
                                                        }}
                                                        className="absolute bottom-2 right-2 w-7 h-7 rounded-lg flex items-center justify-center shadow-sm border bg-white/80 backdrop-blur-sm border-gray-200/60 text-gray-800 hover:bg-white active:scale-90 transition-transform z-10"
                                                    >
                                                        <svg className="w-4 h-4 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                            <line x1="12" y1="5" x2="12" y2="19" />
                                                            <line x1="5" y1="12" x2="19" y2="12" />
                                                        </svg>
                                                    </button>
                                                )}
                                            </div>
                                            <p className="text-xs font-black text-[#F97316] leading-tight">
                                                {formatCOP(Number(item.sellPrice))}
                                            </p>
                                            <p className="text-[10px] font-bold text-gray-700 leading-snug line-clamp-2 mt-0.5">
                                                {item.name}
                                            </p>
                                        </div>

                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Purchase zone ── */}
                <div className="px-5 py-4 border-t border-white/50 mt-auto bg-white/40 backdrop-blur-md rounded-t-3xl z-10">
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

                        {/* CTA button (Bundled checkout sum) */}
                        <button
                            onClick={() => {
                                // Add main product to store
                                const store = useCartStore.getState();
                                const mainExisting = store.getItemQuantity(product.id);
                                if (mainExisting > 0) {
                                    store.updateQuantity(product.id, mainExisting + qty);
                                } else {
                                    store.addItem(product);
                                    if (qty > 1) {
                                        store.updateQuantity(product.id, qty);
                                    }
                                }

                                // Add recommended items to store
                                Object.entries(recommendedQty).forEach(([itemId, itemQty]) => {
                                    if (itemQty > 0) {
                                        const recommendedItem = allProducts.find(p => p.id === itemId);
                                        if (recommendedItem) {
                                            const recExisting = store.getItemQuantity(itemId);
                                            if (recExisting > 0) {
                                                store.updateQuantity(itemId, recExisting + itemQty);
                                            } else {
                                                store.addItem(recommendedItem);
                                                if (itemQty > 1) {
                                                    store.updateQuantity(itemId, itemQty);
                                                }
                                            }
                                        }
                                    }
                                });

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
                            Agregar {formatCOP(totalBundlePrice)}
                        </button>
                    </div>
                </div>
            </div>

            {/* Lightbox / Pinch-to-zoom Modal */}
            {isZoomOpen && product.imageUrl && (
                <ProductImageZoomModal 
                    imageUrl={product.imageUrl}
                    altText={product.name}
                    onClose={() => setIsZoomOpen(false)}
                />
            )}
        </div>
    );
}
