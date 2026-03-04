// ═══════════════════════════════════════════
// CategoryBubbles — Instagram Stories / Rappi circles
// ═══════════════════════════════════════════

"use client";

import type { Category } from "@/types/product";

interface Props {
    categories: Category[];
    active: string | null;
    onSelect: (id: string | null) => void;
}

// Emoji + color for each category
const BUBBLE_CONFIG: Record<string, { emoji: string; bg: string }> = {
    aceites: { emoji: "🫒", bg: "#FEF9C3" },
    aromaticas: { emoji: "🍵", bg: "#DCFCE7" },
    aseo: { emoji: "🧹", bg: "#E0E7FF" },
    bebidas: { emoji: "🥤", bg: "#FCE7F3" },
    belleza: { emoji: "💄", bg: "#FDE2E4" },
    carnes: { emoji: "🥩", bg: "#FECDD3" },
    cereales: { emoji: "🌾", bg: "#FEF3C7" },
    conservas: { emoji: "🥫", bg: "#FFE4E6" },
    endulzantes: { emoji: "🍯", bg: "#FEF9C3" },
    enlatados: { emoji: "🥫", bg: "#E0E7FF" },
    ferreteria: { emoji: "🔧", bg: "#E5E7EB" },
    frutas: { emoji: "🍎", bg: "#DCFCE7" },
    granos: { emoji: "🫘", bg: "#FED7AA" },
    harinas: { emoji: "🌾", bg: "#FEF3C7" },
    huevos: { emoji: "🥚", bg: "#FEF9C3" },
    lacteos: { emoji: "🥛", bg: "#DBEAFE" },
    licores: { emoji: "🍺", bg: "#FDE68A" },
    otros: { emoji: "📦", bg: "#F3F4F6" },
    panaderia: { emoji: "🍞", bg: "#FEF3C7" },
    pastas: { emoji: "🍝", bg: "#FDE68A" },
    salud: { emoji: "💊", bg: "#DCFCE7" },
    sazonadores: { emoji: "🧂", bg: "#FEF9C3" },
    snacks: { emoji: "🍿", bg: "#FDE68A" },
    utensilios: { emoji: "🍽️", bg: "#E5E7EB" },
    verduras: { emoji: "🥬", bg: "#DCFCE7" },
};

const defaultBubble = { emoji: "🛒", bg: "#F3F4F6" };

function cap(s: string) { return s.charAt(0).toUpperCase() + s.slice(1); }

export default function CategoryBubbles({ categories, active, onSelect }: Props) {
    return (
        <section className="cats">
            <div className="cats__scroll">
                {/* "Todos" bubble */}
                <div className="cats__item">
                    <button
                        className={`cats__circle ${active === null ? "cats__circle--active" : ""}`}
                        style={{ background: active === null ? "#EEF2FF" : "#F3F4F6" }}
                        onClick={() => onSelect(null)}
                        aria-label="Todos los productos"
                    >
                        🏠
                    </button>
                    <span className={`cats__label ${active === null ? "cats__label--active" : ""}`}>
                        Todos
                    </span>
                </div>

                {categories.map((c) => {
                    const cfg = BUBBLE_CONFIG[c.slug || c.name.toLowerCase()] || defaultBubble;
                    const isActive = active === c.id;
                    return (
                        <div key={c.id} className="cats__item">
                            <button
                                className={`cats__circle ${isActive ? "cats__circle--active" : ""}`}
                                style={{ background: cfg.bg }}
                                onClick={() => onSelect(c.id)}
                                aria-label={cap(c.name)}
                            >
                                {cfg.emoji}
                            </button>
                            <span className={`cats__label ${isActive ? "cats__label--active" : ""}`}>
                                {cap(c.name)}
                            </span>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
