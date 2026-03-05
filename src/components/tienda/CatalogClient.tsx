"use client";


import { useState, useRef, useEffect, useCallback } from "react";
import { ChevronLeft, Search, MapPin, ChevronRight } from "lucide-react";
import Image from "next/image";
import { GoLogoFull } from "./GoLogoFull";
import { Sidebar } from "./Sidebar";
import { SubcategoryCarousel } from "./SubcategoryCarousel";
import { CatalogProductCard } from "./CatalogProductCard";
import { PasillosFab } from "./PasillosFab";
import { ProductDetailModal } from "./ProductDetailModal";
import { BottomNav } from "./BottomNav";
import { SearchBar } from "./SearchBar";

/* ========================================================================
   DATA — Quick-access categories for landing (real images)
   ======================================================================== */

const QUICK_CATEGORIES = [
    { name: "Cervezas", image: "/images/cat-cervezas.webp" },
    { name: "Gaseosas", image: "/images/cat-gaseosas.webp" },
    { name: "Aguas", image: "/images/cat-aguas.webp" },
    { name: "Snacks", image: "/images/cat-snacks.webp" },
    { name: "Licores", image: "/images/cat-licores.webp" },
    { name: "Lacteos", image: "/images/cat-lacteos.webp" },
];

/* ========================================================================
   TYPES
   ======================================================================== */

interface CategoryItem {
    id: string;
    name: string;
    slug: string;
    icon: string | null;
    sortOrder: number;
    isActive: boolean;
    parentId: string | null;
}

interface CatalogClientProps {
    macroCategories: CategoryItem[];
    subcategories: CategoryItem[];
    initialProducts: any[];
}

/* ========================================================================
   MAIN COMPONENT
   ======================================================================== */

export default function CatalogClient({ macroCategories, subcategories, initialProducts }: CatalogClientProps) {
    // STATE MACHINE:
    // activeMacroId = null   → STATE 0: Home Screen (glassmorphism)
    // activeMacroId = "xxx"  → STATE 1: Vitrina (sidebar + carousels)
    // deepViewSubId = "xxx"  → STATE 2: Deep view (full grid)
    const [activeMacroId, setActiveMacroId] = useState<string | null>(null);
    const [activeSubId, setActiveSubId] = useState<string | null>(null);
    const [deepViewSubId, setDeepViewSubId] = useState<string | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
    const [isScrollSpy, setIsScrollSpy] = useState(true);

    const productAreaRef = useRef<HTMLDivElement>(null);
    const sectionRefs = useRef<Map<string, HTMLDivElement>>(new Map());

    const activeMacro = macroCategories.find(m => m.id === activeMacroId);

    const activeSubcategories = activeMacroId
        ? subcategories.filter(s => s.parentId === activeMacroId).sort((a, b) => a.sortOrder - b.sortOrder)
        : [];

    useEffect(() => {
        if (activeMacroId) setActiveSubId(activeSubcategories[0]?.id || null);
        setDeepViewSubId(null);
        productAreaRef.current?.scrollTo({ top: 0 });
    }, [activeMacroId]);

    // ScrollSpy
    useEffect(() => {
        if (!isScrollSpy || deepViewSubId || !activeMacroId) return;
        const container = productAreaRef.current;
        if (!container) return;
        const observer = new IntersectionObserver(
            (entries) => { for (const e of entries) if (e.isIntersecting) { const id = e.target.getAttribute("data-subcategory-id"); if (id) setActiveSubId(id); } },
            { root: container, rootMargin: "-10% 0px -70% 0px", threshold: 0 }
        );
        sectionRefs.current.forEach((el) => { if (el) observer.observe(el); });
        return () => observer.disconnect();
    }, [activeMacroId, activeSubcategories.length, isScrollSpy, deepViewSubId]);

    /* ── HISTORY API — Botón "Atrás" de Android ──
       Intercepta popstate para navegar por la state machine
       en vez de salir de la página. Cada transición de estado
       hace pushState; popstate recorre en reversa. */
    useEffect(() => {
        const handlePopState = () => {
            // Prioridad: modal > deep view > vitrina > landing
            if (selectedProduct) {
                setSelectedProduct(null);
            } else if (deepViewSubId) {
                setDeepViewSubId(null);
                productAreaRef.current?.scrollTo({ top: 0 });
            } else if (activeMacroId) {
                setActiveMacroId(null);
                setDeepViewSubId(null);
                setActiveSubId(null);
            }
            // Si estamos en landing (STATE 0), dejamos que el browser navegue normalmente
        };
        window.addEventListener("popstate", handlePopState);
        return () => window.removeEventListener("popstate", handlePopState);
    }, [selectedProduct, deepViewSubId, activeMacroId]);

    const handleMacroSelect = useCallback((macroId: string) => {
        window.history.pushState({ state: "vitrina" }, "");
        setActiveMacroId(macroId);
        setDeepViewSubId(null);
    }, []);
    const handleSeeMore = useCallback((subId: string) => {
        window.history.pushState({ state: "deepView" }, "");
        setDeepViewSubId(subId);
        setActiveSubId(subId);
        productAreaRef.current?.scrollTo({ top: 0 });
    }, []);
    const handleBackToVitrina = useCallback(() => { window.history.back(); }, []);
    const handleBackToLanding = useCallback(() => { window.history.back(); }, []);
    const handleOpenProduct = useCallback((product: any) => {
        window.history.pushState({ state: "productModal" }, "");
        setSelectedProduct(product);
    }, []);
    const handleSubSelect = useCallback((subId: string) => {
        if (deepViewSubId) { handleSeeMore(subId); return; }
        setActiveSubId(subId); setIsScrollSpy(false);
        const el = sectionRefs.current.get(subId);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        setTimeout(() => setIsScrollSpy(true), 800);
    }, [deepViewSubId]);
    const setSectionRef = useCallback((id: string, el: HTMLDivElement | null) => { if (el) sectionRefs.current.set(id, el); else sectionRefs.current.delete(id); }, []);

    // Find macro by keyword
    const findMacroForQuickCat = useCallback((quickName: string) => {
        const term = quickName.toLowerCase();
        const matchSub = subcategories.find(s => s.name.toLowerCase().includes(term) || s.slug.includes(term));
        if (matchSub) return matchSub.parentId;
        const matchMacro = macroCategories.find(m => m.name.toLowerCase().includes(term) || m.slug.includes(term));
        if (matchMacro) return matchMacro.id;
        return macroCategories[0]?.id || null;
    }, [macroCategories, subcategories]);


    /* ╔════════════════════════════════════════════════════════════════════╗
       ║ STATE 0: HOME SCREEN — Glassmorphism over Rodadero              ║
       ╚════════════════════════════════════════════════════════════════════╝ */
    if (activeMacroId === null) {
        return (
            <main className="min-h-screen relative">
                {/* ═══════════════════════════════════════════════════════
                    FULL-SCREEN BACKGROUND — Aislado en capa GPU propia.
                    Usa 100lvh (large viewport) para ignorar la barra
                    de Chrome que aparece/desaparece en Android.
                    will-change + translateZ(0) = compositing GPU.
                    ═══════════════════════════════════════════════════════ */}
                <div
                    className="fixed top-0 left-0 w-full z-0 pointer-events-none"
                    style={{
                        height: "100lvh",
                        willChange: "transform",
                        WebkitTransform: "translateZ(0)",
                        transform: "translateZ(0)",
                    }}
                >
                    <Image
                        src="/images/rodadero-fullscreen.webp"
                        alt=""
                        fill
                        className="object-cover"
                        priority
                        quality={75}
                        sizes="100vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/40" />
                </div>

                {/* ═══════════════════════════════════════════════════════
                    FLOATING CONTENT — Over the background
                    ═══════════════════════════════════════════════════════ */}
                <div className="relative z-10 max-w-md mx-auto pb-24">

                    {/* ─── HERO SECTION ─── */}
                    <section className="px-5 pt-5 pb-2">
                        {/* Top bar: location + online indicator */}
                        <div className="flex items-center justify-between mb-6">
                            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-lg border border-white/20 hover:bg-white/25 transition-all duration-300 active:scale-95">
                                <MapPin className="w-3 h-3 text-[#5eead4]" />
                                <span className="text-[11px] font-bold text-white/90">
                                    El Rodadero, Santa Marta
                                </span>
                                <ChevronRight className="w-3 h-3 text-white/40 rotate-90" />
                            </button>
                            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-[#10b981]/20 backdrop-blur-sm border border-[#10b981]/25">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
                                <span className="text-[10px] font-bold text-[#6ee7b7]">Abierto ahora</span>
                            </div>
                        </div>

                        {/* Centered logo */}
                        <div className="flex flex-col items-center text-center mb-5">
                            <div className="relative">
                                <div className="absolute inset-0 scale-[1.8] bg-white/10 rounded-full blur-[40px]" />
                                <GoLogoFull className="relative w-48 h-auto drop-shadow-[0_6px_32px_rgba(0,0,0,0.35)]" />
                            </div>
                        </div>

                        {/* Slogan with wave icons */}
                        <div className="flex items-center justify-center gap-3 mb-3">
                            <svg className="w-4 h-4 text-[#5eead4]/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" /><path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" /><path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" /></svg>
                            <p className="text-[11px] font-extrabold text-white tracking-[0.25em] uppercase drop-shadow-[0_1px_4px_rgba(0,0,0,0.3)]">
                                Tu super en minutos
                            </p>
                            <svg className="w-4 h-4 text-[#5eead4]/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" /><path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" /><path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" /></svg>
                        </div>
                    </section>

                    {/* Search bar + delivery chips + fixed scroll overlay */}
                    <SearchBar />

                    {/* ─── LO MÁS PEDIDO — Diseño Neumórfico Táctil ─── */}
                    <section className="px-4 pt-3 pb-2">
                        <div
                            className="rounded-3xl p-5 bg-[#3fbfbf]/30 backdrop-blur-2xl border border-white/20"
                            style={{ boxShadow: "inset 4px 4px 12px rgba(255,255,255,0.15), inset -4px -4px 12px rgba(0,0,0,0.15), 0 8px 32px rgba(0,0,0,0.10)" }}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-[16px] font-black text-white tracking-tight drop-shadow-sm">
                                    Lo más pedido
                                </h2>
                                <button
                                    onClick={() => handleMacroSelect(macroCategories[0]?.id || "")}
                                    className="flex items-center gap-0.5 text-[12px] font-bold text-white/70"
                                >
                                    Ver todo
                                    <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                {QUICK_CATEGORIES.map((cat) => (
                                    <button
                                        key={cat.name}
                                        onClick={() => {
                                            const macroId = findMacroForQuickCat(cat.name);
                                            if (macroId) handleMacroSelect(macroId);
                                        }}
                                        className="group flex flex-col items-center"
                                    >
                                        <div
                                            className="relative w-full aspect-square rounded-2xl overflow-hidden mb-2 transition-all duration-150 active:shadow-[inset_3px_3px_8px_rgba(0,0,0,0.25),inset_-2px_-2px_6px_rgba(255,255,255,0.15)]"
                                            style={{ boxShadow: "6px 6px 16px rgba(0,0,0,0.25), -4px -4px 12px rgba(255,255,255,0.15)" }}
                                        >
                                            <Image
                                                src={cat.image}
                                                alt={cat.name}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/15 rounded-2xl" />
                                        </div>
                                        <span className="text-[11px] font-bold text-white/90 text-center leading-tight drop-shadow-sm">
                                            {cat.name}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* ─── TODOS LOS PASILLOS — Neumórfico unificado ─── */}
                    <section className="pt-4 pb-4">
                        <div
                            className="mx-4 rounded-3xl p-5 bg-[#3fbfbf]/30 backdrop-blur-2xl border border-white/20"
                            style={{ boxShadow: "inset 4px 4px 12px rgba(255,255,255,0.15), inset -4px -4px 12px rgba(0,0,0,0.15), 0 8px 32px rgba(0,0,0,0.10)" }}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-[16px] font-black text-white tracking-tight drop-shadow-sm">
                                    Todos los pasillos
                                </h2>
                                <button
                                    onClick={() => handleMacroSelect(macroCategories[0]?.id || "")}
                                    className="flex items-center gap-0.5 text-[12px] font-bold text-white/70"
                                >
                                    Ver todos
                                    <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                            </div>

                            <div
                                className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1"
                                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                            >
                                {macroCategories
                                    .sort((a, b) => a.sortOrder - b.sortOrder)
                                    .map((macro) => (
                                        <button
                                            key={macro.id}
                                            onClick={() => handleMacroSelect(macro.id)}
                                            className="group flex-shrink-0 w-24"
                                        >
                                            <div
                                                className="relative w-24 h-24 rounded-2xl overflow-hidden bg-white/10 border border-white/20 mb-2 transition-all duration-300 group-hover:scale-105 active:scale-95 active:shadow-[inset_3px_3px_8px_rgba(0,0,0,0.25),inset_-2px_-2px_6px_rgba(255,255,255,0.15)] flex items-center justify-center"
                                                style={{ boxShadow: "6px 6px 16px rgba(0,0,0,0.25), -4px -4px 12px rgba(255,255,255,0.15)" }}
                                            >
                                                <span className="text-3xl group-hover:scale-110 transition-transform duration-300">
                                                    {macro.icon || "📦"}
                                                </span>
                                            </div>
                                            <span className="text-[11px] font-bold text-white/90 text-center leading-tight block drop-shadow-sm">
                                                {macro.name}
                                            </span>
                                        </button>
                                    ))}
                            </div>
                        </div>
                    </section>

                </div>

                {/* Product Detail Modal */}
                {selectedProduct && (
                    <ProductDetailModal product={selectedProduct} allProducts={initialProducts} onClose={() => window.history.back()} />
                )}

                {/* Bottom Navigation */}
                <BottomNav
                    activeTab="inicio"
                    onInicioClick={() => { }}
                    onPasillosClick={() => handleMacroSelect(macroCategories[0]?.id || "")}
                />
            </main>
        );
    }


    /* ╔════════════════════════════════════════════════════════════════════╗
       ║ STATE 1 & 2: VITRINA + DEEP VIEW                               ║
       ╚════════════════════════════════════════════════════════════════════╝ */
    return (
        <div className="min-h-screen bg-white pb-20">
            <div className="max-w-md mx-auto h-[calc(100vh-80px)] overflow-hidden relative flex flex-col">

                {/* HEADER */}
                <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={deepViewSubId ? handleBackToVitrina : handleBackToLanding}
                            className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-gray-100 transition-colors active:scale-90"
                        >
                            <ChevronLeft className="w-6 h-6 text-gray-800" />
                        </button>
                        <h1 className="text-[17px] font-bold text-gray-900 truncate max-w-[220px]">
                            {deepViewSubId
                                ? activeSubcategories.find(s => s.id === deepViewSubId)?.name || "Productos"
                                : activeMacro?.name || "Catálogo"
                            }
                        </h1>
                    </div>
                    <button className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors">
                        <Search className="w-5 h-5 text-gray-800" />
                    </button>
                </header>

                {/* Deep View filter chips */}
                {deepViewSubId && (
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-white border-b border-gray-100 flex-shrink-0">
                        <button className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-gray-50 border border-gray-200">
                            <svg className="w-4 h-4 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 21V14M4 10V3M12 21V12M12 8V3M20 21V16M20 12V3M1 14h6M9 8h6M17 16h6" /></svg>
                        </button>
                        <button className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50">
                            Precio <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
                        </button>
                        <button className="flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50">
                            Ofertas
                        </button>
                    </div>
                )}

                {/* Split: sidebar + products */}
                <div className="flex flex-1 overflow-hidden">
                    {!deepViewSubId && (
                        <Sidebar
                            categories={activeSubcategories.map(s => ({ id: s.id, name: s.name, icon: s.icon }))}
                            activeCategory={activeSubId || ""}
                            onSelect={(id: string) => handleSubSelect(id)}
                            useIdForSelection
                        />
                    )}

                    <div ref={productAreaRef} className="flex-1 flex flex-col overflow-y-auto bg-white" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
                        {deepViewSubId === null ? (
                            <>
                                {activeSubcategories.map((sub) => {
                                    const subProducts = initialProducts.filter(p => p.categoryId === sub.id);
                                    return (
                                        <SubcategoryCarousel
                                            key={sub.id}
                                            ref={(el) => setSectionRef(sub.id, el)}
                                            subcategoryId={sub.id}
                                            subcategoryName={sub.name}
                                            products={subProducts}
                                            onProductClick={handleOpenProduct}
                                            onSeeMore={() => handleSeeMore(sub.id)}
                                        />
                                    );
                                })}
                                {activeSubcategories.length === 0 && (
                                    <div className="flex-1 flex items-center justify-center py-20">
                                        <p className="text-sm text-gray-400">No hay subcategorías para &quot;{activeMacro?.name}&quot; todavía.</p>
                                    </div>
                                )}
                                <div className="h-24" />
                            </>
                        ) : (
                            (() => {
                                const deepProducts = initialProducts.filter(p => p.categoryId === deepViewSubId);
                                return (
                                    <div className="grid grid-cols-2 gap-2.5 px-3 py-4 pb-24">
                                        {deepProducts.length > 0 ? deepProducts.map((product) => (
                                            <CatalogProductCard key={product.id} product={product} onClick={() => handleOpenProduct(product)} />
                                        )) : (
                                            <div className="col-span-2 text-center py-12 text-gray-400">
                                                <p className="text-sm">No hay productos en esta subcategoría.</p>
                                            </div>
                                        )}
                                    </div>
                                );
                            })()
                        )}
                    </div>
                </div>

                <PasillosFab onClick={handleBackToLanding} />

                {selectedProduct && (
                    <ProductDetailModal product={selectedProduct} allProducts={initialProducts} onClose={() => window.history.back()} />
                )}
            </div>

            {/* Bottom Navigation */}
            <BottomNav
                activeTab="pasillos"
                onInicioClick={handleBackToLanding}
                onPasillosClick={() => { }}
            />
        </div>
    );
}
