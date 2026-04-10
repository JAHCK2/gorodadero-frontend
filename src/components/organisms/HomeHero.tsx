import Image from "next/image";
import { MapPin, ChevronRight, Truck } from "lucide-react";
import { GoLogoFull } from "@/components/atoms";
import { SearchBar } from "@/components/molecules";
import { Product } from "@/types/product";

interface HomeHeroProps {
    onCategoriesClick?: () => void;
    onPromoClick?: (slug: string) => void;
    products: Product[];
    isSearchActive?: boolean;
    onSearchActiveChange: (active: boolean) => void;
    onProductSelect?: (product: any) => void;
}

export function HomeHero({ onCategoriesClick, onPromoClick, products, isSearchActive = false, onSearchActiveChange, onProductSelect }: HomeHeroProps) {
    const PROMO_BANNERS = [
        { slug: "cervezas", label: "Cervezas", image: "/images/cat-cervezas.webp" },
        { slug: "gaseosas", label: "Gaseosas", image: "/images/cat-gaseosas.webp" },
        { slug: "aguas", label: "Aguas", image: "/images/cat-aguas.webp" },
        { slug: "snacks", label: "Snacks", image: "/images/cat-snacks.webp" },
        { slug: "licores", label: "Licores", image: "/images/cat-licores.webp" },
        { slug: "lacteos", label: "Lácteos", image: "/images/cat-lacteos.webp" },
    ];

    return (
        <div className="relative w-full pb-[100px] font-inter">


            <div className="relative z-10 w-full flex flex-col items-center pt-5 px-4 max-w-md mx-auto">
                <section className={`w-full pb-2 transition-all duration-500 ${isSearchActive ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'}`}>
                    {/* Top bar: location + online indicator */}
                    <div className="flex flex-row items-center justify-between mb-6">
                        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-lg border border-white/20 hover:bg-white/25 transition-all duration-300 active:scale-95">
                            <MapPin className="w-3 h-3 text-[#5eead4]" />
                            <span className="text-[11px] font-bold text-white/90">El Rodadero, Santa Marta</span>
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
                            <div className="absolute inset-0 scale-[1.8] bg-white/10 rounded-full blur-[40px] pointer-events-none" />
                            <GoLogoFull className="relative w-48 h-auto drop-shadow-[0_6px_32px_rgba(0,0,0,0.35)]" />
                        </div>
                    </div>

                    {/* Slogan */}
                    <div className="flex items-center justify-center gap-3 mb-3">
                        <svg className="w-4 h-4 text-[#5eead4]/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" /><path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" /><path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" /></svg>
                        <p className="text-[11px] font-extrabold text-white tracking-[0.25em] uppercase drop-shadow-[0_1px_4px_rgba(0,0,0,0.3)]">Tu super en minutos</p>
                        <svg className="w-4 h-4 text-[#5eead4]/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" /><path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" /><path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" /></svg>
                    </div>
                </section>

                {/* Real SearchBar Molecule */}
                <div className="w-full mb-4 mt-2 relative z-50">
                    <SearchBar products={products} onActiveChange={onSearchActiveChange} onProductSelect={onProductSelect} />
                </div>

                {/* Badges - Premium V1 ones restored */}
                <div className={`flex justify-center items-center gap-2 mb-6 w-full px-2 transition-all duration-500 delay-75 ${isSearchActive ? 'opacity-0 translate-y-4 pointer-events-none' : 'opacity-100 translate-y-0'}`}>
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

                {/* "Lo más pedido" Grid */}
                <section className={`w-full pt-1 pb-2 transition-all duration-500 delay-100 ${isSearchActive ? 'opacity-0 translate-y-8 pointer-events-none' : 'opacity-100 translate-y-0'}`}>
                    <div
                        className="w-full rounded-3xl p-4 bg-[#3fbfbf]/30 backdrop-blur-2xl border border-white/20"
                        style={{ boxShadow: "inset 4px 4px 12px rgba(255,255,255,0.15), inset -4px -4px 12px rgba(0,0,0,0.15), 0 8px 32px rgba(0,0,0,0.10)" }}
                    >
                        <div className="flex items-center justify-between mb-3 px-1">
                            <h2 className="text-[16px] font-black text-white tracking-tight drop-shadow-sm">Lo más pedido</h2>
                            <button onClick={onCategoriesClick} className="flex items-center gap-0.5 text-[12px] font-bold text-white/70 hover:text-white transition-colors">
                                Ver todo <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                        </div>

                        <div className="grid grid-cols-3 gap-2.5">
                            {PROMO_BANNERS.map((banner) => (
                                <button key={banner.slug} onClick={() => onPromoClick?.(banner.slug)} className="group flex flex-col items-center transition-transform duration-200 active:scale-[0.95]">
                                    <div
                                        className="relative w-full aspect-square rounded-2xl overflow-hidden bg-white/90 border border-white/30 mb-1.5"
                                        style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.5)" }}
                                    >
                                        <Image
                                            src={banner.image}
                                            alt={banner.label}
                                            fill
                                            className="object-contain p-1 group-hover:scale-105 transition-transform duration-500"
                                            sizes="(max-width: 448px) 33vw, 140px"
                                        />
                                    </div>
                                    <span className="text-[12px] font-bold text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.4)]">{banner.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Todos los pasillos Button */}
                <section className={`w-full pt-4 pb-4 transition-all duration-500 delay-150 ${isSearchActive ? 'opacity-0 translate-y-8 pointer-events-none' : 'opacity-100 translate-y-0'}`}>
                    <button
                        onClick={onCategoriesClick}
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
                                <span className="text-[11px] font-medium text-white/50">17 categorías</span>
                            </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-white/40" />
                    </button>
                </section>
            </div>
        </div>
    );
}
