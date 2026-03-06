"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Search, Truck, X, ArrowLeft } from "lucide-react";
import Image from "next/image";
import { useCartStore } from "@/store/cartStore";

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

/* ─────────────────────────────────────────────────────────────
   TYPES
   ───────────────────────────────────────────────────────────── */

interface SearchProduct {
    id: string;
    name: string;
    sellPrice: number;
    imageUrl: string | null;
    categoryId?: string;
    barcode?: string | null;
    unitValue?: number | null;
    unitType?: string | null;
}

interface SearchBarProps {
    products?: SearchProduct[];
    onActiveChange?: (active: boolean) => void;
}

/* ─────────────────────────────────────────────────────────────
   UNIT SYNONYMS — Mapeo de lenguaje natural a unit_type
   ───────────────────────────────────────────────────────────── */

const UNIT_SYNONYMS: Record<string, string> = {
    // Litros
    litro: "L", litros: "L", lt: "L", lts: "L",
    // Mililitros
    mililitro: "ml", mililitros: "ml",
    // Kilogramos
    kilo: "kg", kilos: "kg", kilogramo: "kg", kilogramos: "kg",
    // Gramos
    gramo: "g", gramos: "g",
    // Onzas
    onza: "oz", onzas: "oz",
    // Unidades
    unidad: "und", unidades: "und",
    // Libras
    libra: "lb", libras: "lb",
};

/* ─────────────────────────────────────────────────────────────
   SMART SEARCH ENGINE — Multi-índice con 3 niveles
   Prioridad: Barcode > Unit-Type Match > Pure Fuzzy
   ───────────────────────────────────────────────────────────── */

/** Normaliza: lowercase + strip acentos */
function normalize(s: string): string {
    return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}

function smartSearch(products: SearchProduct[], query: string): SearchProduct[] {
    const raw = query.trim();
    if (!raw) return [];

    // ── 1) BARCODE EXACT MATCH (máxima prioridad) ──
    const barcodeMatch = products.find(
        (p) => p.barcode && p.barcode === raw
    );
    if (barcodeMatch) {
        const rest = fuzzyTokenSearch(products, raw).filter(p => p.id !== barcodeMatch.id);
        return [barcodeMatch, ...rest].slice(0, 50);
    }

    // ── 2) UNIT-TYPE MATCH (si query contiene sinónimo de unidad) ──
    const normalizedQuery = normalize(raw);
    const tokens = normalizedQuery.split(/\s+/).filter(Boolean);

    // Check if any token is a unit synonym
    let detectedUnitType: string | null = null;
    const nameTokens: string[] = [];

    for (const token of tokens) {
        if (UNIT_SYNONYMS[token]) {
            detectedUnitType = UNIT_SYNONYMS[token];
        } else {
            nameTokens.push(token);
        }
    }

    if (detectedUnitType) {
        // Filter by unit_type first, then fuzzy on remaining name tokens
        const unitFiltered = products.filter(p => p.unitType === detectedUnitType);

        let results: SearchProduct[];
        if (nameTokens.length > 0) {
            // Further filter by name tokens
            results = unitFiltered
                .filter(p => {
                    const haystack = normalize(p.name);
                    return nameTokens.every(t => haystack.includes(t));
                })
                .sort((a, b) => a.name.localeCompare(b.name, "es"))
                .slice(0, 50);
        } else {
            // Only unit filter, sort by name
            results = unitFiltered
                .sort((a, b) => a.name.localeCompare(b.name, "es"))
                .slice(0, 50);
        }

        if (results.length > 0) return results;
        // Fallthrough to pure fuzzy if unit-type match yields nothing
    }

    // ── 3) PURE FUZZY TOKEN SEARCH (fallback) ──
    return fuzzyTokenSearch(products, raw);
}

function fuzzyTokenSearch(products: SearchProduct[], raw: string): SearchProduct[] {
    const processed = normalize(raw);
    if (!processed) return [];
    const tokens = processed.split(/\s+/).filter(Boolean);

    return products
        .filter((p) => {
            const haystack = normalize(p.name);
            return tokens.every((token) => haystack.includes(token));
        })
        .sort((a, b) => a.name.localeCompare(b.name, "es"))
        .slice(0, 50);
}

/* ═════════════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL
   ═════════════════════════════════════════════════════════════ */

export function SearchBar({ products = [], onActiveChange }: SearchBarProps) {
    const [query, setQuery] = useState("");
    const [isActive, setIsActive] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const addItem = useCartStore((s) => s.addItem);

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
                FULL-SCREEN OVERLAY (only when active)
                ─────────────────────────────────────────── */}
            {isActive && (
                <div className="fixed inset-0 z-[100] flex flex-col animate-fadeIn">
                    {/* Frosted glass background */}
                    <div className="absolute inset-0 bg-[#0f172a]/85 backdrop-blur-2xl" />

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
                        className="relative z-10 flex-1 overflow-y-auto px-4 pb-32"
                        style={{ scrollbarWidth: "thin" }}
                    >
                        {query.trim().length > 0 ? (
                            results.length > 0 ? (
                                <div className="rounded-2xl overflow-hidden bg-white/[0.07] border border-white/10 backdrop-blur-xl">
                                    {results.map((product, i) => (
                                        <button
                                            key={product.id}
                                            className="flex items-center gap-3 w-full px-4 py-3.5 text-left active:bg-white/10 transition-colors border-b border-white/5 last:border-b-0"
                                            onMouseDown={(e) => e.preventDefault()}
                                            onClick={() => {
                                                // Add to cart and close
                                                addItem(product as any);
                                                closeSearch();
                                            }}
                                        >
                                            {/* Product thumbnail */}
                                            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center overflow-hidden">
                                                {product.imageUrl ? (
                                                    <Image
                                                        src={product.imageUrl}
                                                        alt=""
                                                        width={48}
                                                        height={48}
                                                        className="w-full h-full object-contain"
                                                    />
                                                ) : (
                                                    <Search className="w-4 h-4 text-white/30" />
                                                )}
                                            </div>

                                            {/* Product info */}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-white truncate">
                                                    {product.name}
                                                </p>
                                                <p className="text-xs text-white/50 mt-0.5">
                                                    ${product.sellPrice.toLocaleString("es-CO")}
                                                </p>
                                            </div>

                                            {/* Add to cart hint */}
                                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                                <span className="text-emerald-400 text-lg font-bold">+</span>
                                            </div>
                                        </button>
                                    ))}
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
                            <div className="flex flex-col items-center justify-center pt-20">
                                <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-4">
                                    <Search className="w-7 h-7 text-white/20" />
                                </div>
                                <p className="text-sm font-medium text-white/40">Busca entre 2,253 productos</p>
                                <p className="text-xs text-white/25 mt-1">Escribe el nombre del producto</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ───────────────────────────────────────────
                BARRA INLINE (sticky, normal flow)
                Solo visible cuando NO está activo el overlay
                ─────────────────────────────────────────── */}
            <div
                className="sticky top-0 z-[60] px-4"
                style={{ paddingTop: "max(8px, env(safe-area-inset-top))" }}
            >
                <div
                    className="relative flex items-center h-[50px] rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 shadow-[0_2px_16px_rgba(0,0,0,0.08)] cursor-text"
                    onClick={() => {
                        setIsActive(true);
                        // Small delay to ensure overlay is mounted before focus
                        setTimeout(() => inputRef.current?.focus(), 100);
                    }}
                >
                    <div className="absolute left-3.5 flex items-center justify-center w-8 h-8 rounded-xl bg-white/20">
                        <Search className="w-4 h-4 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]" />
                    </div>
                    <span className="pl-14 text-sm font-bold text-white/70">
                        ¿Qué necesitas hoy?
                    </span>
                </div>
            </div>

            {/* Delivery Chips — flujo normal, NO sticky */}
            <div className="flex items-center justify-center gap-2 px-5 pt-3 pb-4">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.15] backdrop-blur-md border border-white/25">
                    <Truck className="w-3 h-3 text-[#fbbf24]" />
                    <span className="text-[10px] font-bold text-white">24/7</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.15] backdrop-blur-md border border-white/25">
                    <svg className="w-3 h-3 text-[#5eead4]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
                    <span className="text-[10px] font-bold text-white">15 min</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.15] backdrop-blur-md border border-white/25">
                    <svg className="w-3 h-3 text-[#f87171]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                    <span className="text-[10px] font-bold text-white">Seguro</span>
                </div>
            </div>

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
