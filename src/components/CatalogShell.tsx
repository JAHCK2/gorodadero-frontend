"use client";

import { useState, useEffect, useRef } from "react";
import { useNavigation } from "@/hooks/useNavigation";
import { useScrollSpy } from "@/hooks/useScrollSpy";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { CategorySidebar, MasterGrid, ProductBottomSheet, HomeHero, BottomNav, SubcategoryCarousel } from "@/components/organisms";
import { ProductCard, CartSummaryBar, SearchBar } from "@/components/molecules";
import { GoLogo } from "@/components/atoms";
import { Category, Product } from "@/types/product";
import { useCartStore } from "@/store/cartStore";

export function CatalogShell({ categories, products }: { categories: Category[], products: Product[] }) {
    const router = useRouter();
    const nav = useNavigation();
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [isSearchActive, setIsSearchActive] = useState(false);
    const [deepViewSubId, setDeepViewSubId] = useState<string | null>(null);
    const [clickedSubId, setClickedSubId] = useState<string | null>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Scroll Reset: Ensure we never inherit scroll state across different views
    useEffect(() => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTo(0, 0);
        }
    }, [nav.navState]);

    const macros = categories.filter(c => !c.parentId);

    const handleSelectMacro = (id: string) => {
        nav.goToDeepView(id);
        setDeepViewSubId(null);
    };

    // Subcategories hook: ROOT FIX - Only load subcategories that ACTUALLY have products
    const activeMacroSubsRaw = nav.activeMacro ? categories.filter(c => c.parentId === nav.activeMacro).sort((a,b) => a.sortOrder - b.sortOrder) : [];
    const activeMacroSubs = activeMacroSubsRaw.filter(sub => products.some(p => p.categoryId === sub.id));
    
    const subIds = activeMacroSubs.map(c => c.id);
    const activeScrolledSub = useScrollSpy(subIds, 120);

    // Aggressive Prefetching for Checkout to eliminate delay
    useEffect(() => {
        // Pre-carga agresiva del carrito en segundo plano si ya hay productos
        const checkCartAndPrefetch = () => {
            const count = useCartStore.getState().getItemCount();
            if (count > 0) {
                router.prefetch("/carrito");
            }
        };
        checkCartAndPrefetch();
        // Escucha cambios en el carrito
        const unsub = useCartStore.subscribe(checkCartAndPrefetch);
        return () => unsub();
    }, [router]);

    // History API — Intercept Android back button
    useEffect(() => {
        const handlePopState = () => {
            if (isSearchActive) return; // Prevent navigation if search overlay is open
            if (selectedProduct !== null) return; // Prevent navigation if product sheet is open

            const currentNavState = useNavigation.getState().navState;
            if (currentNavState === 'deepView') {
                useNavigation.getState().setActiveMacro(null);
                useNavigation.getState().setActiveSub(null);
                useNavigation.getState().setNavStateTo('masterView');
            } else if (currentNavState === 'masterView') {
                useNavigation.getState().setNavStateTo('home');
            }
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [isSearchActive, selectedProduct]);

    const handleQuickLink = (slug: string) => {
        const normalizedSlug = slug.toLowerCase();

        // 1. Exact macro match
        const exactMacro = macros.find(m =>
            m.slug === normalizedSlug ||
            m.slug === `macro-${normalizedSlug}` ||
            m.id === `macro-${normalizedSlug}`
        );
        if (exactMacro) {
            nav.goToDeepView(exactMacro.id);
            setDeepViewSubId(null);
            return;
        }

        // 2. Exact subcategory match — if it hits, go to parent macro with scroll to sub
        const exactSub = categories.find(c =>
            c.parentId !== null && (
                c.slug === normalizedSlug ||
                c.slug === `${normalizedSlug}-sub`
            )
        );
        if (exactSub && exactSub.parentId) {
            nav.goToDeepView(exactSub.parentId);
            setDeepViewSubId(null);
            setTimeout(() => {
                const el = document.getElementById(`cat-${exactSub.id}`);
                el?.scrollIntoView({ behavior: 'smooth' });
            }, 300);
            return;
        }

        // 3. Fuzzy subcategory match — slug is START of the sub slug (e.g. "gaseosas" matches "gaseosas-y-maltas")
        const fuzzySub = categories.find(c =>
            c.parentId !== null &&
            c.slug.startsWith(normalizedSlug)
        );
        if (fuzzySub && fuzzySub.parentId) {
            nav.goToDeepView(fuzzySub.parentId);
            setDeepViewSubId(null);
            setTimeout(() => {
                const el = document.getElementById(`cat-${fuzzySub.id}`);
                el?.scrollIntoView({ behavior: 'smooth' });
            }, 300);
            return;
        }

        // 4. Fuzzy macro match — slug is START of the macro slug (e.g. "lacteos" matches "lacteos-y-huevos")
        const fuzzyMacro = macros.find(m =>
            m.slug.startsWith(normalizedSlug)
        );
        if (fuzzyMacro) {
            nav.goToDeepView(fuzzyMacro.id);
            setDeepViewSubId(null);
            return;
        }

        // 5. Last resort — slug is CONTAINED anywhere in a macro slug
        const containsMacro = macros.find(m =>
            m.slug.includes(normalizedSlug)
        );
        if (containsMacro) {
            nav.goToDeepView(containsMacro.id);
            setDeepViewSubId(null);
            return;
        }
    };

    const renderView = () => {
        if (nav.navState === "home" || nav.navState === "masterView") {
            return (
                <div className="w-full min-h-[100dvh] bg-transparent flex flex-col items-center">
                    {nav.navState === "masterView" && (
                        <div className="w-full flex flex-col items-center pt-8 pb-4 relative z-0">
                            {/* Rappi Turbo Style Header over Background */}
                            <button onClick={nav.goHome} className="absolute left-4 top-8 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center active:scale-95 transition-transform z-10">
                                <ArrowLeft className="w-5 h-5 text-gray-900" strokeWidth={3} />
                            </button>
                            <GoLogo className="w-[160px] drop-shadow-[0_4px_16px_rgba(0,0,0,0.15)] mb-3" />
                            <div className="bg-black/50 backdrop-blur-md border border-white/10 text-white px-5 py-1.5 rounded-full text-[13px] font-black flex items-center shadow-xl tracking-wide">
                                <span className="mr-1.5 opacity-90 text-[15px]">⚡</span> Entrega en <span className="ml-1 text-emerald-400">15-20 min</span>
                            </div>
                        </div>
                    )}
                    
                    <div className="w-full max-w-md bg-transparent min-h-[100dvh]">
                        {nav.navState === "home" ? (
                            <HomeHero 
                                products={products}
                                isSearchActive={isSearchActive}
                                onSearchActiveChange={setIsSearchActive}
                                onCategoriesClick={nav.goToMaster} 
                                onPromoClick={handleQuickLink}
                                onProductSelect={setSelectedProduct}
                                categoriesCount={macros.length}
                            />
                        ) : (
                            <div className="relative w-full flex flex-col items-center">
                                {/* Search Bar floats natively over the beach */}
                                <div className="w-full pb-4 relative z-10">
                                    <SearchBar products={products} onActiveChange={setIsSearchActive} compact={false} onProductSelect={setSelectedProduct} />
                                </div>
                                {/* Solid background for the grid simulating the white screen of Rappi below the banner */}
                                <div 
                                    className="w-full rounded-t-[32px] pt-10 pb-32 min-h-screen shadow-[0_-8px_40px_rgba(0,0,0,0.08)] border-t border-white/60"
                                    style={{
                                        background: "rgba(255, 255, 255, 0.45)",
                                        backdropFilter: "blur(40px) saturate(1.5)",
                                        WebkitBackdropFilter: "blur(40px) saturate(1.5)"
                                    }}
                                >
                                    <MasterGrid macroCategories={macros} onSelect={handleSelectMacro} />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        if (nav.navState === "deepView" && nav.activeMacro) {
            return (
                <div className="w-full h-full overflow-hidden flex justify-center bg-transparent">
                    <div className="w-full max-w-md flex h-[100dvh] overflow-hidden bg-transparent relative">
                        <CategorySidebar 
                            categories={activeMacroSubs} 
                            activeCategoryId={clickedSubId || activeScrolledSub || nav.activeSub || subIds[0]} 
                            onSelect={(id) => {
                                setClickedSubId(id);
                                nav.setActiveSub(id);
                                const el = document.getElementById(`cat-${id}`);
                                const container = document.querySelector('.flex-1.overflow-y-auto');
                                if (el && container) {
                                    // Medida experimental solicitada: 55
                                    const headerOffset = 55; 
                                    const topPos = el.offsetTop - headerOffset;
                                    container.scrollTo({ top: topPos, behavior: 'smooth' });
                                }
                                setTimeout(() => setClickedSubId(null), 850);
                            }} 
                        />
                        <div 
                            className="flex-1 overflow-y-auto pb-[100px] no-scrollbar relative bg-transparent"
                            style={{ overscrollBehaviorY: 'contain' }}
                        >
                            <header className="sticky top-0 bg-white z-40 py-1.5 px-3 border-b border-gray-200 flex items-center justify-between shadow-sm min-h-[44px]">
                                <div className="flex items-center gap-2">
                                    <button onClick={() => {
                                        if (deepViewSubId) {
                                            setDeepViewSubId(null);
                                        } else {
                                            nav.goToMaster();
                                        }
                                    }} className="w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-gray-100/50 hover:bg-gray-50 transition-all duration-200 active:scale-95">
                                        <ArrowLeft className="w-[18px] h-[18px] text-gray-900" strokeWidth={2.5} />
                                    </button>
                                    <h1 className="font-bold text-gray-800 tracking-tight text-[15px] ml-1">
                                        {deepViewSubId ? activeMacroSubs.find(s => s.id === deepViewSubId)?.name : macros.find(m => m.id === nav.activeMacro)?.name}
                                    </h1>
                                </div>
                                <SearchBar products={products} onActiveChange={setIsSearchActive} compact compactTheme="dark" onProductSelect={setSelectedProduct} />
                            </header>
                            
                            <div className="pt-1 pb-4 pl-3 flex flex-col gap-1">
                                {deepViewSubId === null ? (
                                    <>
                                        {activeMacroSubs.map((sub, index) => {
                                            const subProducts = products.filter(p => p.categoryId === sub.id);
                                            
                                            // isLast ahora es 100% preciso, garantizando que el minHeight de anclaje se aplique siempre
                                            const isLast = index === activeMacroSubs.length - 1;

                                            return (
                                                <div 
                                                    key={sub.id} 
                                                    id={`cat-wrapper-${sub.id}`}
                                                    style={{ minHeight: isLast ? 'calc(100dvh - 160px)' : 'auto' }}
                                                >
                                                    <SubcategoryCarousel
                                                        subcategoryId={sub.id}
                                                        subcategoryName={sub.name}
                                                        products={subProducts}
                                                        onProductClick={setSelectedProduct}
                                                        onSeeMore={() => {
                                                            setDeepViewSubId(sub.id);
                                                            // Hacer scroll al tope de la vista extendida
                                                            document.querySelector('.flex-1.overflow-y-auto')?.scrollTo(0, 0);
                                                        }}
                                                    />
                                                </div>
                                            );
                                        })}
                                    </>
                                ) : (
                                    // VISTA EXTENDIDA DE UNA SOLA SUBCATEGORÍA
                                    <div className="grid grid-cols-2 gap-3 pb-4">
                                        {products.filter(p => p.categoryId === deepViewSubId).map(p => (
                                            <ProductCard key={p.id} product={p} onTap={setSelectedProduct} onAdd={() => useCartStore.getState().addItem(p)} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* The floating Secciones button was removed as it was visually distracting and redundant with the sticky top Back arrow. */}
                    </div>
                </div>
            );
        }

        return null;
    };

    return (
        <div className="relative w-full h-[100dvh] overflow-hidden beach-canvas">
            {/* Dynamic visual effects base */}
            <div className="sun-glare absolute z-0" />
            <div className={`absolute inset-0 z-0 pointer-events-none transition-all duration-700 ease-in-out ${nav.navState !== 'home' ? 'backdrop-blur-[16px] bg-white/20' : 'backdrop-blur-none bg-transparent'}`} />

            <div 
                ref={scrollContainerRef}
                className={`w-full h-full flex justify-center z-10 relative ${nav.navState === 'deepView' ? 'overflow-hidden' : 'overflow-y-auto'}`}
            >
                {renderView()}
            </div>
            
            <ProductBottomSheet 
                product={selectedProduct} 
                onClose={() => setSelectedProduct(null)} 
                allProducts={products}
                onSelectProduct={setSelectedProduct}
                onAdd={(p, qty) => {
                    const store = useCartStore.getState();
                    const existingQty = store.getItemQuantity(p.id);
                    if (existingQty > 0) {
                        store.updateQuantity(p.id, existingQty + qty);
                    } else {
                        store.addItem(p);
                        if (qty > 1) {
                            store.updateQuantity(p.id, qty);
                        }
                    }
                }}
            />
            {nav.navState === "deepView" && <CartSummaryBar hidden={selectedProduct !== null || isSearchActive} onCheckout={() => router.push("/carrito")} />}
            {(!isSearchActive && (nav.navState === "home" || nav.navState === "masterView")) && <BottomNav />}
        </div>
    );
}
