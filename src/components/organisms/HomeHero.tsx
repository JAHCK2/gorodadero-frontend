import Image from "next/image";
import { MapPin, ChevronRight, Truck, LayoutGrid } from "lucide-react";
import { GoLogoFull } from "@/components/atoms";
import { SearchBar } from "@/components/molecules";
import { Product } from "@/types/product";
import { useRouter } from "next/navigation";
import { useRef } from "react";

interface HomeHeroProps {
    onCategoriesClick?: () => void;
    onPromoClick?: (slug: string) => void;
    products: Product[];
    isSearchActive?: boolean;
    onSearchActiveChange: (active: boolean) => void;
    onProductSelect?: (product: any) => void;
    categoriesCount?: number;
}

export function HomeHero({ onCategoriesClick, onPromoClick, products, isSearchActive = false, onSearchActiveChange, onProductSelect, categoriesCount = 17 }: HomeHeroProps) {
    const router = useRouter();
    const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const clickCountRef = useRef(0);

    const handleLogoClick = () => {
        clickCountRef.current += 1;
        if (clickCountRef.current >= 3) {
            router.push('/admin');
            clickCountRef.current = 0;
        }
        if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
        clickTimeoutRef.current = setTimeout(() => {
            clickCountRef.current = 0;
        }, 1000);
    };

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


            <div className="relative z-10 w-full flex flex-col items-center pt-1 px-4 max-w-md mx-auto">
                <section className={`w-full pb-1 transition-all duration-500 ${isSearchActive ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'}`}>
                    {/* Top bar: location + online indicator */}
                    <div className="flex flex-row items-center justify-between mb-1.5">
                        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-lg border border-white/20 hover:bg-white/25 transition-all duration-300 active:scale-95">
                            <MapPin className="w-3 h-3 text-[#5eead4]" />
                            <span className="text-[11px] font-bold text-white/90">El Rodadero, Santa Marta</span>
                            <ChevronRight className="w-3 h-3 text-white/40 rotate-90" />
                        </button>
                        <div className="flex flex-col items-end gap-1">
                            <a 
                                href="https://www.instagram.com/gorodadero.co?igsh=MXJnanNsaWx6eWtiYw=="
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#f9ce34]/30 via-[#ee2a7b]/30 to-[#6228d7]/30 backdrop-blur-md border border-white/20 hover:from-[#f9ce34]/45 hover:via-[#ee2a7b]/45 hover:to-[#6228d7]/45 active:scale-95 transition-all duration-300 shadow-sm"
                            >
                                <svg className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
                                </svg>
                                <span className="text-[10px] font-black text-white tracking-wider uppercase">Instagram</span>
                            </a>
                            <span className="text-[9px] font-black tracking-widest text-[#5eead4] uppercase px-2 py-0.5 rounded-full bg-black/40 border border-[#5eead4]/40 shadow-sm">
                                v2.6-live
                            </span>
                        </div>
                    </div>

                    {/* Centered logo */}
                    <div className="flex flex-col items-center text-center mb-0.5">
                        <button onClick={handleLogoClick} className="relative outline-none active:scale-95 transition-transform">
                            <div className="absolute inset-0 scale-[1.6] bg-white/10 rounded-full blur-[25px] pointer-events-none" />
                            <GoLogoFull className="relative w-40 h-auto drop-shadow-[0_4px_24px_rgba(0,0,0,0.3)]" />
                        </button>
                    </div>

                    {/* Slogan */}
                    <div className="flex items-center justify-center gap-2 mb-0.5">
                        <svg className="w-3.5 h-3.5 text-[#5eead4]/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" /><path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" /><path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" /></svg>
                        <p className="text-[10px] font-extrabold text-white tracking-[0.25em] uppercase drop-shadow-[0_1px_3px_rgba(0,0,0,0.3)]">Tu super en minutos</p>
                        <svg className="w-3.5 h-3.5 text-[#5eead4]/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" /><path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" /><path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" /></svg>
                    </div>
                </section>

                {/* Real SearchBar Molecule */}
                <div className="w-[92%] mb-2 mt-0 relative z-50">
                    <SearchBar products={products} onActiveChange={onSearchActiveChange} onProductSelect={onProductSelect} />
                </div>

                {/* Badges - Premium V1 ones restored */}
                <div className={`flex justify-center items-center gap-2 mb-2 w-full px-2 transition-all duration-500 delay-75 ${isSearchActive ? 'opacity-0 translate-y-4 pointer-events-none' : 'opacity-100 translate-y-0'}`}>
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.15] backdrop-blur-md border border-white/25">
                        <Truck className="w-3 h-3 text-[#fbbf24]" />
                        <span className="text-[10px] font-bold text-white">24/7</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.15] backdrop-blur-md border border-white/25">
                        <svg className="w-3 h-3 text-[#5eead4]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
                        <span className="text-[10px] font-bold text-white">15 min</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.15] backdrop-blur-md border border-white/25">
                        <svg className="w-3 h-3 text-[#f87171]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                        <span className="text-[10px] font-bold text-white">Seguro</span>
                    </div>
                </div>

                {/* "Lo más pedido" Grid */}
                <section className={`w-full pt-0 pb-1.5 transition-all duration-500 delay-100 ${isSearchActive ? 'opacity-0 translate-y-8 pointer-events-none' : 'opacity-100 translate-y-0'}`}>
                    <div
                        className="w-full rounded-3xl p-3 bg-[#3fbfbf]/30 backdrop-blur-2xl border border-white/20"
                        style={{ boxShadow: "inset 4px 4px 12px rgba(255,255,255,0.15), inset -4px -4px 12px rgba(0,0,0,0.15), 0 8px 32px rgba(0,0,0,0.10)" }}
                    >
                        <div className="flex items-center justify-between mb-2 px-1">
                            <h2 className="text-[15px] font-black text-white tracking-tight drop-shadow-sm">Lo más pedido</h2>
                            <button onClick={onCategoriesClick} className="flex items-center gap-0.5 text-[11px] font-bold text-white/70 hover:text-white transition-colors">
                                Ver todo <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                            {PROMO_BANNERS.map((banner) => (
                                <button key={banner.slug} onClick={() => onPromoClick?.(banner.slug)} className="group flex flex-col items-center transition-transform duration-200 active:scale-[0.95]">
                                    <div
                                        className="relative w-full aspect-square rounded-2xl overflow-hidden bg-white/90 border border-white/30 mb-1"
                                        style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.5)" }}
                                    >
                                        <Image
                                            src={banner.image}
                                            alt={banner.label}
                                            fill
                                            className="object-contain p-1 group-hover:scale-105 transition-transform duration-500"
                                            sizes="(max-width: 448px) 33vw, 140px"
                                        />
                                    </div>
                                    <span className="text-[11px] font-bold text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.4)]">{banner.label}</span>
                                </button>
                            ))}
                        </div>

                        {/* Todos los pasillos Button integrated inside the card */}
                        <button
                            onClick={onCategoriesClick}
                            className="w-full flex items-center justify-between mt-3.5 px-4 py-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/15 transition-all duration-300 active:scale-[0.98]"
                            style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.1)" }}
                        >
                            <div className="flex items-center gap-3">
                                <LayoutGrid className="w-5 h-5 text-[#5eead4]" />
                                <div className="flex items-center gap-2.5">
                                    <span className="text-[15px] font-black text-white tracking-wide">Todos los pasillos</span>
                                    <span className="flex items-center justify-center px-2.5 py-0.5 text-[12px] font-black rounded-full bg-white text-slate-950 shadow-sm">
                                        {categoriesCount}
                                    </span>
                                </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-white/40" />
                        </button>
                    </div>
                </section>

            </div>
        </div>
    );
}
