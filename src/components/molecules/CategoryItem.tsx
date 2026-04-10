export interface CategoryItemData {
    id: string; // Adjusted to string to match V2 Category id
    name: string;
    icon?: string | null;
}

interface CategoryItemProps {
    category: CategoryItemData;
    isActive?: boolean;
    onClick?: (categoryId: string) => void;
}

export function CategoryItem({
    category,
    isActive = false,
    onClick,
}: CategoryItemProps) {
    return (
        <button
            onClick={() => onClick?.(category.id)}
            className="relative w-full flex flex-col items-center gap-1 px-1 py-2.5 transition-all"
        >
            {/* Active indicator — left green bar */}
            {isActive && (
                <div
                    className="absolute inset-0 bg-gradient-to-r from-emerald-400/25 via-emerald-100/15 to-transparent"
                    style={{ borderLeft: "3px solid #10b981" }}
                />
            )}

            {/* Circle icon */}
            <div
                className={`relative z-10 flex items-center justify-center w-11 h-11 rounded-full transition-all ${
                    isActive
                        ? "ring-2 ring-emerald-500 ring-offset-1 bg-white shadow-md"
                        : "bg-white/50"
                }`}
            >
                <span className="text-lg">{category.icon || "📦"}</span>
            </div>

            {/* Name */}
            <span
                className={`relative z-10 text-[9px] leading-tight text-center font-semibold line-clamp-2 max-w-[68px] ${
                    isActive
                        ? "text-emerald-700 font-bold"
                        : "text-gray-600 drop-shadow-sm font-medium"
                }`}
            >
                {category.name}
            </span>
        </button>
    );
}
