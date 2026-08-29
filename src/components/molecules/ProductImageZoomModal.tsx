"use client";

import React, { useState, useRef, useEffect } from "react";
import { X, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

interface ProductImageZoomModalProps {
    imageUrl: string;
    altText: string;
    onClose: () => void;
}

export function ProductImageZoomModal({ imageUrl, altText, onClose }: ProductImageZoomModalProps) {
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const isDragging = useRef(false);
    const dragStart = useRef({ x: 0, y: 0 });
    const initialPinchDist = useRef<number | null>(null);
    const initialScale = useRef(1);
    const lastTap = useRef<number>(0);

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
            // Double tap to zoom
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
            className="fixed inset-0 z-[9999] bg-[#0c1926]/75 backdrop-blur-3xl flex flex-col items-center justify-between p-4 select-none touch-none animate-in fade-in duration-300"
            onWheel={handleWheel}
        >
            {/* Ambient Lighting / Showcase Radial Backlight */}
            <div 
                className="absolute inset-0 pointer-events-none z-0"
                style={{
                    background: "radial-gradient(circle at 50% 48%, rgba(255,255,255,0.14) 0%, rgba(94,234,212,0.06) 40%, transparent 70%)"
                }}
            />

            {/* Top Bar */}
            <div className="w-full flex items-center justify-between text-white z-50 pt-2 px-2">
                <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-xl border border-white/20 shadow-lg">
                    <span className="text-xs font-bold text-white max-w-[200px] truncate drop-shadow-sm">
                        {altText}
                    </span>
                    {scale > 1 && (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#5eead4]/25 text-[#5eead4] border border-[#5eead4]/40">
                            {scale.toFixed(1)}x
                        </span>
                    )}
                </div>

                <button 
                    onClick={onClose}
                    className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 active:scale-95 flex items-center justify-center text-white backdrop-blur-xl border border-white/30 shadow-xl transition-all"
                    aria-label="Cerrar vista previa"
                >
                    <X className="w-5 h-5" strokeWidth={2.5} />
                </button>
            </div>

            {/* Interactive Image Viewport with Vitrina Glow */}
            <div 
                className="relative flex-1 w-full flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing z-10"
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
                    className="w-full h-full flex items-center justify-center p-4"
                >
                    <img 
                        src={imageUrl} 
                        alt={altText}
                        className="max-w-[88vw] max-h-[65vh] object-contain drop-shadow-[0_16px_40px_rgba(0,0,0,0.35)] pointer-events-none"
                        draggable={false}
                    />
                </div>
            </div>

            {/* Bottom Controls */}
            <div className="w-full flex flex-col items-center gap-2 pb-4 z-50">
                <div 
                    className="flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/20 backdrop-blur-2xl border border-white/30 shadow-[0_8px_32px_rgba(0,0,0,0.25)]"
                >
                    <button 
                        onClick={zoomOut} 
                        disabled={scale <= 1}
                        className="p-1.5 rounded-full text-white hover:text-white/80 disabled:opacity-30 active:scale-90 transition-all"
                        aria-label="Reducir zoom"
                    >
                        <ZoomOut className="w-5 h-5" />
                    </button>

                    <button 
                        onClick={resetZoom}
                        disabled={scale === 1}
                        className="px-3 py-1 rounded-full text-xs font-bold text-white/90 hover:text-white disabled:opacity-30 active:scale-90 transition-all flex items-center gap-1 bg-white/10"
                    >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>1x</span>
                    </button>

                    <button 
                        onClick={zoomIn} 
                        disabled={scale >= 4}
                        className="p-1.5 rounded-full text-white hover:text-white/80 disabled:opacity-30 active:scale-90 transition-all"
                        aria-label="Aumentar zoom"
                    >
                        <ZoomIn className="w-5 h-5" />
                    </button>
                </div>

                <p className="text-[11px] font-semibold text-white/70 tracking-wide text-center drop-shadow-sm">
                    Pellizca con dos dedos o toca dos veces para ampliar
                </p>
            </div>
        </div>
    );
}
