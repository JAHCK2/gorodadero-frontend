"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { useNavigation } from "@/hooks/useNavigation";
import { usePurchaseHistory } from "@/hooks/usePurchaseHistory";
import { CartItemList } from "@/components/cart/CartItemList";
import { EmptyCart } from "@/components/cart/EmptyCart";
import { formatCOP } from "@/lib/money";
import { MIN_ORDER_DELIVERY } from "@/lib/constants";
import { ArrowLeft, RotateCcw, X, History } from "lucide-react";

export default function CarritoPage() {
    const router = useRouter();
    const { goToMaster } = useNavigation();
    const { history } = usePurchaseHistory();
    const [showHistory, setShowHistory] = useState(false);
    const { items, getTotal, getItemCount } = useCartStore();
    const totalItems = getItemCount();

    if (totalItems === 0) {
        return <EmptyCart />;
    }

    const total = getTotal();
    const missingForMin = Math.max(0, MIN_ORDER_DELIVERY - total);

    return (
        <div className="relative w-full h-[100dvh] overflow-hidden beach-canvas">
            <div className="sun-glare fixed inset-0 z-0 pointer-events-none" />
            <div className="absolute inset-0 z-0 pointer-events-none backdrop-blur-[16px] bg-white/20" />
            
            <div className="w-full h-full flex flex-col flex-1 items-center z-10 relative overflow-hidden">
                <div className="w-full max-w-md flex flex-col h-full relative pt-[68px] pb-[56px] px-3 tracking-tight overflow-hidden">
                
                <header className="fixed top-4 left-0 right-0 mx-auto w-[calc(100%-24px)] max-w-md px-4 py-3 bg-white/95 backdrop-blur-2xl border border-white/50 rounded-2xl z-50 flex items-center shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
                    <button 
                        onClick={() => router.back()} 
                        className="w-9 h-9 flex items-center justify-center rounded-full bg-white/70 hover:bg-white active:scale-95 transition-all text-gray-900 border border-white/60 shadow-sm mr-4"
                    >
                        <ArrowLeft className="w-[18px] h-[18px] text-gray-900" strokeWidth={2.5} />
                    </button>
                    <h1 className="font-extrabold text-2xl text-gray-900 drop-shadow-sm flex-1">
                        Tu Carrito <span className="text-gray-500 font-semibold text-lg ml-1">({totalItems})</span>
                    </h1>

                    {history.length > 0 && (
                        <button 
                            onClick={() => setShowHistory(true)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 text-orange-600 border border-orange-100 hover:bg-orange-100 active:scale-95 transition-all shadow-sm"
                        >
                            <History className="w-[14px] h-[14px]" strokeWidth={2.5} />
                            <span className="text-[11px] font-extrabold uppercase tracking-tight">Historial</span>
                        </button>
                    )}
                </header>
                
                <div className="w-full p-4 flex flex-col gap-4 glass-card shadow-lg flex-1 overflow-hidden mb-2">
                    <div className="bg-white/60 rounded-2xl shadow-sm border border-white h-full overflow-y-auto pb-[180px]">
                        <CartItemList />
                    </div>
                </div>

                <div className="fixed bottom-4 left-0 right-0 mx-auto w-[calc(100%-24px)] max-w-md z-40 flex justify-center pointer-events-none">
                    <div className="w-full pointer-events-auto flex flex-col shadow-[0_12px_40px_rgba(0,0,0,0.12)] bg-white/95 backdrop-blur-2xl border border-white/50 rounded-2xl overflow-hidden">
                        
                        <div className="px-4 py-2.5 flex items-center justify-between">
                            <div className="flex flex-col">
                                <span className="text-gray-500 font-bold text-[12px] mb-0.5">
                                    {missingForMin > 0 ? (
                                        <span className="text-orange-600 font-black tracking-tight flex items-center gap-1">
                                            <span className="text-[10px]">⚠️</span> Faltan {formatCOP(missingForMin)}
                                        </span>
                                    ) : "Total a pagar"}
                                </span>
                                <span className="font-black text-gray-900 text-xl tracking-tight leading-none">{formatCOP(total)}</span>
                            </div>
                            
                            <button 
                                onClick={() => {
                                    if (missingForMin <= 0) {
                                        router.push("/checkout");
                                    } else {
                                        goToMaster();
                                        router.push("/");
                                    }
                                }}
                                className={`px-6 py-2.5 rounded-xl font-black text-[14px] flex items-center justify-center transition-all active:scale-[0.98] ${missingForMin > 0 ? "bg-orange-100 text-orange-700 border border-orange-200" : "bg-[#F97316] text-white shadow-[0_6px_15px_rgba(249,115,22,0.25)] hover:bg-[#EA580C]"}`}
                            >
                                {missingForMin > 0 ? "+ Agregar Más" : "Proceder al Pago"}
                            </button>
                        </div>
                    </div>
                </div>

               </div>

                {/* ===================== MODAL DE HISTORIAL ===================== */}
                {showHistory && (
                    <div className="fixed inset-0 z-[100] flex flex-col justify-end">
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowHistory(false)} />
                        <div className="relative w-full max-w-md mx-auto bg-white rounded-t-[32px] p-6 pb-12 shadow-2xl animate-in slide-in-from-bottom-full duration-300 max-h-[85vh] flex flex-col">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-black text-gray-900 tracking-tight">Tus pedidos</h2>
                                <button onClick={() => setShowHistory(false)} className="p-2 bg-gray-100 rounded-full active:scale-95 hover:bg-gray-200 transition-colors">
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto flex flex-col gap-3">
                                {history.map((order) => {
                                    const date = new Date(order.date);
                                    const dateStr = date.toLocaleDateString('es-CO', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                                    return (
                                        <button
                                            key={order.id}
                                            onClick={() => {
                                                order.items.forEach((item: any) => {
                                                    useCartStore.getState().addItem(item.product);
                                                    if (item.quantity > 1) {
                                                        useCartStore.getState().updateQuantity(item.product.id, item.quantity);
                                                    }
                                                });
                                                setShowHistory(false);
                                            }}
                                            className="px-4 py-3.5 w-full bg-white text-left rounded-2xl shadow-sm border border-gray-200 active:scale-95 transition-transform hover:bg-orange-50 hover:border-orange-200 flex flex-col group"
                                        >
                                            <div className="flex justify-between items-center w-full">
                                                <span className="font-bold text-[14px] text-gray-900 leading-tight group-hover:text-orange-700 transition-colors">Pedido del {dateStr}</span>
                                                <RotateCcw className="w-4 h-4 text-gray-400 group-hover:text-orange-500" />
                                            </div>
                                            <span className="text-[12px] text-gray-500 font-medium mt-1">{order.items.length} items • ${(order.total).toLocaleString('es-CO')}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
