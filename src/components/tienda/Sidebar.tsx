"use client";

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

export function Sidebar({ categories, activeCategory, onSelect, useIdForSelection = false }: SidebarProps) {
    return (
        <div
            className="w-[85px] flex-shrink-0 bg-white overflow-y-auto border-r border-gray-100"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
            {categories.map((cat) => {
                const isActive = useIdForSelection
                    ? activeCategory === cat.id
                    : activeCategory === cat.name;

                return (
                    <button
                        key={cat.id || cat.name}
                        onClick={() => onSelect(useIdForSelection ? cat.id : cat.name)}
                        className={`relative w-full flex flex-col items-center gap-1.5 px-1 py-3 transition-all`}
                    >
                        {/* Active indicator bar (green, left side) */}
                        {isActive && (
                            <div className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full bg-emerald-500" />
                        )}

                        {/* Category image circle */}
                        <div
                            className={`flex items-center justify-center w-12 h-12 rounded-full overflow-hidden transition-all ${isActive
                                    ? "ring-2 ring-emerald-500 ring-offset-1"
                                    : "bg-gray-50"
                                }`}
                        >
                            <span className="text-xl">
                                {cat.icon || "📦"}
                            </span>
                        </div>

                        {/* Category name */}
                        <span
                            className={`text-[10px] leading-tight text-center font-semibold transition-colors line-clamp-2 max-w-[72px] ${isActive ? "text-emerald-600 font-bold" : "text-gray-600"
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
