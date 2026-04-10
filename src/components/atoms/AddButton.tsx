"use client";

import { Plus } from "lucide-react";

export interface AddButtonProps {
    onClick?: (e: React.MouseEvent) => void;
    className?: string;
}

export function AddButton({ onClick, className = "" }: AddButtonProps) {
    return (
        <button
            onClick={(e) => {
                e.stopPropagation();
                onClick?.(e);
            }}
            className={`w-7 h-7 rounded-full bg-[#22c55e] shadow-md flex items-center justify-center text-white active:scale-90 transition-transform ${className}`}
            aria-label="Agregar"
        >
            <Plus className="w-5 h-5" strokeWidth={3} />
        </button>
    );
}
