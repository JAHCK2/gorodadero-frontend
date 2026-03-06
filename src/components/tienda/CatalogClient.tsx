"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import Image from "next/image";
import { GoLogoFull } from "./GoLogoFull";
import { Sidebar } from "./Sidebar";
import { SubcategoryCarousel } from "./SubcategoryCarousel";
import { CatalogProductCard } from "./CatalogProductCard";
import { PasillosFab } from "./PasillosFab";
import { ProductDetailModal } from "./ProductDetailModal";
import { BottomNav } from "./BottomNav";
import { SearchBar } from "./SearchBar";
import { useCartStore } from "@/store/cartStore";
import type { Product } from "@/types/product";

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
    initialProducts: Product[];
}

/* ========================================================================
   STATE MACHINE:
   ──────────────────────────────────────────────────────────────
   navState = "home"        → Home Screen (glassmorphism hero)
   navState = "masterView"  → Vista Maestra (grid of all macros)
   navState = "deepView"    → Deep View (sidebar + products)
   ──────────────────────────────────────────────────────────────
   All states share: SearchBar (top) + BottomNav (bottom)
   ======================================================================== */

type NavState = "home" | "masterView" | "deepView";

export default function CatalogClient({ macroCategories, subcategories, initialProducts }: CatalogClientProps) {
    const [navState, setNavState] = useState<NavState>("home");
    const [activeMacroId, setActiveMacroId] = useState<string | null>(null);
    const [activeSubId, setActiveSubId] = useState<string | null>(null);
    const [deepViewSubId, setDeepViewSubId] = useState<string | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [isScrollSpy, setIsScrollSpy] = useState(true);
    const [isSearchActive, setIsSearchActive] = useState(false);
    const cartItemCount = useCartStore((s) => s.getItemCount());

    const productAreaRef = useRef<HTMLDivElement>(null);
    const sectionRefs = useRef<Map<string, HTMLDivElement>>(new Map());
    const contentRef = useRef<HTMLDivElement>(null);

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
        if (!isScrollSpy || deepViewSubId || navState !== "deepView") return;
        const container = productAreaRef.current;
        if (!container) return;
        const observer = new IntersectionObserver(
            (entries) => { for (const e of entries) if (e.isIntersecting) { const id = e.target.getAttribute("data-subcategory-id"); if (id) setActiveSubId(id); } },
            { root: container, rootMargin: "-10% 0px -70% 0px", threshold: 0 }
        );
        sectionRefs.current.forEach((el) => { if (el) observer.observe(el); });
        return () => observer.disconnect();
    }, [navState, activeMacroId, activeSubcategories.length, isScrollSpy, deepViewSubId]);

    /* ── HISTORY API — Botón "Atrás" de Android ──
       Intercepta popstate para navegar la state machine
       en vez de salir de la página. */
    useEffect(() => {
        const handlePopState = () => {
            // Prioridad: modal > deep sub view > deep view > master view > home
            if (selectedProduct) {
                setSelectedProduct(null);
            } else if (deepViewSubId) {
                setDeepViewSubId(null);
                productAreaRef.current?.scrollTo({ top: 0 });
            } else if (navState === "deepView") {
                setNavState("masterView");
                setActiveMacroId(null);
                setActiveSubId(null);
            } else if (navState === "masterView") {
                setNavState("home");
            }
            // Si estamos en home (STATE 0), dejamos que el browser navegue normalmente
        };
        window.addEventListener("popstate", handlePopState);
        return () => window.removeEventListener("popstate", handlePopState);
    }, [selectedProduct, deepViewSubId, navState]);

    /* ── Navigation Handlers ── */
    const handleGoToMasterView = useCallback(() => {
        window.history.pushState({ state: "masterView" }, "");
        setNavState("masterView");
        contentRef.current?.scrollTo({ top: 0 });
    }, []);

    const handleMacroSelect = useCallback((macroId: string) => {
        window.history.pushState({ state: "deepView" }, "");
        setNavState("deepView");
        setActiveMacroId(macroId);
        setDeepViewSubId(null);
    }, []);

    /** Quick-link: jump directly to a subcategory's Deep View */
    const handleQuickLink = useCallback((subSlug: string) => {
        const sub = subcategories.find(s => s.slug === subSlug);
        if (!sub) return;
        // Navigate to the parent macro + auto-scroll to subcategory
        window.history.pushState({ state: "deepView" }, "");
        setNavState("deepView");
        setActiveMacroId(sub.parentId);
        setDeepViewSubId(null);
        // After render, scroll to the target subcategory
        setTimeout(() => {
            setActiveSubId(sub.id);
            const el = sectionRefs.current.get(sub.id);
            if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 150);
    }, [subcategories]);

    const handleSeeMore = useCallback((subId: string) => {
        window.history.pushState({ state: "deepSubView" }, "");
        setDeepViewSubId(subId);
        setActiveSubId(subId);
        productAreaRef.current?.scrollTo({ top: 0 });
    }, []);

    const handleBackToVitrina = useCallback(() => { window.history.back(); }, []);
    const handleBackToMasterView = useCallback(() => { window.history.back(); }, []);
    const handleBackToHome = useCallback(() => {
        setNavState("home");
        setActiveMacroId(null);
        setDeepViewSubId(null);
        setActiveSubId(null);
        // Pop history to match
        window.history.back();
    }, []);

    const handleOpenProduct = useCallback((product: Product) => {
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

    const setSectionRef = useCallback((id: string, el: HTMLDivElement | null) => {
        if (el) sectionRefs.current.set(id, el);
        else sectionRefs.current.delete(id);
    }, []);

    const sortedMacros = useMemo(
        () => [...macroCategories].sort((a, b) => a.sortOrder - b.sortOrder),
        [macroCategories]
    );

    /* ── Promotional Banner Definitions ── */
    const PROMO_BANNERS = useMemo(() => [
        {
            slug: "cervezas",
            label: "Cervezas",
            subtitle: "Águila · Poker · Heineken",
            emoji: "🍺",
            gradient: "from-amber-600/80 via-yellow-700/70 to-amber-900/90",
            border: "border-amber-400/30",
        },
        {
            slug: "aguas",
            label: "Aguas",
            subtitle: "600ml · 5L · Coco · Colágeno",
            emoji: "💧",
            gradient: "from-sky-400/80 via-cyan-500/70 to-blue-700/90",
            border: "border-sky-300/30",
        },
        {
            slug: "leche-natural",
            label: "Lácteos",
            subtitle: "Yogurt · Avena · Leche · Quesos",
            emoji: "🥛",
            gradient: "from-blue-100/80 via-indigo-200/60 to-purple-300/70",
            border: "border-blue-200/40",
        },
        {
            slug: "gaseosas-y-maltas",
            label: "Gaseosas",
            subtitle: "Coca Cola · Pepsi · Postobón",
            emoji: "🥤",
            gradient: "from-red-600/80 via-rose-700/70 to-red-900/90",
            border: "border-red-400/30",
        },
        {
            slug: "snacks-salados",
            label: "Snacks",
            subtitle: "Papas · Doritos · De Todito",
            emoji: "🍿",
            gradient: "from-orange-500/80 via-amber-500/70 to-orange-700/90",
            border: "border-orange-400/30",
        },
        {
            slug: "gomitas-y-caramelos",
            label: "Dulces",
            subtitle: "Gomitas · Caramelos · Chicles",
            emoji: "🍬",
            gradient: "from-pink-500/80 via-fuchsia-500/70 to-purple-700/90",
            border: "border-pink-400/30",
        },
    ], []);

    // Determine active tab for BottomNav
    const activeTab = navState === "home" ? "inicio" : "pasillos";

    /* ╔════════════════════════════════════════════════════════════════════╗
       ║ UNIFIED SHELL: SearchBar (top) + Content (middle) + BottomNav   ║
       ╚════════════════════════════════════════════════════════════════════╝ */
    return (
        <main className="min-h-screen relative">

            {/* ═══════════════════════════════════════════════════════
                FULL-SCREEN BACKGROUND — Always present, fades per state
                ═══════════════════════════════════════════════════════ */}
            <div
                className={`fixed top-0 left-0 w-full z-0 pointer-events-none transition-opacity duration-500 ${navState === "home" ? "opacity-100" : "opacity-0"}`}
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
                SCROLLABLE CONTENT — max-w-md centered
                ═══════════════════════════════════════════════════════ */}
            <div
                ref={contentRef}
                className={`relative z-10 max-w-md mx-auto pb-24 ${navState !== "home" ? "bg-white min-h-screen" : ""}`}
            >

                {/* ── GLOBAL SEARCH BAR — always visible ── */}
                {navState === "home" ? (
                    /* Home: hero section + search bar over background image */
                    <>
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

                        <SearchBar products={initialProducts} onActiveChange={setIsSearchActive} />
                    </>
                ) : (
                    /* Master View / Deep View: compact header with back + search */
                    <header className="sticky top-0 z-[60] bg-white/90 backdrop-blur-xl border-b border-gray-100/80 flex-shrink-0"
                        style={{ boxShadow: "0 1px 8px rgba(0,0,0,0.04)" }}
                    >
                        <div className="flex items-center justify-between px-4 py-3">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={navState === "deepView"
                                        ? (deepViewSubId ? handleBackToVitrina : handleBackToMasterView)
                                        : handleBackToHome}
                                    className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-gray-100 transition-colors active:scale-90"
                                >
                                    <ChevronLeft className="w-6 h-6 text-gray-800" />
                                </button>
                                <h1 className="text-[17px] font-bold text-gray-900 truncate max-w-[220px]">
                                    {navState === "masterView"
                                        ? "Todos los pasillos"
                                        : deepViewSubId
                                            ? activeSubcategories.find(s => s.id === deepViewSubId)?.name || "Productos"
                                            : activeMacro?.name || "Catálogo"
                                    }
                                </h1>
                            </div>
                            <SearchBar products={initialProducts} onActiveChange={setIsSearchActive} compact />
                        </div>
                    </header>
                )}


                {/* ═══════════════════════════════════════════════════════
                    STATE 0: HOME — Cards over Rodadero background
                    ═══════════════════════════════════════════════════════ */}
                {navState === "home" && (
                    <>
                        {/* ─── BANNERS PROMOCIONALES — 6 Quick-Links ─── */}
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
                                        onClick={handleGoToMasterView}
                                        className="flex items-center gap-0.5 text-[12px] font-bold text-white/70 hover:text-white transition-colors"
                                    >
                                        Ver todo
                                        <ChevronRight className="w-3.5 h-3.5" />
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    {PROMO_BANNERS.map((banner) => (
                                        <button
                                            key={banner.slug}
                                            onClick={() => handleQuickLink(banner.slug)}
                                            className="group relative overflow-hidden rounded-2xl text-left transition-all duration-200 active:scale-[0.97]"
                                        >
                                            {/* Banner background gradient */}
                                            <div
                                                className={`relative h-28 rounded-2xl bg-gradient-to-br ${banner.gradient} ${banner.border} border overflow-hidden`}
                                                style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.15)" }}
                                            >
                                                {/* Large emoji as visual */}
                                                <div className="absolute -right-2 -bottom-3 text-[72px] opacity-30 group-hover:opacity-40 group-hover:scale-110 transition-all duration-500 select-none">
                                                    {banner.emoji}
                                                </div>
                                                {/* Shimmer overlay */}
                                                <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-white/5" />

                                                {/* Content */}
                                                <div className="relative z-10 p-3.5 flex flex-col justify-between h-full">
                                                    <div>
                                                        <h3 className="text-[15px] font-black text-white leading-tight drop-shadow-md">
                                                            {banner.label}
                                                        </h3>
                                                        <p className="text-[10px] font-semibold text-white/70 mt-0.5 leading-tight">
                                                            {banner.subtitle}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-[10px] font-bold text-white/80">Ver →</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </section>

                        {/* ─── VER TODOS LOS PASILLOS — CTA button ─── */}
                        <section className="px-4 pt-3 pb-4">
                            <button
                                onClick={handleGoToMasterView}
                                className="w-full flex items-center justify-between px-5 py-4 rounded-2xl bg-white/15 backdrop-blur-xl border border-white/25 hover:bg-white/20 transition-all duration-300 active:scale-[0.98]"
                                style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.15)" }}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#10b981]/40 to-[#0ea5e9]/40 border border-[#5eead4]/30 flex items-center justify-center">
                                        <svg className="w-5 h-5 text-[#5eead4]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="3" y="3" width="7" height="7" rx="1" />
                                            <rect x="14" y="3" width="7" height="7" rx="1" />
                                            <rect x="3" y="14" width="7" height="7" rx="1" />
                                            <rect x="14" y="14" width="7" height="7" rx="1" />
                                        </svg>
                                    </div>
                                    <div className="text-left">
                                        <span className="text-[14px] font-bold text-white block">Todos los pasillos</span>
                                        <span className="text-[11px] font-medium text-white/50">{sortedMacros.length} categorías</span>
                                    </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-white/40" />
                            </button>
                        </section>
                    </>
                )}


                {/* ═══════════════════════════════════════════════════════
                    STATE 1: VISTA MAESTRA — Grid of all 14 Macros
                    ═══════════════════════════════════════════════════════ */}
                {navState === "masterView" && (
                    <section className="px-4 py-5">
                        <div className="grid grid-cols-3 gap-3">
                            {sortedMacros.map((macro) => {
                                const macroProductCount = initialProducts.filter(p => {
                                    const subIds = subcategories.filter(s => s.parentId === macro.id).map(s => s.id);
                                    return subIds.includes(p.categoryId);
                                }).length;

                                return (
                                    <button
                                        key={macro.id}
                                        onClick={() => handleMacroSelect(macro.id)}
                                        className="group flex flex-col items-center bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100 p-3 text-center transition-all duration-200 active:scale-[0.95] hover:shadow-lg hover:border-gray-200"
                                        style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}
                                    >
                                        {/* Emoji icon */}
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100/50 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                            <span className="text-2xl">
                                                {macro.icon || "📦"}
                                            </span>
                                        </div>

                                        {/* Name */}
                                        <h3 className="text-[12px] font-bold text-gray-900 leading-tight mb-0.5 line-clamp-2">
                                            {macro.name}
                                        </h3>

                                        {/* Product count */}
                                        <span className="text-[10px] font-semibold text-gray-400">
                                            {macroProductCount}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </section>
                )}


                {/* ═══════════════════════════════════════════════════════
                    STATE 2: DEEP VIEW — Sidebar + Products
                    ═══════════════════════════════════════════════════════ */}
                {navState === "deepView" && (
                    <>
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
                        <div className="flex flex-1 overflow-hidden" style={{ height: "calc(100vh - 140px)" }}>
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

                        <PasillosFab onClick={handleBackToMasterView} />
                    </>
                )}
            </div>

            {/* ═══════════════════════════════════════════════════════
                PRODUCT DETAIL MODAL — Above everything
                ═══════════════════════════════════════════════════════ */}
            {selectedProduct && (
                <ProductDetailModal product={selectedProduct} allProducts={initialProducts} onClose={() => window.history.back()} />
            )}

            {/* ═══════════════════════════════════════════════════════
                BOTTOM NAVIGATION — Always visible (hidden during search)
                ═══════════════════════════════════════════════════════ */}
            {!isSearchActive && (
                <BottomNav
                    activeTab={activeTab}
                    onInicioClick={() => {
                        if (navState !== "home") {
                            setNavState("home");
                            setActiveMacroId(null);
                            setDeepViewSubId(null);
                            setActiveSubId(null);
                        }
                    }}
                    onPasillosClick={handleGoToMasterView}
                    cartCount={cartItemCount}
                />
            )}
        </main>
    );
}
