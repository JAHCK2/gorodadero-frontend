"use client";

import { Search, SlidersHorizontal, ChevronDown } from "lucide-react";
import { useState, useRef } from "react";

const filterTags = ["Precio", "Ofertas", "Nacional", "Favoritos"];

export function SearchAndFilters() {
    const [activeFilter, setActiveFilter] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    return (
        <div className="bg-white border-b border-gray-100">
            {/* Search bar */}
            <div className="px-4 py-2.5">
                <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Busca en GoRodadero..."
                        className="w-full h-10 pl-10 pr-4 rounded-xl bg-gray-50 text-sm font-semibold text-foreground placeholder:text-muted-foreground/60 border border-gray-100 outline-none focus:ring-2 focus:ring-go-red/20 focus:border-go-red/30 transition-all"
                        aria-label="Buscar productos"
                    />
                </div>
            </div>

            {/* Filter chips */}
            <div
                ref={scrollRef}
                className="flex items-center gap-2 px-4 pb-2.5 overflow-x-auto"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
                <button className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-xl bg-gray-50 border border-gray-200">
                    <SlidersHorizontal className="w-4 h-4 text-foreground" />
                </button>
                {filterTags.map((tag) => {
                    const isActive = activeFilter === tag;
                    return (
                        <button
                            key={tag}
                            onClick={() => setActiveFilter(isActive ? null : tag)}
                            className={`flex-shrink-0 flex items-center gap-1 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${isActive
                                    ? "bg-go-yellow text-foreground shadow-sm"
                                    : "bg-gray-50 text-foreground border border-gray-200 hover:bg-gray-100"
                                }`}
                        >
                            {tag}
                            {tag === "Precio" && <ChevronDown className="w-3 h-3" />}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
