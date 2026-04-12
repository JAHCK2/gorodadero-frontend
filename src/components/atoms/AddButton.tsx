"use client";

import { Plus, Check } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export interface AddButtonProps {
    onClick?: (e: React.MouseEvent) => void;
    className?: string;
}

export function AddButton({ onClick, className = "" }: AddButtonProps) {
    const [clicks, setClicks] = useState(0);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onClick?.(e);

        setClicks((prev) => prev + 1);

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // Restablecer después de 1.5s de inactividad
        timeoutRef.current = setTimeout(() => {
            setClicks(0);
        }, 1500);
    };

    // Cleanup del timeout si se desmonta
    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    const isClicked = clicks > 0;

    return (
        <button
            onClick={handleClick}
            className={`relative w-7 h-7 rounded-full shadow-md flex items-center justify-center active:scale-90 transition-all duration-300 ${
                isClicked ? "bg-emerald-500 scale-105" : "bg-[#22c55e]"
            } text-white ${className}`}
            aria-label="Agregar"
        >
            {isClicked ? (
                <Check className="w-4 h-4 animate-in zoom-in duration-200" strokeWidth={3.5} />
            ) : (
                <Plus className="w-5 h-5 animate-in zoom-in" strokeWidth={3} />
            )}

            {/* Globo de cantidad explosiva si > 1 */}
            {clicks > 1 && (
                <span 
                    key={clicks} // Fuerza re-animación en cada click
                    className="absolute -top-1.5 -right-1.5 bg-orange-500 border border-white text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-in zoom-in-50 slide-in-from-bottom-2 duration-200 shadow-sm"
                >
                    {clicks}
                </span>
            )}
        </button>
    );
}
