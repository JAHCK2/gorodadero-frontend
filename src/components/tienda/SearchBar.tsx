"use client";

import { useState, useRef, useEffect } from "react";
import { Search, Truck } from "lucide-react";

/* ════════════════════════════════════════════════════════════════════
   SearchBar — In-flow transparent bar + fixed overlay on scroll
   Uses IntersectionObserver to avoid dual-bar overlap.
   ════════════════════════════════════════════════════════════════════ */

interface SearchBarProps {
    /** Pass `true` when component is mounted (STATE 0). Resets observer on unmount. */
    active?: boolean;
}

export function SearchBar({ active = true }: SearchBarProps) {
    const [showFixedSearch, setShowFixedSearch] = useState(false);
    const searchSentinelRef = useRef<HTMLDivElement>(null);

    // IntersectionObserver — triggers fixed copy ONLY when in-flow bar exits viewport
    useEffect(() => {
        if (!active) {
            setShowFixedSearch(false);
            return;
        }
        const sentinel = searchSentinelRef.current;
        if (!sentinel) return;
        const observer = new IntersectionObserver(
            ([entry]) => setShowFixedSearch(!entry.isIntersecting),
            { threshold: 0 }
        );
        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [active]);

    return (
        <>
            {/* ═══════════════════════════════════════════════════════
                IN-FLOW SEARCH — Scrolls naturally with hero
                ═══════════════════════════════════════════════════════ */}
            <div ref={searchSentinelRef} className="px-5 pt-1 pb-4">
                {/* Search pill — transparent glass over beach */}
                <div className="relative flex items-center h-[50px] rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 shadow-[0_2px_16px_rgba(0,0,0,0.08)]">
                    <div className="absolute left-3.5 flex items-center justify-center w-8 h-8 rounded-xl bg-white/20">
                        <Search className="w-4 h-4 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]" />
                    </div>
                    <input
                        type="text"
                        placeholder="¿Qué necesitas hoy?"
                        className="w-full h-full pl-14 pr-5 bg-transparent text-sm font-bold text-white placeholder:text-white/70 outline-none rounded-2xl drop-shadow-[0_1px_2px_rgba(0,0,0,0.2)]"
                        readOnly
                    />
                </div>

                {/* Delivery chips */}
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

            {/* ═══════════════════════════════════════════════════════
                FIXED OVERLAY — Slides in when in-flow bar exits viewport
                ═══════════════════════════════════════════════════════ */}
            <div
                className={`fixed top-0 left-0 right-0 z-[45] transition-all duration-300 ease-out ${showFixedSearch
                    ? 'translate-y-0 opacity-100'
                    : '-translate-y-full opacity-0 pointer-events-none'
                    }`}
            >
                <div className="max-w-md mx-auto px-5 pt-[max(12px,env(safe-area-inset-top))] pb-3">
                    <div className="relative flex items-center h-[50px] rounded-2xl bg-white/80 backdrop-blur-2xl border border-white/70 shadow-[0_4px_20px_rgba(0,0,0,0.1)]">
                        <div className="absolute left-3.5 flex items-center justify-center w-8 h-8 rounded-xl bg-[#5eead4]/15">
                            <Search className="w-4 h-4 text-[#0d9488]" />
                        </div>
                        <input
                            type="text"
                            placeholder="¿Qué necesitas hoy?"
                            className="w-full h-full pl-14 pr-5 bg-transparent text-sm font-bold text-[#1e293b] placeholder:text-[#94a3b8] outline-none rounded-2xl"
                        />
                    </div>
                </div>
            </div>
        </>
    );
}
