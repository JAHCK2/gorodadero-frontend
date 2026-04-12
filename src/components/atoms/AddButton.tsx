"use client";

import { Plus, Check } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export interface AddButtonProps {
    onClick?: (e: React.MouseEvent) => void;
    className?: string;
    quantityInCart?: number;
}

export function AddButton({ onClick, className = "", quantityInCart = 0 }: AddButtonProps) {
    const [bump, setBump] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Trigger visual bump precisely when cart quantity increases
    const prevQty = useRef(quantityInCart);
    useEffect(() => {
        if (quantityInCart > prevQty.current) {
            setBump(true);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            timeoutRef.current = setTimeout(() => setBump(false), 300);
        }
        prevQty.current = quantityInCart;
    }, [quantityInCart]);

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onClick?.(e);
        // We do not manage local clicks. Global state quantityInCart will surge instantly
        // which triggers the useEffect and makes the component visually respond.
    };

    const isAdded = quantityInCart > 0;

    return (
        <button
            onClick={handleClick}
            className={`relative w-7 h-7 rounded-full shadow-md flex items-center justify-center active:scale-90 transition-all duration-300 ${
                isAdded ? "bg-emerald-500 ring-2 ring-emerald-500/30" : "bg-[#22c55e]"
            } text-white ${bump ? 'scale-110' : 'scale-100'} ${className}`}
            aria-label="Agregar"
        >
            {isAdded ? (
                <Check className="w-4 h-4 animate-in zoom-in duration-200" strokeWidth={3.5} />
            ) : (
                <Plus className="w-5 h-5 animate-in zoom-in" strokeWidth={3} />
            )}

            {/* Persistent Cart Quantity Badge */}
            {isAdded && quantityInCart > 1 && (
                <span 
                    key={quantityInCart} // Force bubble re-animation exactly when quantity updates
                    className="absolute -top-1.5 -right-1.5 bg-orange-500 border border-white text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-in zoom-in-50 slide-in-from-bottom-2 duration-200 shadow-sm"
                >
                    {quantityInCart}
                </span>
            )}
        </button>
    );
}
