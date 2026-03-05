"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Search, Truck, X } from "lucide-react";

/* ════════════════════════════════════════════════════════════════════════════
   SearchBar — Motor de búsqueda "Al Vuelo" con Fuzzy Token Matching
   ════════════════════════════════════════════════════════════════════════════

   PILARES:
   1. FUZZY SEARCH — Divide el input en tokens y verifica que TODOS existan
      dentro del string compuesto del producto (nombre + categoría + atributos).
   2. DROPDOWN — Resultados al vuelo debajo de la barra, con scroll interno.
   3. MOBILE UX — Enter cierra teclado, click fuera cierra dropdown.
   4. STICKY BAR — scrollY listener, fixed top-0, Android/Xiaomi edge-to-edge.

   ══════════════════════════════════════════════════════════════════════════ */

/* ─────────────────────────────────────────────────────────────
   MOCK DATA — Productos de prueba para validar el fuzzy search.
   Se reemplazarán con datos reales de la DB cuando estén listos.
   ───────────────────────────────────────────────────────────── */

const MOCK_PRODUCTS = [
    { id: "1", name: "Jabón Fab 250gr", category: "Aseo", sellPrice: 4500, imageUrl: null },
    { id: "2", name: "Coca Cola Original 400ml", category: "Gaseosas", sellPrice: 3200, imageUrl: null },
    { id: "3", name: "Papas Margarita Natural 105gr", category: "Snacks", sellPrice: 5800, imageUrl: null },
    { id: "4", name: "Agua Cristal Sin Gas 600ml", category: "Aguas", sellPrice: 2500, imageUrl: null },
    { id: "5", name: "Jabón Protex Avena 120gr", category: "Aseo", sellPrice: 6200, imageUrl: null },
];

/* ─────────────────────────────────────────────────────────────
   FUZZY TOKEN SEARCH ENGINE
   Divide el query en tokens y verifica que TODOS existan dentro
   del string compuesto: nombre + categoría + precio.
   Ej: "ja 50 gr" → tokens ["ja", "50", "gr"]
   Match: "Jabón Fab 250gr" → "jabón fab 250gr aseo 4500" contiene ja ✓, 50 ✓, gr ✓
   ───────────────────────────────────────────────────────────── */

interface MockProduct {
    id: string;
    name: string;
    category: string;
    sellPrice: number;
    imageUrl: string | null;
}

function fuzzySearch(products: MockProduct[], query: string): MockProduct[] {
    const q = query.toLowerCase().trim();
    if (!q) return [];

    // Dividir en tokens (palabras/fragmentos)
    const tokens = q.split(/\s+/).filter(Boolean);

    return products
        .filter((p) => {
            // String compuesto: nombre + categoría + precio formateado
            const haystack = `${p.name} ${p.category} ${p.sellPrice}`.toLowerCase();
            // TODOS los tokens deben encontrarse en el haystack
            return tokens.every((token) => haystack.includes(token));
        })
        // Ordenar alfabéticamente por nombre
        .sort((a, b) => a.name.localeCompare(b.name, "es"));
}

/* ─────────────────────────────────────────────────────────────
   CONSTANTES
   ───────────────────────────────────────────────────────────── */
const SCROLL_THRESHOLD = 280; // px desde top para activar sticky

/* ═════════════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL
   ═════════════════════════════════════════════════════════════ */

export function SearchBar() {
    /* ── Estado ── */
    const [query, setQuery] = useState("");
    const [isSticky, setIsSticky] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);

    /* ── Refs ── */
    const fixedInputRef = useRef<HTMLInputElement>(null);
    const inFlowInputRef = useRef<HTMLInputElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null); // Click outside detector

    /* ── Fuzzy Search Results (memoized) ── */
    const results = useMemo(() => fuzzySearch(MOCK_PRODUCTS, query), [query]);

    /* ── Scroll Listener ──
       Passive para no bloquear rendering. Chequeo inicial incluido. */
    useEffect(() => {
        const handleScroll = () => setIsSticky(window.scrollY > SCROLL_THRESHOLD);
        window.addEventListener("scroll", handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    /* ── Click Outside → cerrar dropdown + ocultar teclado ──
       Detecta clics fuera del wrapperRef para cerrar resultados. */
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent | TouchEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
                setShowDropdown(false);
                // Forzar blur en el input activo para ocultar teclado
                inFlowInputRef.current?.blur();
                fixedInputRef.current?.blur();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("touchstart", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("touchstart", handleClickOutside);
        };
    }, []);

    /* ── Handlers ── */
    const handleQueryChange = useCallback((value: string) => {
        setQuery(value);
        setShowDropdown(value.trim().length > 0);
    }, []);

    const handleClear = useCallback(() => {
        setQuery("");
        setShowDropdown(false);
        if (isSticky) fixedInputRef.current?.focus();
        else inFlowInputRef.current?.focus();
    }, [isSticky]);

    // Enter → blur para ocultar teclado en móvil
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            (e.target as HTMLElement).blur();
        }
    }, []);

    const handleFocus = useCallback(() => {
        if (query.trim().length > 0) setShowDropdown(true);
    }, [query]);

    /* ── Shared input props ── */
    const sharedInputProps = {
        type: "text" as const,
        inputMode: "search" as const,
        enterKeyHint: "search" as const,
        autoComplete: "off" as const,
        autoCorrect: "off" as const,
        spellCheck: false,
        placeholder: "¿Qué necesitas hoy?",
        value: query,
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => handleQueryChange(e.target.value),
        onKeyDown: handleKeyDown,
        onFocus: handleFocus,
        onBlur: () => {
            // Delay para permitir click en resultado antes de cerrar
            setTimeout(() => setShowDropdown(false), 200);
        },
    };

    /* ─────────────────────────────────────────────────────────
       DROPDOWN DE RESULTADOS
       Reutilizable — se renderiza en ambos contextos (in-flow y sticky)
       ───────────────────────────────────────────────────────── */
    const renderDropdown = (variant: "inflow" | "sticky") => {
        if (!showDropdown) return null;

        return (
            <div className={[
                "absolute left-0 right-0 z-50 mt-2 rounded-2xl overflow-hidden",
                "bg-white border border-gray-100",
                "shadow-[0_8px_40px_rgba(0,0,0,0.12)]",
                "max-h-[280px] overflow-y-auto",
                variant === "inflow" ? "mx-0" : "",
            ].join(" ")}
                style={{ scrollbarWidth: "thin" }}
            >
                {results.length > 0 ? (
                    results.map((product) => (
                        <button
                            key={product.id}
                            className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-gray-50 active:bg-gray-100 transition-colors border-b border-gray-50 last:border-b-0"
                            onClick={() => {
                                // TODO: navegar al producto o abrir modal
                                setShowDropdown(false);
                                setQuery(product.name);
                            }}
                        >
                            {/* Ícono placeholder si no hay imagen */}
                            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                                {product.imageUrl ? (
                                    <img src={product.imageUrl} alt="" className="w-full h-full object-cover rounded-xl" />
                                ) : (
                                    <Search className="w-4 h-4 text-gray-300" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-[#1e293b] truncate">
                                    {product.name}
                                </p>
                                <p className="text-xs text-gray-400">
                                    {product.category} · ${product.sellPrice.toLocaleString("es-CO")}
                                </p>
                            </div>
                        </button>
                    ))
                ) : (
                    <div className="px-4 py-6 text-center">
                        <p className="text-sm text-gray-400">No se encontraron resultados</p>
                        <p className="text-xs text-gray-300 mt-1">Intenta con otro término</p>
                    </div>
                )}
            </div>
        );
    };

    /* ═══════════════════════════════════════════════════════════
       RENDER
       ═══════════════════════════════════════════════════════════ */
    return (
        <div ref={wrapperRef}>
            {/* ─────────────────────────────────────────────────
                IN-FLOW BAR — Sobre la playa, scrollea con hero
                ───────────────────────────────────────────────── */}
            <div className="px-5 pt-1 pb-4">
                {/* Contenedor relativo para posicionar dropdown */}
                <div className="relative">
                    {/* Search Pill */}
                    <div className="relative flex items-center h-[50px] rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 shadow-[0_2px_16px_rgba(0,0,0,0.08)]">
                        <div className="absolute left-3.5 flex items-center justify-center w-8 h-8 rounded-xl bg-white/20">
                            <Search className="w-4 h-4 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]" />
                        </div>
                        <input
                            ref={inFlowInputRef}
                            {...sharedInputProps}
                            className="w-full h-full pl-14 pr-12 bg-transparent text-sm font-bold text-white placeholder:text-white/70 outline-none rounded-2xl drop-shadow-[0_1px_2px_rgba(0,0,0,0.2)]"
                        />
                        {query && (
                            <button
                                onClick={handleClear}
                                className="absolute right-3.5 flex items-center justify-center w-7 h-7 rounded-full bg-white/25 active:scale-90 transition-transform"
                                aria-label="Limpiar búsqueda"
                            >
                                <X className="w-3.5 h-3.5 text-white" />
                            </button>
                        )}
                    </div>

                    {/* Dropdown — in-flow context */}
                    {!isSticky && renderDropdown("inflow")}
                </div>

                {/* Delivery Chips */}
                <div className="flex items-center justify-center gap-2 mt-4">
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
            </div>

            {/* ─────────────────────────────────────────────────
                STICKY BAR — fixed top-0 w-full.
                Android/Xiaomi edge-to-edge: sin gaps blancos.
                Transición premium: duration-500 ease-in-out.
                ───────────────────────────────────────────────── */}
            <div
                className={[
                    "fixed top-0 left-0 w-full z-[45]",
                    "transition-all duration-500 ease-in-out",
                    isSticky
                        ? "translate-y-0 opacity-100"
                        : "-translate-y-full opacity-0 pointer-events-none",
                ].join(" ")}
            >
                {/* Glassmorphism backdrop */}
                <div className="bg-white/75 backdrop-blur-2xl border-b border-white/40 shadow-[0_4px_24px_rgba(0,0,0,0.08)]">
                    <div
                        className="max-w-md mx-auto px-5 pb-3"
                        style={{ paddingTop: "max(12px, env(safe-area-inset-top))" }}
                    >
                        <div className="relative">
                            <div className="relative flex items-center h-[50px] rounded-2xl bg-white/90 border border-gray-200/60 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
                                <div className="absolute left-3.5 flex items-center justify-center w-8 h-8 rounded-xl bg-[#5eead4]/10">
                                    <Search className="w-4 h-4 text-[#94a3b8]" />
                                </div>
                                <input
                                    ref={fixedInputRef}
                                    {...sharedInputProps}
                                    className="w-full h-full pl-14 pr-12 bg-transparent text-sm font-bold text-[#1e293b] placeholder:text-[#94a3b8] outline-none rounded-2xl"
                                />
                                {query && (
                                    <button
                                        onClick={handleClear}
                                        className="absolute right-3.5 flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 active:scale-90 transition-transform"
                                        aria-label="Limpiar búsqueda"
                                    >
                                        <X className="w-3.5 h-3.5 text-gray-500" />
                                    </button>
                                )}
                            </div>

                            {/* Dropdown — sticky context */}
                            {isSticky && renderDropdown("sticky")}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
