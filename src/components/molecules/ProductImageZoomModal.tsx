"use client";

import React, { useState, useRef, useEffect } from "react";
import { X, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { Product } from "@/types/product";
import { formatCOP } from "@/lib/money";

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
    const isDragging = useRef(false);
    const dragStart = useRef({ x: 0, y: 0 });
    const initialPinchDist = useRef<number | null>(null);
    const initialScale = useRef(1);
    const lastTap = useRef<number>(0);

    const unitFormatted = product.unitValue && product.unitType
        ? `${product.unitValue} ${product.unitType}`
        : null;
    const unitPriceStr = getPricePerUnit(product.sellPrice, product.unitType, product.unitValue);

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
                    background: "radial-gradient(circle at 50% 48%, rgba(255,255,255,0.9) 0%, rgba(94,234,212,0.14) 45%, transparent 70%)"
                }}
            />

            {/* ── Top Bar: Título del Producto + Especificaciones ── */}
            <div className="w-full max-w-md z-50 pt-1">
                <div className="bg-white/80 backdrop-blur-2xl border border-white/80 rounded-2xl p-3 shadow-[0_4px_20px_rgba(0,0,0,0.06)] flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                        {/* Badges row: Marca, Peso/Volumen, Precio/Unidad, EAN */}
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
                className="relative flex-1 w-full flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing z-10 my-2"
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
                        className="max-w-[88vw] max-h-[55vh] object-contain drop-shadow-[0_14px_35px_rgba(0,0,0,0.18)] pointer-events-none"
                        draggable={false}
                    />
                </div>
            </div>

            {/* ── Parte Inferior: Precio Destacado + Barra de Controles de Zoom ── */}
            <div className="w-full max-w-md flex flex-col items-center gap-2 pb-2 z-50">
                <div className="w-full bg-white/85 backdrop-blur-2xl border border-white/80 rounded-2xl p-3 shadow-[0_6px_25px_rgba(0,0,0,0.08)] flex items-center justify-between gap-3">
                    {/* Precio Destacado en Grande */}
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-wider text-gray-500">
                            Precio
                        </span>
                        <span className="text-2xl font-black text-[#EA580C] tracking-tight leading-none">
                            {formatCOP(product.sellPrice)}
                        </span>
                    </div>

                    {/* Controles de Zoom */}
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/5 border border-black/10">
                        <button 
                            onClick={zoomOut} 
                            disabled={scale <= 1}
                            className="p-1 rounded-full text-gray-900 hover:text-black disabled:opacity-30 active:scale-90 transition-all"
                            aria-label="Reducir zoom"
                        >
                            <ZoomOut className="w-4 h-4" />
                        </button>

                        <button 
                            onClick={resetZoom}
                            disabled={scale === 1}
                            className="px-2.5 py-0.5 rounded-full text-xs font-black text-gray-900 hover:text-black disabled:opacity-30 active:scale-90 transition-all flex items-center gap-1 bg-white/60 border border-black/10"
                        >
                            <RotateCcw className="w-3 h-3" />
                            <span>1x</span>
                        </button>

                        <button 
                            onClick={zoomIn} 
                            disabled={scale >= 4}
                            className="p-1 rounded-full text-gray-900 hover:text-black disabled:opacity-30 active:scale-90 transition-all"
                            aria-label="Aumentar zoom"
                        >
                            <ZoomIn className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <p className="text-[11px] font-bold text-gray-700 tracking-wide text-center">
                    Pellizca con dos dedos o toca dos veces para ampliar
                </p>
            </div>
        </div>
    );
}
