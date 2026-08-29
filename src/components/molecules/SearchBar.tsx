"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Search, Truck, X, ArrowLeft, Check, Clock } from "lucide-react";
import Image from "next/image";
import { createPortal } from "react-dom";
import { useCartStore } from "@/store/cartStore";
import { AddButton } from "@/components/atoms/AddButton";
import { useRouter } from "next/navigation";
import { CartSummaryBar } from "./CartSummaryBar";

/* ════════════════════════════════════════════════════════════════════════════
   SearchBar — Full-Screen Glassmorphism Search Overlay
   ════════════════════════════════════════════════════════════════════════════

   COMPORTAMIENTO:
   - Estado INACTIVO: Barra glassmorphism integrada en el flujo (sticky).
   - Estado ACTIVO: Overlay full-screen con fondo frosted. La barra se
     eleva al top con CSS transition 300ms. Resultados llenan toda la
     pantalla debajo — el teclado del móvil ya no tapa nada.
   - Botón "Atrás" de Android cierra el overlay via History API.

   ══════════════════════════════════════════════════════════════════════════ */

import { smartSearch, SearchProduct } from "@/lib/searchEngine";
import { usePurchaseHistory } from "@/hooks/usePurchaseHistory";

interface SearchBarProps {
    products?: SearchProduct[];
    onActiveChange?: (active: boolean) => void;
    /** When true, renders as a small icon button instead of the full inline bar */
    compact?: boolean;
    /** Defines the color of the compact icon. "light" = white, "dark" = dark gray */
    compactTheme?: "light" | "dark";
    onProductSelect?: (product: SearchProduct) => void;
}

/* ═════════════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL
   ═════════════════════════════════════════════════════════════ */

export function SearchBar({ products = [], onActiveChange, compact = false, compactTheme = "light", onProductSelect }: SearchBarProps) {
    const router = useRouter();
    const [query, setQuery] = useState("");
    const [isActive, setIsActive] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
    const inputRef = useRef<HTMLInputElement>(null);
    const addItem = useCartStore((s) => s.addItem);
    const cartItems = useCartStore((s) => s.items);
    const { getRecentProducts } = usePurchaseHistory();

    const handleDirectAdd = useCallback((product: SearchProduct) => {
        addItem(product as any);
        setAddedIds(prev => new Set(prev).add(product.id));
        setTimeout(() => {
            setAddedIds(prev => {
                const next = new Set(prev);
                next.delete(product.id);
                return next;
            });
        }, 1000);
    }, [addItem]);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const results = useMemo(() => smartSearch(products, query), [products, query]);

    /* ── HISTORY API — Botón "Atrás" de Android ── */
    useEffect(() => {
        if (!isActive) return;
        window.history.pushState({ searchOpen: true }, "");
        const handlePopState = () => closeSearch();
        window.addEventListener("popstate", handlePopState);
        return () => window.removeEventListener("popstate", handlePopState);
    }, [isActive]);

    /* ── Lock body scroll when overlay is open ── */
    useEffect(() => {
        if (isActive) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => { document.body.style.overflow = ""; };
    }, [isActive]);

    const closeSearch = useCallback(() => {
        setIsActive(false);
        setQuery("");
        inputRef.current?.blur();
        onActiveChange?.(false);
    }, [onActiveChange]);

    const handleFocus = useCallback(() => {
        setIsActive(true);
        onActiveChange?.(true);
    }, [onActiveChange]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            (e.target as HTMLElement).blur();
        }
    }, []);

    const handleBackClick = useCallback(() => {
        if (isActive) window.history.back();
        else closeSearch();
    }, [isActive, closeSearch]);

    /* ═══════════════════════════════════════════════════════════
       RENDER
       ═══════════════════════════════════════════════════════════ */
    return (
        <>
            {/* ───────────────────────────────────────────
                FULL-SCREEN OVERLAY (only when active) USING PORTALS
                ─────────────────────────────────────────── */}
            {isActive && isMounted && createPortal(
                <div className="fixed inset-0 z-[100] flex flex-col animate-fadeIn">
                    {/* Frosted glass background - highly translucent */}
                    <div className="absolute inset-0 bg-[#0f172a]/40 backdrop-blur-lg" />

                    {/* ── Top search bar ── */}
                    <div
                        className="relative z-10 px-4 flex items-center gap-2 animate-slideDown"
                        style={{ paddingTop: "max(12px, env(safe-area-inset-top))", paddingBottom: "10px" }}
                    >
                        {/* Back arrow */}
                        <button
                            onClick={handleBackClick}
                            className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-white/10 active:scale-90 transition-transform"
                            aria-label="Cerrar búsqueda"
                        >
                            <ArrowLeft className="w-5 h-5 text-white" />
                        </button>

                        {/* Search pill (glassmorphism) */}
                        <div className="flex-1 relative flex items-center h-[50px] rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 shadow-[0_4px_24px_rgba(0,0,0,0.15)]">
                            <div className="absolute left-3.5 flex items-center justify-center w-8 h-8 rounded-xl bg-white/15">
                                <Search className="w-4 h-4 text-white/80" />
                            </div>
                            <input
                                ref={inputRef}
                                type="text"
                                inputMode="search"
                                enterKeyHint="search"
                                autoComplete="off"
                                autoCorrect="off"
                                spellCheck={false}
                                autoFocus
                                placeholder="¿Qué necesitas hoy?"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="w-full h-full pl-14 pr-12 bg-transparent text-sm font-bold text-white placeholder:text-white/50 outline-none rounded-2xl"
                            />
                            {query && (
                                <button
                                    onMouseDown={(e) => { e.preventDefault(); setQuery(""); inputRef.current?.focus(); }}
                                    className="absolute right-3.5 flex items-center justify-center w-7 h-7 rounded-full bg-white/20 active:scale-90 transition-transform"
                                    aria-label="Limpiar"
                                >
                                    <X className="w-3.5 h-3.5 text-white" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* ── Results list (full remaining height) ── */}
                    <div
                        className="relative z-10 flex-1 overflow-y-auto overscroll-contain touch-pan-y px-4 pb-32"
                        style={{ scrollbarWidth: "thin", WebkitOverflowScrolling: "touch" }}
                        onTouchMove={() => {
                            // "Keyboard Dismiss on Drag" - Native App UX
                            if (document.activeElement === inputRef.current) {
                                inputRef.current?.blur();
                            }
                        }}
                    >
                        {query.trim().length > 0 ? (
                            results.length > 0 ? (
                                <div className="rounded-2xl overflow-hidden bg-white/[0.07] border border-white/10 backdrop-blur-xl">
                                    {results.map((product) => {
                                        const quantityInCart = cartItems.find((item) => item.product.id === product.id)?.quantity || 0;
                                        return (
                                            <div
                                                key={product.id}
                                                className="flex items-center gap-3 w-full px-4 py-3.5 border-b border-white/5 last:border-b-0 hover:bg-white/[0.04] transition-colors"
                                            >
                                                {/* Botón principal de selección del producto para abrir la ficha */}
                                                <button
                                                    type="button"
                                                    className="flex items-center gap-3 flex-1 min-w-0 text-left cursor-pointer group active:opacity-75 transition-opacity bg-transparent border-0 p-0 outline-none"
                                                    onClick={() => {
                                                        if (typeof window !== "undefined" && window.history.state?.searchOpen) {
                                                            window.history.replaceState(null, "");
                                                        }
                                                        closeSearch();
                                                        if (onProductSelect) {
                                                            onProductSelect(product);
                                                        } else {
                                                            addItem(product as any);
                                                        }
                                                    }}
                                                >
                                                    {/* Product thumbnail */}
                                                    <div className="product-image-stage flex-shrink-0 w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center overflow-hidden">
                                                        {product.imageUrl ? (
                                                            <img
                                                                src={product.imageUrl}
                                                                alt=""
                                                                loading="lazy"
                                                                decoding="async"
                                                                className="w-full h-full object-contain p-1"
                                                            />
                                                        ) : (
                                                            <Search className="w-4 h-4 text-white/30" />
                                                        )}
                                                    </div>

                                                    {/* Product info */}
                                                    <div className="flex-1 min-w-0 pr-2">
                                                        {product.brand && (
                                                            <span className="text-[10px] font-black uppercase text-[#5eead4] tracking-wider truncate block leading-none mb-0.5">
                                                                {product.brand}
                                                            </span>
                                                        )}
                                                        <p className="text-sm font-semibold text-white truncate">
                                                            {product.name}
                                                        </p>
                                                        <p className="text-xs text-white/70 mt-0.5 font-bold">
                                                            ${product.sellPrice.toLocaleString("es-CO")}
                                                        </p>
                                                    </div>
                                                </button>

                                                {/* Direct Add Button — Botón hermano independiente sin anidación */}
                                                <div className="flex-shrink-0 mr-1">
                                                    <AddButton 
                                                        quantityInCart={quantityInCart}
                                                        onClick={() => {
                                                            addItem(product as any);
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center pt-20">
                                    <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-4">
                                        <Search className="w-7 h-7 text-white/30" />
                                    </div>
                                    <p className="text-sm font-semibold text-white/60">No se encontraron resultados</p>
                                    <p className="text-xs text-white/40 mt-1">Intenta con otro término</p>
                                </div>
                            )
                        ) : (
                            /* Empty state — Prompt */
                            <div className="flex flex-col items-center justify-center pt-10">
                                <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-4">
                                    <Search className="w-7 h-7 text-white/20" />
                                </div>
                                <p className="text-sm font-medium text-white/40">Busca entre {(products?.length || 0).toLocaleString("es-CO")} productos</p>
                                <p className="text-xs text-white/25 mt-1 mb-8">Escribe el nombre del producto</p>

                                {getRecentProducts().length > 0 && !compact && (
                                    <div className="w-full max-w-sm flex flex-col items-center animate-fadeIn opacity-80 mt-4">
                                        <div className="flex items-center gap-1.5 justify-center mb-5 text-white/50">
                                            <Clock className="w-3.5 h-3.5" />
                                            <span className="text-xs font-bold uppercase tracking-wider">Comprados recientemente</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 w-full px-4">
                                            {getRecentProducts(4).map(product => (
                                                <button
                                                    key={product.id}
                                                    onClick={() => {
                                                        if (onProductSelect) {
                                                            onProductSelect(product as any);
                                                        } else {
                                                            addItem(product as any);
                                                        }
                                                        handleBackClick();
                                                    }}
                                                    className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 active:scale-95 transition-all text-left flex items-center gap-2.5"
                                                >
                                                    <div className="w-8 h-8 shrink-0 bg-white/10 rounded-lg flex items-center justify-center overflow-hidden">
                                                        {product.imageUrl && <img src={product.imageUrl} alt="" className="w-full h-full object-contain mix-blend-screen" />}
                                                    </div>
                                                    <div className="flex-1 min-w-0 pr-1">
                                                        <p className="text-[11px] font-bold text-white/90 truncate leading-tight mb-0.5">{product.name}</p>
                                                        <p className="text-[9px] font-medium text-emerald-400">${Number(product.sellPrice).toLocaleString("es-CO")}</p>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Option B: Render CartSummaryBar at the bottom of the search overlay */}
                    <CartSummaryBar onCheckout={() => { closeSearch(); router.push("/carrito"); }} />
                </div>,
                document.body
            )}

            {/* ───────────────────────────────────────────
                BARRA INLINE — compact mode (icon only) or full bar
                Solo visible cuando NO está activo el overlay
                ─────────────────────────────────────────── */}
            {compact ? (
                /* Compact mode: just a search icon button for headers */
                <button
                    onClick={() => {
                        setIsActive(true);
                        onActiveChange?.(true);
                        setTimeout(() => inputRef.current?.focus(), 100);
                    }}
                    className={`flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200 active:scale-95 ${
                        compactTheme === "dark" 
                        ? "bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-gray-100/50 hover:bg-gray-50" 
                        : "hover:bg-white/20"
                    }`}
                >
                    <Search className={`w-[18px] h-[18px] ${compactTheme === "dark" ? "text-gray-900" : "text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.4)]"}`} strokeWidth={compactTheme === "dark" ? 2.5 : 2} />
                </button>
            ) : (
                /* Full inline glassmorphism bar */
                <div className="w-full">
                    <div
                        className="relative flex items-center h-[42px] rounded-xl bg-white/15 backdrop-blur-xl border border-white/25 cursor-text transition-all duration-300 hover:bg-white/20 hover:border-white/35"
                        style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.2)" }}
                        onClick={() => {
                            setIsActive(true);
                            onActiveChange?.(true);
                            setTimeout(() => inputRef.current?.focus(), 100);
                        }}
                    >
                        <div className="absolute left-2.5 flex items-center justify-center w-7 h-7 rounded-lg bg-white/15 backdrop-blur-sm">
                            <Search className="w-3.5 h-3.5 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]" />
                        </div>
                        <span className="pl-11 text-xs font-bold text-white/70 drop-shadow-[0_1px_2px_rgba(0,0,0,0.15)]">
                            ¿Qué necesitas hoy?
                        </span>
                    </div>
                </div>
            )}

            {/* ── Animations ── */}
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to   { opacity: 1; }
                }
                @keyframes slideDown {
                    from { transform: translateY(-20px); opacity: 0; }
                    to   { transform: translateY(0); opacity: 1; }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.25s ease-out;
                }
                .animate-slideDown {
                    animation: slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                }
            `}</style>
        </>
    );
}
