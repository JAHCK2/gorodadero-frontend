"use client";

// ═══════════════════════════════════════════
// CustomerForm — Datos del cliente
// Nombre, teléfono, notas. Autofocus en nombre.
// ═══════════════════════════════════════════

import { useRef, useEffect } from "react";
import { User, Phone, MessageSquare } from "lucide-react";

export interface CustomerData {
    customerName: string;
    customerPhone: string;
    notes: string;
}

interface CustomerFormProps {
    data: CustomerData;
    errors: Record<string, string>;
    onChange: (data: CustomerData) => void;
}

export function CustomerForm({ data, errors, onChange }: CustomerFormProps) {
    const nameRef = useRef<HTMLInputElement>(null);

    // Autofocus en el campo nombre al montar
    useEffect(() => {
        nameRef.current?.focus();
    }, []);

    const handleChange = (field: keyof CustomerData, value: string) => {
        onChange({ ...data, [field]: value });
    };

    return (
        <section className="px-4 pt-4 pb-2">
            <h2 className="text-base font-extrabold text-gray-900 mb-3 flex items-center gap-2">
                <User className="w-4.5 h-4.5 text-emerald-500" />
                Datos del cliente
            </h2>

            {/* Nombre */}
            <div className="mb-3">
                <label htmlFor="checkout-name" className="block text-xs font-bold text-gray-500 mb-1">
                    Nombre *
                </label>
                <input
                    ref={nameRef}
                    id="checkout-name"
                    type="text"
                    placeholder="¿Cómo te llamas?"
                    value={data.customerName}
                    onChange={(e) => handleChange("customerName", e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl bg-gray-50 border text-sm font-medium text-gray-900 placeholder:text-gray-400 outline-none transition-colors focus:ring-2 focus:ring-emerald-500/30 ${
                        errors.customerName
                            ? "border-red-300 focus:border-red-400"
                            : "border-gray-200 focus:border-emerald-400"
                    }`}
                    autoComplete="name"
                />
                {errors.customerName && (
                    <p className="text-xs text-red-500 font-semibold mt-1">{errors.customerName}</p>
                )}
            </div>

            {/* Teléfono */}
            <div className="mb-3">
                <label htmlFor="checkout-phone" className="block text-xs font-bold text-gray-500 mb-1">
                    Teléfono *
                </label>
                <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        id="checkout-phone"
                        type="tel"
                        placeholder="300 123 4567"
                        value={data.customerPhone}
                        onChange={(e) => handleChange("customerPhone", e.target.value)}
                        className={`w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 border text-sm font-medium text-gray-900 placeholder:text-gray-400 outline-none transition-colors focus:ring-2 focus:ring-emerald-500/30 ${
                            errors.customerPhone
                                ? "border-red-300 focus:border-red-400"
                                : "border-gray-200 focus:border-emerald-400"
                        }`}
                        autoComplete="tel"
                    />
                </div>
                {errors.customerPhone && (
                    <p className="text-xs text-red-500 font-semibold mt-1">{errors.customerPhone}</p>
                )}
            </div>

            {/* Notas */}
            <div className="mb-1">
                <label htmlFor="checkout-notes" className="block text-xs font-bold text-gray-500 mb-1 flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5" />
                    Notas (opcional)
                </label>
                <textarea
                    id="checkout-notes"
                    placeholder="Instrucciones especiales, referencias de la dirección..."
                    value={data.notes}
                    onChange={(e) => handleChange("notes", e.target.value)}
                    rows={2}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm font-medium text-gray-900 placeholder:text-gray-400 outline-none transition-colors focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/30 resize-none"
                />
            </div>
        </section>
    );
}
