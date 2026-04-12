"use client";

// ═══════════════════════════════════════════
// EmptyCart — Estado vacío del carrito
// Muestra mensaje + CTA para explorar tienda
// ═══════════════════════════════════════════

import { ShoppingCart, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { BottomNav } from "@/components/organisms/BottomNav";
import { usePurchaseHistory } from "@/hooks/usePurchaseHistory";
import { useCartStore } from "@/store/cartStore";
import { useNavigation } from "@/hooks/useNavigation";

export function EmptyCart() {
    const router = useRouter();
    const { goHome } = useNavigation();
    const { history } = usePurchaseHistory();
    const { addItem, updateQuantity } = useCartStore();

    const handleRepeatOrder = (order: any) => {
        if (!order) return;
        
        order.items.forEach((item: any) => {
            addItem(item.product);
            if (item.quantity > 1) {
                updateQuantity(item.product.id, item.quantity);
            }
        });
        // No redirigimos. Al actualizar Zustand, el componente CarritoPage detectará 
        // que hay items y desmontará este EmptyCart automáticamente revelando el carrito.
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[75vh] px-6 text-center">
            {/* Premium Decorative Icon */}
            <div className="relative mb-8">
                <div className="w-32 h-32 rounded-full bg-orange-50 flex items-center justify-center shadow-[inset_0_-4px_10px_rgba(0,0,0,0.02)]">
                    <ShoppingCart className="w-16 h-16 text-orange-400" strokeWidth={1.5} />
                </div>
                {/* Micro-animations and floating specs */}
                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-blue-100 shadow-sm animate-pulse" />
                <div className="absolute bottom-2 -left-3 w-4 h-4 rounded-full bg-yellow-100 shadow-sm" />
            </div>

            <h2 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">
                Tu carrito está vacío
            </h2>
            <p className="text-[15px] text-gray-500 mb-8 max-w-[280px] leading-relaxed">
                Parece que aún no has encontrado lo que buscas. ¡Veamos los pasillos!
            </p>

            <button
                onClick={() => {
                    goHome();
                    router.push("/");
                }}
                className="px-8 py-4 w-full max-w-[240px] bg-[#F97316] text-white font-black text-base rounded-[20px] shadow-[0_8px_20px_rgba(249,115,22,0.3)] active:scale-95 transition-transform hover:bg-[#EA580C]"
            >
                Explorar Tienda
            </button>

            {history.length > 0 && (
                <div className="w-full max-w-[320px] mt-8 flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Tus últimos pedidos</p>
                    <div className="flex flex-col gap-2.5 w-full">
                        {history.map((order, i) => {
                            const date = new Date(order.date);
                            const dateStr = date.toLocaleDateString('es-CO', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                            return (
                                <button
                                    key={order.id}
                                    onClick={() => handleRepeatOrder(order)}
                                    className="px-4 py-3 w-full bg-white text-gray-700 font-bold text-[14px] rounded-2xl shadow-sm border border-gray-200 active:scale-95 transition-transform hover:bg-orange-50 hover:border-orange-200 flex items-center justify-between group"
                                >
                                    <div className="flex flex-col items-start text-left">
                                        <span className="text-gray-900 leading-tight group-hover:text-orange-700 transition-colors">Pedido del {dateStr}</span>
                                        <span className="text-[11px] text-gray-500 font-medium">{order.items.length} items • ${(order.total).toLocaleString('es-CO')}</span>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-orange-100 group-hover:text-orange-600 transition-colors">
                                        <RotateCcw className="w-4 h-4" strokeWidth={2.5} />
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            <BottomNav />
        </div>
    );
}
