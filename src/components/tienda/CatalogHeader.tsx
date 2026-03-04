"use client";

import { Search, ChevronLeft } from "lucide-react";
import { LogoGoOficial } from "./LogoGoOficial";

export function CatalogHeader({ onBack }: { onBack?: () => void }) {
    return (
        <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100">
            <div className="flex items-center gap-3">
                {onBack && (
                    <button
                        onClick={onBack}
                        className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-gray-100 transition-colors"
                        aria-label="Volver"
                    >
                        <ChevronLeft className="w-5 h-5 text-foreground" />
                    </button>
                )}
                {/* Integrating our custom SVG rendering Logo */}
                <LogoGoOficial className="w-20 h-auto" />
            </div>
            <button
                className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Buscar"
            >
                <Search className="w-5 h-5 text-foreground" />
            </button>
        </header>
    );
}
