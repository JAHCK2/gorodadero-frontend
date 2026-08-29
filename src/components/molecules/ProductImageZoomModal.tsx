"use client";

import React, { useState, useRef, useEffect } from "react";
import { X, ZoomIn, ZoomOut, RotateCcw, ShoppingCart, Plus, Minus, Check } from "lucide-react";
import { Product } from "@/types/product";
import { formatCOP } from "@/lib/money";
import { useCartStore } from "@/store/cartStore";

interface ProductImageZoomModalProps {
    product: Product;
    onClose: () => void;
}

/** Calculate price per unit (ml or g) if applicable */
function getPricePerUnit(
    price: number,
    unitType?: string | null,
    unitValue?: number | null
): string | null {
    if (!unitType || !unitValue || unitValue <= 0) return null;
    const cleanUnit = unitType.toLowerCase().trim();
    if (cleanUnit === "g" || cleanUnit === "gr" || cleanUnit === "gramos") {
        const perG = price / unitValue;
        return `$${perG.toFixed(1).replace(/\.0$/, "")}/g`;
    }
    if (cleanUnit === "ml" || cleanUnit === "mililitros") {
        const perMl = price / unitValue;
        return `$${perMl.toFixed(1).replace(/\.0$/, "")}/ml`;
    }
    return null;
}

export function ProductImageZoomModal({ product, onClose }: ProductImageZoomModalProps) {
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [qty, setQty] = useState(1);
    const [isAdded, setIsAdded] = useState(false);

    const isDragging = useRef(false);
    const dragStart = useRef({ x: 0, y: 0 });
    const initialPinchDist = useRef<number | null>(null);
    const initialScale = useRef(1);
    const lastTap = useRef<number>(0);

    const unitFormatted = product.unitValue && product.unitType
        ? `${product.unitValue} ${product.unitType}`
        : null;
    const unitPriceStr = getPricePerUnit(product.sellPrice, product.unitType, product.unitValue);
    const totalPrice = Number(product.sellPrice) * qty;

    // Lock body scroll and handle ESC key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleKeyDown);
        document.body.style.overflow = "hidden";

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "";
        };
    }, [onClose]);

    // Handle touch pinch-to-zoom and pan
    const handleTouchStart = (e: React.TouchEvent) => {
        if (e.touches.length === 2) {
            const dist = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
            initialPinchDist.current = dist;
            initialScale.current = scale;
        } else if (e.touches.length === 1) {
            const now = Date.now();
            if (now - lastTap.current < 300) {
                if (scale > 1) {
                    setScale(1);
                    setPosition({ x: 0, y: 0 });
                } else {
                    setScale(2.5);
                }
                lastTap.current = 0;
                return;
            }
            lastTap.current = now;

            if (scale > 1) {
                isDragging.current = true;
                dragStart.current = {
                    x: e.touches[0].clientX - position.x,
                    y: e.touches[0].clientY - position.y
                };
            }
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (e.touches.length === 2 && initialPinchDist.current !== null) {
            const dist = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
            const newScale = Math.min(Math.max(initialScale.current * (dist / initialPinchDist.current), 1), 4);
            setScale(newScale);
            if (newScale === 1) {
                setPosition({ x: 0, y: 0 });
            }
        } else if (e.touches.length === 1 && isDragging.current && scale > 1) {
            setPosition({
                x: e.touches[0].clientX - dragStart.current.x,
                y: e.touches[0].clientY - dragStart.current.y
            });
        }
    };

    const handleTouchEnd = () => {
        initialPinchDist.current = null;
        isDragging.current = false;
        if (scale <= 1) {
            setPosition({ x: 0, y: 0 });
        }
    };

    // Mouse drag for desktop
    const handleMouseDown = (e: React.MouseEvent) => {
        if (scale > 1) {
            isDragging.current = true;
            dragStart.current = {
                x: e.clientX - position.x,
                y: e.clientY - position.y
            };
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging.current && scale > 1) {
            setPosition({
                x: e.clientX - dragStart.current.x,
                y: e.clientY - dragStart.current.y
            });
        }
    };

    const handleMouseUp = () => {
        isDragging.current = false;
    };

    // Desktop Wheel Zoom
    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        const delta = e.deltaY < 0 ? 0.3 : -0.3;
        const newScale = Math.min(Math.max(scale + delta, 1), 4);
        setScale(newScale);
        if (newScale === 1) {
            setPosition({ x: 0, y: 0 });
        }
    };

    const resetZoom = () => {
        setScale(1);
        setPosition({ x: 0, y: 0 });
    };

    const zoomIn = () => setScale((prev) => Math.min(prev + 0.5, 4));
    const zoomOut = () => {
        setScale((prev) => {
            const next = Math.max(prev - 0.5, 1);
            if (next === 1) setPosition({ x: 0, y: 0 });
            return next;
        });
    };

    // Add to Cart Action
    const handleAddToCart = () => {
        const store = useCartStore.getState();
        const existingQty = store.getItemQuantity(product.id);
        
        if (existingQty > 0) {
            store.updateQuantity(product.id, existingQty + qty);
        } else {
            store.addItem(product);
            if (qty > 1) {
                store.updateQuantity(product.id, qty);
            }
        }

        setIsAdded(true);
        setTimeout(() => {
            onClose();
        }, 350);
    };

    return (
        <div 
            className="fixed inset-0 z-[9999] backdrop-blur-3xl saturate-150 flex flex-col items-center justify-between p-3 select-none touch-none animate-in fade-in duration-300"
            style={{
                background: "rgba(255, 255, 255, 0.72)",
                backdropFilter: "blur(32px) saturate(160%)",
                WebkitBackdropFilter: "blur(32px) saturate(160%)"
            }}
            onWheel={handleWheel}
        >
            {/* Soft Ambient Caribbean Halo / Resplandor Acuoso Suave */}
            <div 
                className="absolute inset-0 pointer-events-none z-0"
                style={{
                    background: "radial-gradient(circle at 50% 48%, rgba(255,255,255,0.92) 0%, rgba(94,234,212,0.15) 45%, transparent 70%)"
                }}
            />

            {/* ── Top Bar: Título del Producto + Especificaciones ── */}
            <div className="w-full max-w-md z-50 pt-1">
                <div className="bg-white/85 backdrop-blur-2xl border border-white/80 rounded-2xl p-3 shadow-[0_4px_20px_rgba(0,0,0,0.06)] flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                        {/* Badges row: Marca, Peso/Volumen, Precio/Unidad, Zoom Badge */}
                        <div className="flex flex-wrap items-center gap-1.5 mb-1">
                            {product.brand && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-black/10 text-gray-900 border border-black/5">
                                    {product.brand}
                                </span>
                            )}
                            {unitFormatted && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-900 border border-blue-500/15">
                                    {unitFormatted}
                                </span>
                            )}
                            {unitPriceStr && (
                                <span className="text-[10px] font-medium text-gray-500">
                                    {unitPriceStr}
                                </span>
                            )}
                            {scale > 1 && (
                                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-600/15 text-emerald-800 border border-emerald-600/30 ml-auto">
                                    {scale.toFixed(1)}x
                                </span>
                            )}
                        </div>

                        {/* Título Principal */}
                        <h2 className="text-sm font-black text-gray-950 leading-snug line-clamp-2">
                            {product.name}
                        </h2>

                        {/* Categoría / Subtítulo */}
                        <p className="text-[11px] font-medium text-gray-600 mt-0.5 truncate">
                            {product.categoryName || product.category?.name || "GoRodadero"}
                        </p>
                    </div>

                    {/* Botón Cerrar */}
                    <button 
                        onClick={onClose}
                        className="w-9 h-9 rounded-full bg-black/10 hover:bg-black/20 active:scale-95 flex items-center justify-center text-gray-900 backdrop-blur-xl border border-black/10 shadow-sm transition-all flex-shrink-0"
                        aria-label="Cerrar vista previa"
                    >
                        <X className="w-5 h-5" strokeWidth={2.5} />
                    </button>
                </div>
            </div>

            {/* ── Centro: Interactive Image Viewport ── */}
            <div 
                className="relative flex-1 w-full flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing z-10 my-1"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onDoubleClick={() => (scale > 1 ? resetZoom() : setScale(2.5))}
            >
                <div 
                    style={{
                        transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                        transition: isDragging.current ? "none" : "transform 0.15s ease-out"
                    }}
                    className="w-full h-full flex items-center justify-center p-2"
                >
                    <img 
                        src={product.imageUrl || ""} 
                        alt={product.name}
                        className="max-w-[88vw] max-h-[50vh] object-contain drop-shadow-[0_14px_35px_rgba(0,0,0,0.18)] pointer-events-none"
                        draggable={false}
                    />
                </div>
            </div>

            {/* ── Parte Inferior: Barra de Zoom + Selector de Cantidad & CTA Agregar al Carrito ── */}
            <div className="w-full max-w-md flex flex-col items-center gap-2 pb-1 z-50">
                
                {/* Floating Zoom & Helper Pill */}
                <div className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl bg-white/75 backdrop-blur-xl border border-white/80 shadow-sm">
                    <span className="text-[11px] font-bold text-gray-600">
                        {scale > 1 ? `Ampliación ${scale.toFixed(1)}x` : "Pellizca para zoom"}
                    </span>

                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/5 border border-black/10">
                        <button 
                            onClick={zoomOut} 
                            disabled={scale <= 1}
                            className="p-1 rounded-full text-gray-900 hover:text-black disabled:opacity-30 active:scale-90 transition-all"
                            aria-label="Reducir zoom"
                        >
                            <ZoomOut className="w-3.5 h-3.5" />
                        </button>

                        <button 
                            onClick={resetZoom}
                            disabled={scale === 1}
                            className="px-2 py-0.5 rounded-full text-[10px] font-black text-gray-900 hover:text-black disabled:opacity-30 active:scale-90 transition-all flex items-center gap-0.5 bg-white/80 border border-black/10"
                        >
                            <RotateCcw className="w-2.5 h-2.5" />
                            <span>1x</span>
                        </button>

                        <button 
                            onClick={zoomIn} 
                            disabled={scale >= 4}
                            className="p-1 rounded-full text-gray-900 hover:text-black disabled:opacity-30 active:scale-90 transition-all"
                            aria-label="Aumentar zoom"
                        >
                            <ZoomIn className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>

                {/* Main Purchase Card: Quantity Selector + Agregar Button */}
                <div className="w-full bg-white/90 backdrop-blur-2xl border border-white/90 rounded-2xl p-2.5 shadow-[0_6px_25px_rgba(0,0,0,0.1)] flex items-center gap-3">
                    
                    {/* Quantity Selector [-] [qty] [+] */}
                    <div className="flex items-center bg-gray-100/90 rounded-2xl p-1 border border-black/5 shadow-inner">
                        <button
                            onClick={() => setQty((q) => Math.max(1, q - 1))}
                            disabled={qty <= 1}
                            className="w-9 h-9 rounded-xl bg-white text-gray-700 flex items-center justify-center font-black shadow-sm disabled:opacity-40 active:scale-90 transition-all"
                            aria-label="Disminuir cantidad"
                        >
                            <Minus className="w-4 h-4" strokeWidth={3} />
                        </button>
                        
                        <span className="text-base font-black text-gray-950 w-8 text-center tabular-nums">
                            {qty}
                        </span>

                        <button
                            onClick={() => setQty((q) => q + 1)}
                            className="w-9 h-9 rounded-xl bg-[#F97316] text-white flex items-center justify-center font-black shadow-sm active:scale-90 transition-all"
                            aria-label="Aumentar cantidad"
                        >
                            <Plus className="w-4 h-4" strokeWidth={3} />
                        </button>
                    </div>

                    {/* CTA Button: Agregar al Carrito con Precio Total */}
                    <button
                        onClick={handleAddToCart}
                        className={`flex-1 h-12 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg active:scale-[0.97] transition-all ${
                            isAdded
                                ? "bg-emerald-600 text-white shadow-emerald-500/25"
                                : "bg-[#F97316] hover:bg-orange-600 text-white shadow-orange-500/25"
                        }`}
                    >
                        {isAdded ? (
                            <>
                                <Check className="w-5 h-5" strokeWidth={3} />
                                <span>¡Agregado!</span>
                            </>
                        ) : (
                            <>
                                <ShoppingCart className="w-5 h-5" />
                                <span>Agregar {formatCOP(totalPrice)}</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
