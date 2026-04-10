"use client";

import { useRef, useEffect } from "react";
import { CategoryItem } from "@/components/molecules";
import { Category } from "@/types/product";

export interface CategorySidebarProps {
    categories: Category[];
    activeCategoryId: string | null;
    onSelect: (categoryId: string) => void;
}

export function CategorySidebar({ categories, activeCategoryId, onSelect }: CategorySidebarProps) {
    const buttonRefs = useRef<Map<string, HTMLDivElement>>(new Map());

    useEffect(() => {
        if (!activeCategoryId) return;
        const btn = buttonRefs.current.get(activeCategoryId);
        if (btn) {
            // Find the overflow-y-auto container for the sidebar
            const container = btn.closest('.overflow-y-auto') as HTMLElement;
            if (container) {
                // Calculate position to center the button in the container
                const btnTop = btn.offsetTop;
                const containerHeight = container.clientHeight;
                const scrollPos = btnTop - (containerHeight / 2) + (btn.clientHeight / 2);
                container.scrollTo({ top: scrollPos, behavior: 'smooth' });
            }
        }
    }, [activeCategoryId]);

    return (
        <div
            className="w-[85px] h-full pb-32 flex-shrink-0 overflow-y-auto"
            style={{
                background: "linear-gradient(180deg, rgba(255,255,255,0.30) 0%, rgba(255,255,255,0.50) 50%, rgba(255,255,255,0.40) 100%)",
                backdropFilter: "blur(20px) saturate(1.4)",
                WebkitBackdropFilter: "blur(20px) saturate(1.4)",
                borderRight: "1px solid rgba(255,255,255,0.3)",
                scrollbarWidth: "none",
                msOverflowStyle: "none",
                overscrollBehavior: "contain",
            }}
        >
            {categories.map((cat) => (
                <div 
                    key={cat.id} 
                    ref={(el) => {
                        if (el) buttonRefs.current.set(cat.id, el);
                        else buttonRefs.current.delete(cat.id);
                    }}
                >
                    <CategoryItem 
                        category={cat} 
                        isActive={activeCategoryId === cat.id} 
                        onClick={onSelect} 
                    />
                </div>
            ))}
        </div>
    );
}
