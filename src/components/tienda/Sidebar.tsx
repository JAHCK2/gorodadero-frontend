"use client";

import { useRef, useEffect } from "react";

interface SidebarCategory {
    id: string;
    name: string;
    icon: string | null;
}

interface SidebarProps {
    categories: SidebarCategory[];
    activeCategory: string;
    onSelect: (idOrName: string) => void;
    useIdForSelection?: boolean;
}

/**
 * Sidebar — Left-side vertical navigation for Deep View.
 * Active category gets a full-width green diffused band + ring on circle.
 * Auto-scrolls to keep active button centered in viewport.
 */
export function Sidebar({ categories, activeCategory, onSelect, useIdForSelection = false }: SidebarProps) {
    const buttonRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

    // Auto-scroll the active button into view (centered in sidebar)
    useEffect(() => {
        if (!activeCategory) return;
        const btn = buttonRefs.current.get(activeCategory);
        if (btn) {
            btn.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    }, [activeCategory]);

    return (
        <div
            className="w-[85px] flex-shrink-0 bg-white overflow-y-auto border-r border-gray-100"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
            {categories.map((cat) => {
                const key = useIdForSelection ? cat.id : cat.name;
                const isActive = activeCategory === key;

                return (
                    <button
                        key={cat.id || cat.name}
                        ref={(el) => {
                            if (el) buttonRefs.current.set(key, el);
                            else buttonRefs.current.delete(key);
                        }}
                        onClick={() => onSelect(key)}
                        className={`
                            relative w-full flex flex-col items-center gap-1.5 px-1 py-3 transition-all
                            ${isActive ? "bg-emerald-50/80" : ""}
                        `}
                    >
                        {/* Active: full-width diffused green band from left edge */}
                        {isActive && (
                            <div
                                className="absolute inset-0 bg-gradient-to-r from-emerald-400/30 via-emerald-100/40 to-transparent"
                                style={{ borderLeft: "4px solid #10b981" }}
                            />
                        )}

                        {/* Category image circle */}
                        <div
                            className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full overflow-hidden transition-all ${isActive
                                    ? "ring-[2.5px] ring-emerald-500 ring-offset-2 bg-white shadow-md"
                                    : "bg-gray-50"
                                }`}
                        >
                            <span className="text-xl">
                                {cat.icon || "📦"}
                            </span>
                        </div>

                        {/* Category name */}
                        <span
                            className={`relative z-10 text-[10px] leading-tight text-center font-semibold transition-colors line-clamp-2 max-w-[72px] ${isActive
                                    ? "text-emerald-700 font-bold"
                                    : "text-gray-500"
                                }`}
                        >
                            {cat.name}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}
