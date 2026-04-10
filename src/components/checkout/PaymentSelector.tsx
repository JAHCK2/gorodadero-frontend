"use client";

// ═══════════════════════════════════════════
// PaymentSelector — Selector de método de pago
// Tarjetas tipo Rappi: Efectivo, Nequi, Daviplata, Transferencia
// ═══════════════════════════════════════════

import { CreditCard, DollarSign } from "lucide-react";
import type { PaymentMethod } from "@/types/order";

interface PaymentSelectorProps {
    selected: PaymentMethod | null;
    error: string | null;
    onChange: (method: PaymentMethod) => void;
}

interface PaymentOption {
    id: PaymentMethod;
    label: string;
    emoji: string;
    description: string;
    color: string;
    bgColor: string;
}

const PAYMENT_OPTIONS: PaymentOption[] = [
    {
        id: "efectivo",
        label: "Efectivo",
        emoji: "💵",
        description: "Pago contra entrega",
        color: "text-emerald-600",
        bgColor: "bg-emerald-50 border-emerald-200",
    },
    {
        id: "nequi",
        label: "Nequi",
        emoji: "💜",
        description: "Te enviamos el QR",
        color: "text-purple-600",
        bgColor: "bg-purple-50 border-purple-200",
    },
    {
        id: "daviplata",
        label: "Daviplata",
        emoji: "❤️",
        description: "Te enviamos el número",
        color: "text-red-600",
        bgColor: "bg-red-50 border-red-200",
    },
    {
        id: "transferencia",
        label: "Transferencia",
        emoji: "🏦",
        description: "Datos bancarios por WhatsApp",
        color: "text-blue-600",
        bgColor: "bg-blue-50 border-blue-200",
    },
];

export function PaymentSelector({ selected, error, onChange }: PaymentSelectorProps) {
    return (
        <section className="px-4 pt-4 pb-2">
            <h2 className="text-base font-extrabold text-gray-900 mb-3 flex items-center gap-2">
                <CreditCard className="w-4.5 h-4.5 text-emerald-500" />
                Método de pago
            </h2>

            <div className="grid grid-cols-2 gap-2.5">
                {PAYMENT_OPTIONS.map((option) => {
                    const isSelected = selected === option.id;
                    return (
                        <button
                            key={option.id}
                            onClick={() => onChange(option.id)}
                            className={`relative flex flex-col items-center gap-1 p-4 rounded-2xl border-2 transition-all active:scale-[0.97] ${
                                isSelected
                                    ? `${option.bgColor} border-current ${option.color} shadow-sm`
                                    : "bg-white border-gray-200 text-gray-700 hover:border-gray-300"
                            }`}
                        >
                            {/* Indicador de selección */}
                            {isSelected && (
                                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-current flex items-center justify-center">
                                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                            )}

                            <span className="text-2xl">{option.emoji}</span>
                            <span className="text-sm font-extrabold leading-tight">{option.label}</span>
                            <span className={`text-[10px] font-semibold leading-tight ${isSelected ? "opacity-80" : "text-gray-400"}`}>
                                {option.description}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Info según método seleccionado */}
            {selected && selected !== "efectivo" && (
                <div className="mt-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
                    <p className="text-xs text-blue-700 font-semibold flex items-center gap-1.5">
                        <DollarSign className="w-3.5 h-3.5" />
                        Te enviaremos los datos de pago por WhatsApp
                    </p>
                </div>
            )}

            {/* Error */}
            {error && (
                <p className="text-xs text-red-500 font-semibold mt-2">{error}</p>
            )}
        </section>
    );
}
