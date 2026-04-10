import { Category } from "@/types/product";

export interface MasterGridProps {
    macroCategories: Category[];
    onSelect: (categoryId: string) => void;
}

export function MasterGrid({ macroCategories, onSelect }: MasterGridProps) {
    const sorted = [...macroCategories].sort((a, b) => a.sortOrder - b.sortOrder);

    return (
        <section className="px-4 py-5 font-inter">
            <div className="grid grid-cols-3 gap-3">
                {sorted.map((macro) => (
                    <button
                        key={macro.id}
                        onClick={() => onSelect(macro.id)}
                        className="group flex flex-col items-center justify-center rounded-2xl border border-white/40 p-3 text-center transition-all duration-200 active:scale-[0.95] hover:shadow-lg h-[120px]"
                        style={{
                            background: "rgba(255,255,255,0.55)",
                            backdropFilter: "blur(16px) saturate(1.3)",
                            WebkitBackdropFilter: "blur(16px) saturate(1.3)",
                            boxShadow: "0 4px 20px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.5)",
                        }}
                    >
                        <div className="w-12 h-12 rounded-xl bg-white/60 border border-white/40 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                            <span className="text-2xl">{macro.icon || "📦"}</span>
                        </div>
                        <h3 className="text-[12px] font-bold text-gray-900 leading-tight mb-0.5 max-h-[36px] overflow-hidden overflow-ellipsis display-[webkit-box] webkit-line-clamp-2 webkit-box-orient-vertical">
                            {macro.name}
                        </h3>
                    </button>
                ))}
            </div>
        </section>
    );
}
