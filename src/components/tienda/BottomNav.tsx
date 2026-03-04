// ═══════════════════════════════════════════
// BottomNav — Fixed bottom navigation bar
// Home, Search, Cart
// ═══════════════════════════════════════════

"use client";

import { useCartStore } from "@/store/cartStore";

export default function BottomNav() {
    const count = useCartStore((s) => s.getItemCount());

    return (
        <nav className="bnav" aria-label="Navegación principal">
            {/* Home */}
            <button className="bnav__item bnav__item--active" aria-label="Inicio">
                <svg className="bnav__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
                <span className="bnav__label">Inicio</span>
            </button>

            {/* Search */}
            <button className="bnav__item" aria-label="Buscar">
                <svg className="bnav__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <span className="bnav__label">Buscar</span>
            </button>

            {/* Cart */}
            <button className="bnav__item" aria-label="Carrito">
                <div className="bnav__cart">
                    <svg className="bnav__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                        <line x1="3" y1="6" x2="21" y2="6" />
                        <path d="M16 10a4 4 0 01-8 0" />
                    </svg>
                    {count > 0 && (
                        <span className="bnav__badge">{count}</span>
                    )}
                </div>
                <span className="bnav__label">Carrito</span>
            </button>
        </nav>
    );
}
