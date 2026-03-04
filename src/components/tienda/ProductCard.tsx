// ═══════════════════════════════════════════
// ProductCard — Horizontal layout (Rappi-style)
// Image left, info right, floating + button
// ═══════════════════════════════════════════

"use client";

import { useState } from "react";
import type { Product } from "@/types/product";
import { useCartStore } from "@/store/cartStore";

function fmt(n: number) {
    return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(n);
}

interface Props {
    product: Product;
    catName?: string;
    idx?: number;
}

export default function ProductCard({ product, catName, idx = 0 }: Props) {
    const addItem = useCartStore((s) => s.addItem);
    const [added, setAdded] = useState(false);

    const handleAdd = (e: React.MouseEvent) => {
        e.stopPropagation();
        addItem(product);
        setAdded(true);
        setTimeout(() => setAdded(false), 500);
    };

    return (
        <div
            className="pCard fadeUp"
            style={{ animationDelay: `${Math.min(idx * 20, 150)}ms` }}
        >
            {/* Image — left side */}
            <div className="pCard__img">
                {product.image_url ? (
                    <img
                        src={product.image_url}
                        alt={product.name}
                        className="pCard__photo"
                        loading="lazy"
                    />
                ) : (
                    <div className="pCard__ph">
                        <span className="pCard__phGo">GO</span>
                        <svg className="pCard__phIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
                        </svg>
                    </div>
                )}
            </div>

            {/* Info — right side */}
            <div className="pCard__info">
                {catName && <span className="pCard__cat">{catName}</span>}
                <h3 className="pCard__name">{product.name}</h3>
                <span className="pCard__price">{fmt(Number(product.sell_price))}</span>
            </div>

            {/* Floating add button */}
            <button
                className={`pCard__add ${added ? "pCard__add--ok" : ""}`}
                onClick={handleAdd}
                aria-label={`Añadir ${product.name}`}
            >
                {added ? "✓" : "+"}
            </button>
        </div>
    );
}
