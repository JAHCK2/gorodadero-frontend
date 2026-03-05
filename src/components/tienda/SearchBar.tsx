"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Search, Truck, X } from "lucide-react";

/* ════════════════════════════════════════════════════════════════════════════
   SearchBar — Barra Sticky Seamless con Motor Fuzzy
   ════════════════════════════════════════════════════════════════════════════

   COMPORTAMIENTO:
   - UNA SOLA barra, UN SOLO diseño.
   - Vive en el flujo normal del documento (debajo del logo).
   - Cuando el usuario scrollea hacia abajo y la barra llega al tope
     de la pantalla, se queda fija ahí (position: sticky).
   - Cuando el usuario scrollea de vuelta, la barra baja a su lugar.
   - Cero transiciones, cero cambios visuales, cero duplicados.

   MOTOR:
   - Fuzzy token search con mock products.
   - Dropdown de resultados al vuelo.
   - Enter cierra teclado, backdrop previene click-through.
   - History API para botón Atrás de Android.

   ══════════════════════════════════════════════════════════════════════════ */

/* ─────────────────────────────────────────────────────────────
   MOCK DATA
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
    const tokens = q.split(/\s+/).filter(Boolean);
    return products
        .filter((p) => {
            const haystack = `${p.name} ${p.category} ${p.sellPrice}`.toLowerCase();
            return tokens.every((token) => haystack.includes(token));
        })
        .sort((a, b) => a.name.localeCompare(b.name, "es"));
}

/* ═════════════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL
   ═════════════════════════════════════════════════════════════ */

export function SearchBar() {
    /* ── Estado ── */
    const [query, setQuery] = useState("");
    const [isActive, setIsActive] = useState(false);

    /* ── Refs ── */
    const inputRef = useRef<HTMLInputElement>(null);

    /* ── Fuzzy Search Results ── */
    const results = useMemo(() => fuzzySearch(MOCK_PRODUCTS, query), [query]);
    const showDropdown = isActive && query.trim().length > 0;

    /* ── HISTORY API — Botón "Atrás" de Android ── */
    useEffect(() => {
        if (!isActive) return;
        window.history.pushState({ searchOpen: true }, "");
        const handlePopState = () => closeSearch();
        window.addEventListener("popstate", handlePopState);
        return () => window.removeEventListener("popstate", handlePopState);
    }, [isActive]);

    /* ── Cerrar buscador ── */
    const closeSearch = useCallback(() => {
        setIsActive(false);
        inputRef.current?.blur();
    }, []);

    /* ── Handlers ── */
    const handleQueryChange = useCallback((value: string) => {
        setQuery(value);
    }, []);

    const handleClear = useCallback(() => {
        setQuery("");
        inputRef.current?.focus();
    }, []);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            (e.target as HTMLElement).blur();
            setIsActive(false);
        }
    }, []);

    const handleFocus = useCallback(() => {
        setIsActive(true);
    }, []);

    const handleBackdropClick = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        e.stopPropagation();
        e.preventDefault();
        if (isActive) window.history.back();
        else closeSearch();
    }, [isActive, closeSearch]);

    /* ─────────────────────────────────────────────────────────
       DROPDOWN DE RESULTADOS
       ───────────────────────────────────────────────────────── */
    const renderDropdown = () => {
        if (!showDropdown) return null;
        return (
            <div className="absolute left-0 right-0 z-50 mt-2 rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-[0_8px_40px_rgba(0,0,0,0.12)] max-h-[280px] overflow-y-auto"
                style={{ scrollbarWidth: "thin" }}
            >
                {results.length > 0 ? (
                    results.map((product) => (
                        <button
                            key={product.id}
                            className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-gray-50 active:bg-gray-100 transition-colors border-b border-gray-50 last:border-b-0"
                            onMouseDown={(e) => {
                                e.preventDefault();
                                setQuery(product.name);
                                setIsActive(false);
                            }}
                        >
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
       RENDER — UNA SOLA BARRA, sticky nativo
       ═══════════════════════════════════════════════════════════ */
    return (
        <>
            {/* Backdrop invisible — previene click-through */}
            {isActive && (
                <div
                    className="fixed inset-0 z-[59] bg-transparent"
                    onClick={handleBackdropClick}
                    onTouchStart={handleBackdropClick}
                    aria-hidden="true"
                />
            )}

            {/* ─────────────────────────────────────────────────
                BARRA DE BÚSQUEDA — position: sticky
                Se pega al tope cuando llega ahí al scrollear.
                Mismo diseño siempre. Cero cambio visual.
                safe-area-inset-top para Android/Xiaomi.
                ───────────────────────────────────────────────── */}
            <div
                className="sticky top-0 z-[60] px-4"
                style={{ paddingTop: "max(8px, env(safe-area-inset-top))" }}
            >
                <div className={`relative ${isActive ? "z-[61]" : ""}`}>
                    {/* Píldora — diseño glassmorphism consistente */}
                    <div className="relative flex items-center h-[50px] rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 shadow-[0_2px_16px_rgba(0,0,0,0.08)]">
                        <div className="absolute left-3.5 flex items-center justify-center w-8 h-8 rounded-xl bg-white/20">
                            <Search className="w-4 h-4 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]" />
                        </div>
                        <input
                            ref={inputRef}
                            type="text"
                            inputMode="search"
                            enterKeyHint="search"
                            autoComplete="off"
                            autoCorrect="off"
                            spellCheck={false}
                            placeholder="¿Qué necesitas hoy?"
                            value={query}
                            onChange={(e) => handleQueryChange(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onFocus={handleFocus}
                            className="w-full h-full pl-14 pr-12 bg-transparent text-sm font-bold text-white placeholder:text-white/70 outline-none rounded-2xl drop-shadow-[0_1px_2px_rgba(0,0,0,0.2)]"
                        />
                        {query && (
                            <button
                                onMouseDown={(e) => { e.preventDefault(); handleClear(); }}
                                className="absolute right-3.5 flex items-center justify-center w-7 h-7 rounded-full bg-white/25 active:scale-90 transition-transform"
                                aria-label="Limpiar búsqueda"
                            >
                                <X className="w-3.5 h-3.5 text-white" />
                            </button>
                        )}
                    </div>

                    {/* Dropdown de resultados */}
                    {renderDropdown()}
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
        </>
    );
}
