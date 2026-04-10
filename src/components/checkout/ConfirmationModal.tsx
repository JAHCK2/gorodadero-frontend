"use client";

// ═══════════════════════════════════════════
// ConfirmationModal — Modal post-orden
// Muestra confirmación, resumen, botón WhatsApp
// ═══════════════════════════════════════════

import { useState, useEffect } from "react";
import { CheckCircle, MessageCircle, Home } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useRouter } from "next/navigation";
import { formatCOP } from "@/lib/money";

interface ConfirmationModalProps {
    orderId: string;
    total: number;
    paymentMethod: string;
    whatsappUrl: string;
    onClose: () => void;
}

/** Labels para métodos de pago */
const PAYMENT_LABELS: Record<string, string> = {
    efectivo: "💵 Efectivo",
    nequi: "💜 Nequi",
    daviplata: "❤️ Daviplata",
    transferencia: "🏦 Transferencia",
};

export function ConfirmationModal({ orderId, total, paymentMethod, whatsappUrl, onClose }: ConfirmationModalProps) {
    const clearCart = useCartStore((s) => s.clearCart);
    const router = useRouter();
    const [entering, setEntering] = useState(true);
    const [checkVisible, setCheckVisible] = useState(false);

    const shortId = `GR-${orderId.slice(0, 6).toUpperCase()}`;
    const paymentLabel = PAYMENT_LABELS[paymentMethod] || paymentMethod;

    // Limpiar carrito y animar entrada
    useEffect(() => {
        clearCart();
        requestAnimationFrame(() => {
            setEntering(false);
            setTimeout(() => setCheckVisible(true), 300);
        });
    }, [clearCart]);

    const handleGoHome = () => {
        onClose();
        router.push("/");
    };

    const handleWhatsApp = () => {
        window.open(whatsappUrl, "_blank");
    };

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-6">
            {/* Backdrop */}
            <div
                className={`absolute inset-0 bg-black transition-opacity duration-300 ${entering ? "opacity-0" : "opacity-50"}`}
            />

            {/* Modal */}
            <div
                className={`relative bg-white rounded-3xl p-6 max-w-[340px] w-full shadow-2xl text-center transition-all duration-500 ${
                    entering ? "scale-90 opacity-0" : "scale-100 opacity-100"
                }`}
            >
                {/* Checkmark animado */}
                <div className="relative mx-auto mb-4">
                    <div
                        className={`w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mx-auto transition-all duration-500 ${
                            checkVisible ? "scale-100" : "scale-0"
                        }`}
                    >
                        <CheckCircle
                            className={`w-12 h-12 text-emerald-500 transition-all duration-500 delay-200 ${
                                checkVisible ? "scale-100 opacity-100" : "scale-0 opacity-0"
                            }`}
                            strokeWidth={1.5}
                        />
                    </div>
                    {/* Particles */}
                    {checkVisible && (
                        <>
                            <div className="absolute top-0 left-6 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                            <div className="absolute top-4 right-4 w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping delay-100" />
                            <div className="absolute bottom-2 left-8 w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping delay-200" />
                        </>
                    )}
                </div>

                <h2 className="text-xl font-black text-gray-900 mb-1">
                    ¡Pedido Confirmado!
                </h2>
                <p className="text-sm text-gray-500 font-medium mb-4">
                    Tu pedido ha sido registrado
                </p>

                {/* Resumen breve */}
                <div className="bg-gray-50 rounded-2xl p-4 mb-5 text-left">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-gray-500">Orden</span>
                        <span className="text-sm font-black text-gray-900">{shortId}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-gray-500">Total</span>
                        <span className="text-sm font-black text-gray-900">{formatCOP(total)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-gray-500">Pago</span>
                        <span className="text-sm font-bold text-gray-700">{paymentLabel}</span>
                    </div>
                </div>

                {/* Botón principal: WhatsApp */}
                <button
                    onClick={handleWhatsApp}
                    className="w-full py-3.5 bg-[#25D366] text-white font-bold text-sm rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-[#25D366]/30 active:scale-[0.97] transition-all mb-3 hover:bg-[#20BD5A]"
                >
                    <MessageCircle className="w-5 h-5" />
                    Enviar Pedido por WhatsApp
                </button>

                <p className="text-[11px] text-gray-400 font-medium mb-4">
                    Te confirmaremos tu pedido y datos de pago por WhatsApp
                </p>

                {/* Botón secundario: volver */}
                <button
                    onClick={handleGoHome}
                    className="w-full py-3 bg-gray-100 text-gray-700 font-bold text-sm rounded-2xl flex items-center justify-center gap-2 active:scale-[0.97] transition-all hover:bg-gray-200"
                >
                    <Home className="w-4.5 h-4.5" />
                    Volver a la tienda
                </button>
            </div>
        </div>
    );
}
