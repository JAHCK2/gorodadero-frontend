"use client";

import { X, Heart, Sparkles, Gift, Utensils, Smartphone, Apple, Beef, Cross } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface PasilloCategory {
    name: string;
    icon: LucideIcon;
}

const pasilloCategories: PasilloCategory[] = [
    { name: "Favoritos", icon: Heart },
    { name: "Ofertas", icon: Sparkles },
    { name: "Eventos", icon: Gift },
    { name: "Comidas Listas", icon: Utensils },
    { name: "Tech & Gadgets", icon: Smartphone },
    { name: "Nuevos", icon: Sparkles },
];

export function PasillosModal({ onClose }: { onClose: () => void }) {
    return (
        <div className="fixed inset-0 z-[60] flex items-end justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onClose}
            />
            {/* Sheet */}
            <div className="relative w-full max-w-md bg-white rounded-t-3xl px-5 pt-5 pb-8 animate-in slide-in-from-bottom duration-300">
                {/* Close */}
                <div className="flex items-center justify-between mb-5">
                    <button
                        onClick={onClose}
                        className="flex items-center justify-center w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                        aria-label="Cerrar"
                    >
                        <X className="w-4 h-4 text-foreground" />
                    </button>
                    <h2 className="text-base font-black text-foreground">Pasillos</h2>
                    <div className="w-9" />
                </div>

                {/* Count */}
                <p className="text-lg font-black text-foreground mb-5">
                    {"+2500 productos para ti!"}
                </p>

                {/* Grid of pasillos */}
                <div className="grid grid-cols-4 gap-4">
                    {pasilloCategories.map((cat) => {
                        const Icon = cat.icon;
                        return (
                            <button
                                key={cat.name}
                                className="flex flex-col items-center gap-2 group"
                            >
                                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 border-2 border-gray-200 hover:border-go-red/40 hover:bg-go-red/5 transition-all">
                                    <Icon className="w-6 h-6 text-muted-foreground group-hover:text-go-red transition-colors" />
                                </div>
                                <span className="text-[10px] font-bold text-foreground text-center leading-tight">
                                    {cat.name}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Category quick links */}
                <div className="mt-6">
                    <h3 className="text-base font-black text-foreground mb-3">Fruver</h3>
                    <div className="grid grid-cols-4 gap-3">
                        {[
                            { name: "Frutas", icon: Apple },
                            { name: "Verduras", icon: Beef },
                            { name: "Tubérculos", icon: Cross },
                            { name: "Packs", icon: Gift },
                        ].map((item) => {
                            const Icon = item.icon;
                            return (
                                <button
                                    key={item.name}
                                    className="flex flex-col items-center gap-1.5 group"
                                >
                                    <div className="flex items-center justify-center w-14 h-14 rounded-full bg-gray-50 border border-gray-200 hover:border-go-red/30 transition-all">
                                        <Icon className="w-5 h-5 text-muted-foreground group-hover:text-go-red transition-colors" />
                                    </div>
                                    <span className="text-[9px] font-bold text-foreground text-center leading-tight">
                                        {item.name}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
