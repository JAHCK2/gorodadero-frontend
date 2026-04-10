"use client";

import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { useNavigation } from "@/hooks/useNavigation";
import { CartItemList } from "@/components/cart/CartItemList";
import { EmptyCart } from "@/components/cart/EmptyCart";
import { formatCOP } from "@/lib/money";
import { MIN_ORDER_DELIVERY } from "@/lib/constants";
import { ArrowLeft } from "lucide-react";

export default function CarritoPage() {
    const router = useRouter();
    const { goToMaster } = useNavigation();
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
                    <h1 className="font-extrabold text-2xl text-gray-900 drop-shadow-sm">Tu Carrito <span className="text-gray-500 font-semibold text-lg ml-1">({totalItems})</span></h1>
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
            </div>
        </div>
    );
}
