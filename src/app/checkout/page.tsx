"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { usePurchaseHistory } from "@/hooks/usePurchaseHistory";
import { useNavigation } from "@/hooks/useNavigation";
import { MIN_ORDER_DELIVERY } from "@/lib/constants";
import { generateWhatsAppLink } from "@/lib/whatsapp";
import { ArrowLeft, MapPin, Navigation, Banknote, Smartphone, CheckCircle2, ChevronRight, Edit2, ShoppingBag, Copy, Check, Download } from "lucide-react";
import { formatCOP } from "@/lib/money";
import { EmptyCart } from "@/components/cart/EmptyCart";

type CheckoutStep = 1 | 2 | 3 | 4;
type PaymentCategory = 'efectivo' | 'transferencia';
type DigitalMethod = 'nequi' | 'breb' | 'qr' | 'datafono' | '';

export default function CheckoutPage() {
    const router = useRouter();
    const { items, getTotal, getItemCount, clearCart } = useCartStore();
    const { saveOrder } = usePurchaseHistory();
    const { goHome } = useNavigation();
    const [mounted, setMounted] = useState(false);
    const phoneRef = useRef<HTMLInputElement>(null);
    const addressRef = useRef<HTMLInputElement>(null);
    
    const [step, setStep] = useState<CheckoutStep>(1);
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");
    const [lat, setLat] = useState("");
    const [lng, setLng] = useState("");
    const [paymentCategory, setPaymentCategory] = useState<PaymentCategory>('efectivo');
    const [digitalMethod, setDigitalMethod] = useState<DigitalMethod>('');
    const [billAmount, setBillAmount] = useState<string>("");
    const [isQuickBill, setIsQuickBill] = useState(false);
    const [gpsLoading, setGpsLoading] = useState(false);
    const [gpsError, setGpsError] = useState("");
    const [copied, setCopied] = useState(false);

    const copyNumber = () => {
        navigator.clipboard.writeText('3045293384').then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        });
    };

    const downloadQR = async () => {
        try {
            const res = await fetch('/qr_pago.jpg');
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'QR_Pago_GoRodadero.jpg';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        setMounted(true);
        const cachedName = localStorage.getItem("gorodadero_name");
        const cachedPhone = localStorage.getItem("gorodadero_phone");
        const cachedAddress = localStorage.getItem("gorodadero_address");
        if (cachedName) setName(cachedName);
        if (cachedPhone) setPhone(cachedPhone);
        if (cachedAddress) setAddress(cachedAddress);
    }, []);

    if (!mounted) return null;

    const totalItems = getItemCount();
    const total = getTotal();

    if (totalItems === 0 && step !== 4) {
        return <EmptyCart />;
    }

    if (total < MIN_ORDER_DELIVERY && step !== 4) {
        router.replace("/carrito");
        return null;
    }

    const requestGPS = () => {
        setGpsLoading(true);
        setGpsError("");
        if (!navigator.geolocation) { setGpsError("Tu navegador no soporta GPS."); setGpsLoading(false); return; }
        navigator.geolocation.getCurrentPosition(
            (pos) => { setLat(pos.coords.latitude.toString()); setLng(pos.coords.longitude.toString()); setGpsLoading(false); },
            (err) => { console.error(err); setGpsError(err.code === 1 ? "⚠️ Debes dar permiso de ubicación." : "⚠️ No se pudo obtener la ubicación. Activa tu GPS."); setGpsLoading(false); },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
        );
    };

    const handleNextStep1 = () => {
        if (!name.trim() || phone.replace(/\D/g, '').length < 10 || !address.trim() || !lat || !lng) return;
        localStorage.setItem("gorodadero_name", name);
        localStorage.setItem("gorodadero_phone", phone);
        localStorage.setItem("gorodadero_address", address);
        setStep(2);
    };

    // Step 3 validation
    const parsedBill = parseInt(billAmount.replace(/\D/g, '')) || 0;
    const billTooLow = paymentCategory === 'efectivo' && billAmount !== '' && parsedBill > 0 && parsedBill < total;
    const missingAmount = billTooLow ? total - parsedBill : 0;
    const canProceedStep3 = paymentCategory === 'efectivo' ? (!!billAmount && parsedBill >= total) : !!digitalMethod;

    const handleNextStep3 = () => { if (!canProceedStep3) return; setStep(3); };

    const handleFinish = () => {
        let finalBill = parseInt(billAmount.replace(/\D/g, '')) || total;
        const paymentFinal = paymentCategory === 'efectivo' ? 'efectivo' : digitalMethod;
        const link = generateWhatsAppLink(
            { clientName: name, phone, address, lat, lng, paymentMethod: paymentFinal as any, billAmount: finalBill },
            items, total
        );

        // FASE FIRE-AND-FORGET: Notificación en background al correo de jahck2
        const now = new Date();
        const orderNum = '#' + (now.getMonth() + 1).toString().padStart(2, '0') +
            now.getDate().toString().padStart(2, '0') +
            now.getHours().toString().padStart(2, '0') +
            now.getMinutes().toString().padStart(2, '0');

        fetch('/api/send-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                clientName: name,
                orderNum,
                phone,
                address,
                lat,
                lng,
                paymentMethod: paymentFinal,
                items,
                total
            })
        }).catch(err => console.warn('Error disparando notificacion de pedido:', err));

        saveOrder(items, total);
        window.open(link, '_blank');
        clearCart();
        setStep(4);
    };

    // Step validation for bottom bar
    const step1Valid = name.trim().length > 0 && phone.replace(/\D/g, '').length >= 10 && address.trim().length > 0 && !!lat && !!lng;

    // Bottom bar config per step
    const bottomBarConfig: Record<CheckoutStep, { label: string, disabled: boolean, action: () => void }> = {
        1: { label: 'Continuar a Pago', disabled: !step1Valid, action: handleNextStep1 },
        2: { 
            label: billTooLow ? 'Monto insuficiente' : 
                   (paymentCategory === 'efectivo' && !billAmount) ? 'Falta ingresar billete' : 
                   (paymentCategory === 'transferencia' && !digitalMethod) ? 'Elige método digital' : 
                   'Revisar Pedido', 
            disabled: !canProceedStep3, 
            action: handleNextStep3 
        },
        3: { label: 'Enviar por WhatsApp', disabled: false, action: handleFinish },
        4: { label: '', disabled: true, action: () => {} }
    };

    const bar = bottomBarConfig[step];

    return (
        <div className="w-full h-[100dvh] beach-canvas flex flex-col items-center relative" style={{ overflowY: 'auto' }}>
            <div className="sun-glare absolute inset-0 z-0 pointer-events-none" />
            <div className="absolute inset-0 z-0 pointer-events-none backdrop-blur-[16px] bg-white/20 fixed" />
            
            <div className="w-full max-w-md flex flex-col flex-1 relative z-10 px-3 pb-[140px] pt-1">
                
                {/* Header Sticky */}
                <header className="sticky top-0 z-50 w-full px-4 py-2 bg-white/95 backdrop-blur-2xl border border-white/50 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] mt-1.5">
                    <div className="flex items-center mb-1.5">
                        <button onClick={() => step === 1 ? router.back() : setStep((s) => (s - 1) as CheckoutStep)} className="w-7 h-7 flex items-center justify-center rounded-full bg-white/70 hover:bg-white active:scale-95 transition-all text-gray-900 border border-white/60 shadow-sm">
                            <ArrowLeft className="w-4 h-4 text-gray-900" strokeWidth={2.5} />
                        </button>
                        <h1 className="font-extrabold text-[19px] text-gray-900 drop-shadow-sm ml-3 tracking-tight">Finalizar Pedido</h1>
                    </div>
                    <div className="flex justify-between items-center gap-2">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex-1"><div className={`h-1.5 w-full rounded-full transition-all duration-300 shadow-sm ${step >= i ? 'bg-[#F97316] shadow-orange-500/50' : 'bg-gray-300'}`} /></div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-1.5 text-[9px] font-bold text-gray-500 uppercase tracking-wider">
                        <span className={step >= 1 ? 'text-gray-900' : ''}>Datos</span>
                        <span className={step >= 2 ? 'text-gray-900' : ''}>Pago</span>
                        <span className={step >= 3 ? 'text-gray-900' : ''}>Resumen</span>
                    </div>
                </header>

                <main className="p-5 flex flex-col flex-1 glass-card rounded-b-none border-b-0 animate-in fade-in slide-in-from-right-4 duration-300 backdrop-blur-xl mt-3">
                    
                    {/* ================= STEP 1: CONTACTO ================= */}
                    {step === 1 && (
                        <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-right-8 duration-300">
                            <div>
                                <h2 className="text-lg font-extrabold text-gray-900 drop-shadow-sm mb-0.5">Tus datos de entrega</h2>
                                <p className="text-[13px] text-gray-600 font-medium">Completa para continuar al pago.</p>
                            </div>
                            <div className="flex flex-col gap-3">
                                <div className="flex flex-col">
                                    <label className="text-[11px] font-bold text-gray-800 mb-1 uppercase tracking-wide drop-shadow-sm">Nombre</label>
                                    <input 
                                        type="text" value={name} onChange={(e) => setName(e.target.value)}
                                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); phoneRef.current?.focus(); } }}
                                        enterKeyHint="next" placeholder="Ej. Juan Pérez"
                                        className="w-full bg-white/60 border border-white hover:bg-white/80 rounded-xl px-4 py-3 text-[15px] font-bold text-gray-900 outline-none focus:border-[#F97316] focus:bg-white transition-all placeholder:text-gray-400 shadow-inner"
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <label className="text-[11px] font-bold text-gray-800 mb-1 uppercase tracking-wide drop-shadow-sm">WhatsApp</label>
                                    <div className="flex">
                                        <div className="bg-white/80 border border-r-0 border-white rounded-l-xl px-3 py-3 font-black text-gray-600 text-[14px] flex items-center justify-center shadow-inner">+57</div>
                                        <input 
                                            ref={phoneRef} type="tel" inputMode="numeric" value={phone} 
                                            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addressRef.current?.focus(); } }}
                                            enterKeyHint="next" placeholder="300 000 0000" maxLength={10}
                                            className="w-full bg-white/60 border border-white hover:bg-white/80 rounded-r-xl px-4 py-3 text-[15px] font-bold text-gray-900 outline-none focus:border-[#F97316] focus:bg-white transition-all placeholder:text-gray-400 shadow-inner"
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-col">
                                    <label className="text-[11px] font-bold text-gray-800 mb-1 uppercase tracking-wide drop-shadow-sm">Dirección</label>
                                    <input 
                                        ref={addressRef} type="text" value={address} onChange={(e) => setAddress(e.target.value)}
                                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); if (!lat || !lng) requestGPS(); } }}
                                        enterKeyHint="done" placeholder="Ej. Torre 2, Apto 5B"
                                        className="w-full bg-white/60 border border-white hover:bg-white/80 rounded-xl px-4 py-3 text-[15px] font-bold text-gray-900 outline-none focus:border-[#F97316] focus:bg-white transition-all placeholder:text-gray-400 shadow-inner"
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[11px] font-bold text-gray-800 uppercase tracking-wide drop-shadow-sm">GPS</label>
                                    {!lat ? (
                                        <button onClick={requestGPS} disabled={gpsLoading} className="w-full bg-blue-50 border border-blue-200 text-blue-700 rounded-xl py-3.5 px-4 font-black text-[13px] flex items-center justify-center active:scale-[0.98] transition-all hover:bg-blue-100 shadow-sm">
                                            {gpsLoading ? <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"/> Obteniendo señal...</span>
                                            : <span className="flex items-center gap-2"><Navigation className="w-4 h-4" /> Compartir mi GPS</span>}
                                        </button>
                                    ) : (
                                        <div className="w-full bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl py-2.5 px-3 flex items-center justify-between shadow-sm">
                                            <div className="flex items-center gap-2">
                                                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                                <span className="font-extrabold text-[13px]">Ubicación Fijada</span>
                                            </div>
                                            <button onClick={requestGPS} className="text-emerald-700 text-[11px] font-bold bg-emerald-100/50 hover:bg-emerald-200 border border-emerald-200 px-2.5 py-1 rounded-lg transition-all">Actualizar</button>
                                        </div>
                                    )}
                                    {gpsError && <p className="text-red-500 text-[12px] font-bold text-center">{gpsError}</p>}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ================= STEP 2: PAGO ================= */}
                    {step === 2 && (
                        <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-right-8 duration-300">
                            <div className="flex flex-col gap-1">
                                <h2 className="text-[17px] font-extrabold text-gray-900 drop-shadow-sm leading-tight">Casi listo, {name.split(' ')[0]}</h2>
                                <p className="text-[12px] text-gray-600 font-medium">Elige cómo vas a pagar tus {formatCOP(total)}.</p>
                            </div>
                            <div className="grid grid-cols-2 gap-2.5 mt-0.5">
                                <button onClick={() => setPaymentCategory('efectivo')}
                                    className={`flex flex-col gap-1 p-3 rounded-2xl border-2 transition-all active:scale-[0.98] shadow-sm relative overflow-hidden ${paymentCategory === 'efectivo' ? 'bg-orange-50/90 border-orange-400/60 shadow-orange-100' : 'bg-white/60 border-white hover:bg-white/80 hover:border-gray-200'}`}>
                                    <div className="flex items-center justify-between w-full">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-inner ${paymentCategory === 'efectivo' ? 'bg-[#F97316] text-white' : 'bg-gray-100 text-gray-500'}`}>
                                            <Banknote className={paymentCategory === 'efectivo' ? 'w-4 h-4' : 'w-4 h-4 opacity-70'} />
                                        </div>
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentCategory === 'efectivo' ? 'border-[#F97316]' : 'border-gray-300'}`}>
                                            {paymentCategory === 'efectivo' && <div className="w-2.5 h-2.5 rounded-full bg-[#F97316]" />}
                                        </div>
                                    </div>
                                    <div className="flex flex-col text-left mt-0.5">
                                        <span className={`text-[15px] font-black tracking-tight ${paymentCategory === 'efectivo' ? 'text-gray-900' : 'text-gray-600'}`}>Efectivo</span>
                                        <span className={`text-[11px] font-bold leading-tight ${paymentCategory === 'efectivo' ? 'text-orange-700' : 'text-gray-400'}`}>Billete al entregar</span>
                                    </div>
                                </button>
                                
                                <button onClick={() => setPaymentCategory('transferencia')}
                                    className={`flex flex-col gap-1 p-3 rounded-2xl border-2 transition-all active:scale-[0.98] shadow-sm relative overflow-hidden ${paymentCategory === 'transferencia' ? 'bg-purple-50/90 border-purple-400/60 shadow-purple-100' : 'bg-white/60 border-white hover:bg-white/80 hover:border-gray-200'}`}>
                                    <div className="flex items-center justify-between w-full">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-inner ${paymentCategory === 'transferencia' ? 'bg-[#61129b] text-white' : 'bg-gray-100 text-gray-500'}`}>
                                            <Smartphone className={paymentCategory === 'transferencia' ? 'w-4 h-4' : 'w-4 h-4 opacity-70'} />
                                        </div>
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentCategory === 'transferencia' ? 'border-[#61129b]' : 'border-gray-300'}`}>
                                            {paymentCategory === 'transferencia' && <div className="w-2.5 h-2.5 rounded-full bg-[#61129b]" />}
                                        </div>
                                    </div>
                                    <div className="flex flex-col text-left mt-0.5">
                                        <span className={`text-[15px] font-black tracking-tight ${paymentCategory === 'transferencia' ? 'text-gray-900' : 'text-gray-600'}`}>Digital</span>
                                        <span className={`text-[11px] font-bold leading-tight ${paymentCategory === 'transferencia' ? 'text-purple-700' : 'text-gray-400'}`}>Nequi, Daviplata, QR</span>
                                    </div>
                                </button>
                            </div>

                            {paymentCategory === 'efectivo' && (
                                <div className="p-3 rounded-2xl bg-white/70 border border-white flex flex-col gap-2.5 animate-in fade-in slide-in-from-bottom-2 shadow-sm mt-0.5">
                                    <label className="text-[12px] font-extrabold text-gray-800 ml-1">¿Con qué billete pagas?</label>
                                    <div className="flex border-2 border-gray-200 rounded-xl overflow-hidden bg-white/80 focus-within:border-[#F97316] transition-colors shadow-inner">
                                        <div className="bg-gray-50 px-3.5 py-3 font-black text-gray-400 flex items-center justify-center border-r-2 border-gray-200 text-lg">$</div>
                                        <input type="tel" inputMode="numeric"
                                            value={billAmount ? formatCOP(parseInt(billAmount.replace(/\D/g, ''))).replace('$', '') : ''}
                                            onChange={(e) => {
                                                const raw = e.target.value.replace(/\D/g, '');
                                                if (isQuickBill) {
                                                    // Tomar solo el último caracter digitado si venimos de un Quick Bill para reiniciar todo limpio
                                                    const lastChar = raw.slice(-1) || '';
                                                    setBillAmount(lastChar);
                                                    setIsQuickBill(false);
                                                } else {
                                                    if (raw.length <= 6) setBillAmount(raw);
                                                }
                                            }}
                                            onFocus={(e) => { e.currentTarget.select(); }}
                                            onClick={(e) => { e.currentTarget.select(); }}
                                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); } }}
                                            enterKeyHint="done" placeholder="Ej: 50.000 (o toca Exacto)"
                                            className="w-full px-3.5 py-3 text-[17px] tracking-wide font-black text-gray-900 outline-none bg-transparent placeholder:text-gray-400 placeholder:font-bold placeholder:text-[14px]"
                                        />
                                    </div>
                                    
                                    <div className="flex flex-col gap-1.5">
                                        <div className="grid grid-cols-3 gap-1.5">
                                            {[2000, 5000, 10000].map(v => (
                                                <button key={v} onClick={() => { const c = parseInt(billAmount.replace(/\D/g, '')) || 0; setBillAmount((c + v).toString()); setIsQuickBill(true); }}
                                                    className="py-2.5 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 text-[13px] font-black text-gray-700 active:scale-95 shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all">+${v/1000}k</button>
                                            ))}
                                        </div>
                                        <div className="grid grid-cols-3 gap-1.5">
                                            {[20000].map(v => (
                                                <button key={v} onClick={() => { const c = parseInt(billAmount.replace(/\D/g, '')) || 0; setBillAmount((c + v).toString()); setIsQuickBill(true); }}
                                                    className="py-2.5 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 text-[13px] font-black text-gray-700 active:scale-95 shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all">+${v/1000}k</button>
                                            ))}
                                            <button onClick={() => { setBillAmount("50000"); setIsQuickBill(true); }} className="py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 border border-gray-300 text-[13px] font-black text-gray-800 active:scale-95 shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all">$50k</button>
                                            <button onClick={() => { setBillAmount("100000"); setIsQuickBill(true); }} className="py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 border border-gray-300 text-[13px] font-black text-gray-800 active:scale-95 shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all">$100k</button>
                                        </div>
                                    </div>
                                    
                                    <div className="flex gap-1.5 w-full mt-1">
                                        <button onClick={() => { setBillAmount(total.toString()); setIsQuickBill(true); }} className="flex-1 py-3 rounded-xl border-2 border-orange-200 bg-orange-50 text-[14px] font-black text-[#F97316] active:scale-95 shadow-sm transition-all hover:bg-orange-100 hover:border-orange-300 focus:outline-none">
                                            Pago Exacto
                                        </button>
                                        <button onClick={() => { setBillAmount(""); setIsQuickBill(false); }} aria-label="Restablecer" className="w-14 shrink-0 rounded-xl border-2 border-red-200 bg-red-50 hover:bg-red-100 text-[16px] font-black text-red-600 active:scale-95 shadow-sm transition-all focus:outline-none flex items-center justify-center">
                                            ↻
                                        </button>
                                    </div>
                                    
                                    {billAmount && parseInt(billAmount.replace(/\D/g, '')) > total && (
                                        <div className="flex justify-between items-center bg-orange-50 p-3.5 rounded-xl border-2 border-orange-200 mt-1 shadow-sm">
                                            <span className="text-orange-900 font-extrabold text-[13px]">Vueltas:</span>
                                            <span className="text-orange-600 font-black text-[18px] tracking-tight">{formatCOP(parseInt(billAmount.replace(/\D/g, '')) - total)}</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {paymentCategory === 'transferencia' && (
                                <div className="p-3 rounded-xl bg-purple-50/90 border border-purple-100 flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-2 shadow-sm">
                                    <div className="grid grid-cols-4 gap-1.5">
                                        {(['nequi','breb','qr','datafono'] as const).map(m => (
                                            <button key={m} onClick={() => setDigitalMethod(m)}
                                                className={`py-2.5 rounded-lg font-bold text-[12px] transition-all ${digitalMethod === m ? 'bg-[#61129b] text-white shadow-md' : 'bg-white border border-purple-200 text-purple-900'}`}>
                                                {m === 'nequi' ? 'Nequi' : m === 'breb' ? 'Bre-B' : m === 'qr' ? 'QR' : 'Datáfono'}
                                            </button>
                                        ))}
                                    </div>
                                    {(digitalMethod === 'nequi' || digitalMethod === 'breb') && (
                                        <div onClick={copyNumber} className="bg-white p-3 rounded-lg border border-purple-100 text-center flex flex-col items-center animate-in fade-in zoom-in-95 duration-200 relative overflow-hidden cursor-pointer active:scale-[0.98] transition-all">
                                            <div className={`absolute top-0 left-0 w-full h-1 transition-all duration-300 ${copied ? 'bg-emerald-500' : 'bg-gradient-to-r from-purple-500 to-[#61129b]'}`}></div>
                                            <p className="text-[10px] text-purple-600 font-extrabold uppercase mt-0.5">Transfiere a {digitalMethod === 'nequi' ? 'Nequi' : 'Bre-B / Llave'}</p>
                                            <div className="flex items-center gap-2">
                                                <p className="text-[22px] font-black text-gray-900 tracking-wider leading-tight">304 529 3384</p>
                                                {copied ? <Check className="w-5 h-5 text-emerald-500" /> : <Copy className="w-4 h-4 text-purple-400" />}
                                            </div>
                                            <p className={`text-[11px] font-bold uppercase border-t border-dashed border-gray-200 mt-1 pt-1 w-full transition-colors duration-300 ${copied ? 'text-emerald-600' : 'text-gray-500'}`}>
                                                {copied ? '¡Copiado! Pégalo en tu app' : 'Maria Naranjo · Toca para copiar'}
                                            </p>
                                        </div>
                                    )}
                                    {digitalMethod === 'qr' && (
                                        <div className="flex flex-col items-center gap-1 animate-in fade-in zoom-in-95 duration-200 mt-0.5">
                                            <div onClick={downloadQR} className="w-[150px] rounded-xl border-2 border-purple-200 overflow-hidden shadow-md bg-white cursor-pointer active:scale-[0.96] transition-transform">
                                                <img src="/qr_pago.jpg" alt="QR Code de pago" className="w-full h-auto" />
                                            </div>
                                            <p className="text-[11px] font-bold text-gray-700">a nombre de <span className="text-purple-700">Maria del Carmen Naranjo</span></p>
                                            <button onClick={downloadQR} className="w-full py-2 rounded-xl bg-purple-600 text-white font-bold text-[13px] flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-md mt-0.5">
                                                <Download className="w-4 h-4" /> Guardar QR en tu celular
                                            </button>
                                            <p className="text-[9px] font-medium text-purple-600/60 text-center leading-tight">Guárdalo y súbelo en tu app bancaria para pagar</p>
                                        </div>
                                    )}

                                    <p className="text-[11px] font-medium text-purple-800/80 text-center leading-tight">
                                        {digitalMethod === 'datafono' ? 'El repartidor llevará el datáfono.' : 
                                         digitalMethod === 'qr' ? '' :
                                         digitalMethod ? 'Envía el comprobante en el chat de WhatsApp.' :
                                         'Selecciona una opción.'}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ================= STEP 4: RESUMEN PREMIUM ================= */}
                    {step === 3 && (
                        <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-right-8 duration-300">
                            <h2 className="text-center text-lg font-extrabold text-gray-900 drop-shadow-sm">¡Tu pedido casi listo! 🛒</h2>
                            
                            {/* Summary Rows */}
                            <div className="flex flex-col gap-1.5">
                                {/* Productos */}
                                <div className="bg-white/60 border border-white rounded-xl px-3.5 py-2.5 flex justify-between items-center shadow-sm">
                                    <span className="text-[13px] font-medium text-gray-600 flex items-center gap-2">📦 Productos</span>
                                    <span className="text-[13px] font-black text-gray-900">{totalItems} items</span>
                                </div>

                                {/* Cliente */}
                                <div className="bg-white/60 border border-white rounded-xl px-3.5 py-2.5 flex justify-between items-center shadow-sm">
                                    <span className="text-[13px] font-medium text-gray-600 flex items-center gap-2">👤 Cliente</span>
                                    <span className="text-[13px] font-black text-gray-900 capitalize">{name}</span>
                                </div>
                                {/* WhatsApp */}
                                <div className="bg-white/60 border border-white rounded-xl px-3.5 py-2.5 flex justify-between items-center shadow-sm">
                                    <span className="text-[13px] font-medium text-gray-600 flex items-center gap-2">📱 WhatsApp</span>
                                    <span className="text-[13px] font-black text-gray-900">+57 {phone}</span>
                                </div>
                                {/* Dirección */}
                                <div className="bg-white/60 border border-white rounded-xl px-3.5 py-2.5 flex justify-between items-center shadow-sm">
                                    <span className="text-[13px] font-medium text-gray-600 flex items-center gap-2">📍 Dirección</span>
                                    <span className="text-[13px] font-black text-gray-900 text-right max-w-[55%] truncate">{address}</span>
                                </div>
                                {/* Modo Pago */}
                                <div className="bg-white/60 border border-white rounded-xl px-3.5 py-2.5 flex justify-between items-center shadow-sm">
                                    <span className="text-[13px] font-medium text-gray-600 flex items-center gap-2">💳 Modo Pago</span>
                                    <span className={`text-[13px] font-black ${paymentCategory === 'transferencia' ? 'text-purple-700' : 'text-gray-900'}`}>
                                        {paymentCategory === 'efectivo' ? '💵 Efectivo' : 
                                         digitalMethod === 'nequi' ? '💜 Nequi' : 
                                         digitalMethod === 'breb' ? '💜 Bre-B' : 
                                         digitalMethod === 'qr' ? '📱 QR' : '💳 Datáfono'}
                                    </span>
                                </div>
                                {/* Nequi/BreB Number - copiable */}
                                {(digitalMethod === 'nequi' || digitalMethod === 'breb') && (
                                    <div onClick={copyNumber} className="bg-purple-50/80 border border-purple-200 rounded-xl px-3.5 py-2.5 flex justify-between items-center shadow-sm cursor-pointer active:scale-[0.98] transition-all">
                                        <span className="text-[13px] font-medium text-purple-700 flex items-center gap-2">🔢 {digitalMethod === 'nequi' ? 'Nequi' : 'Bre-B'}</span>
                                        <span className="text-[14px] font-black text-purple-700 flex items-center gap-1.5">
                                            3045293384
                                            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-purple-400" />}
                                        </span>
                                    </div>
                                )}
                                {/* Titular */}
                                {(digitalMethod === 'nequi' || digitalMethod === 'breb') && (
                                    <div className="bg-white/60 border border-white rounded-xl px-3.5 py-2.5 flex justify-between items-center shadow-sm">
                                        <span className="text-[13px] font-medium text-gray-600 flex items-center gap-2">👩 Titular</span>
                                        <span className="text-[13px] font-black text-purple-700">Maria Naranjo</span>
                                    </div>
                                )}
                                {/* Efectivo info */}
                                {paymentCategory === 'efectivo' && billAmount && (
                                    <div className="bg-orange-50/80 border border-orange-200 rounded-xl px-3.5 py-2.5 flex justify-between items-center shadow-sm">
                                        <span className="text-[13px] font-medium text-orange-700 flex items-center gap-2">💵 Billete</span>
                                        <span className="text-[13px] font-black text-orange-700">{formatCOP(parseInt(billAmount.replace(/\D/g, '')) || total)}</span>
                                    </div>
                                )}
                            </div>

                            {/* GPS confirmado */}
                            <p className="text-center text-[12px] font-bold text-emerald-700 flex items-center justify-center gap-1">📍 Ubicación exacta confirmada</p>



                            {/* Corregir Algo */}
                            <button onClick={() => setStep(2)} className="w-full py-3 rounded-xl border border-gray-300 bg-white/60 text-[14px] font-bold text-gray-600 active:scale-[0.98] transition-all hover:bg-white/80">
                                Corregir Algo
                            </button>
                        </div>
                    )}

                    {/* ================= STEP 4: SUCCESS ================= */}
                    {step === 4 && (
                        <div className="flex flex-col items-center justify-center pt-8 pb-4 text-center animate-in fade-in zoom-in duration-500">
                            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
                                <CheckCircle2 className="w-10 h-10 text-emerald-500" strokeWidth={2.5} />
                            </div>
                            <h2 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">¡Pedido Listo!</h2>
                            <p className="text-[14px] text-gray-500 mb-8 max-w-[280px] leading-relaxed">
                                Tu pedido fue preparado. Regresa a nuestra aplicación tras confirmar tu WhatsApp.
                            </p>
                            <button 
                                onClick={() => {
                                    goHome();
                                    router.replace("/");
                                }}
                                className="px-8 py-3.5 w-full bg-[#F97316] text-white font-black text-[15px] rounded-2xl shadow-[0_8px_20px_rgba(249,115,22,0.3)] active:scale-95 transition-transform hover:bg-[#EA580C]"
                            >
                                Volver al Inicio
                            </button>
                        </div>
                    )}
                </main>
            </div>

            {/* ============ BARRA INFERIOR FIJA (TODOS LOS PASOS) ============ */}
            {step < 4 && (
                <div className="w-full max-w-md" style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', zIndex: 60 }}>
                    <div className="bg-white/95 backdrop-blur-2xl border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] px-4 pt-3" style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 12px), 12px)' }}>
                    
                    {/* Total + Button Row */}
                    <div className="flex items-center gap-3">
                        {/* Left side: Total OR Warning */}
                        <div className="flex flex-col flex-shrink-0 min-w-0">
                            {step === 2 && billTooLow ? (
                                <>
                                    <span className="text-[10px] font-bold text-red-500 uppercase tracking-wide flex items-center gap-1">💸 Te faltan</span>
                                    <span className="text-[20px] font-black text-red-600 leading-tight">{formatCOP(missingAmount)}</span>
                                </>
                            ) : step === 2 && paymentCategory === 'efectivo' && !billAmount ? (
                                <>
                                    <span className="text-[10px] font-bold text-orange-500 uppercase tracking-wide flex items-center gap-1 animate-pulse">👇 Completa arriba</span>
                                    <span className="text-[20px] font-black text-gray-900 leading-tight">{formatCOP(total)}</span>
                                </>
                            ) : step === 2 && paymentCategory === 'transferencia' && !digitalMethod ? (
                                <>
                                    <span className="text-[10px] font-bold text-purple-500 uppercase tracking-wide flex items-center gap-1 animate-pulse">☝️ Elige método</span>
                                    <span className="text-[18px] font-black text-purple-700 leading-tight">{formatCOP(total)}</span>
                                </>
                            ) : (
                                <>
                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Total a pagar</span>
                                    <span className="text-[20px] font-black text-gray-900 leading-tight">{formatCOP(total)}</span>
                                </>
                            )}
                        </div>
                        <button 
                            onClick={bar.action}
                            disabled={bar.disabled}
                            className={`flex-1 py-3.5 rounded-2xl font-black text-[15px] flex items-center justify-center gap-1 transition-all ${
                                bar.disabled 
                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                                    : step === 3 
                                        ? 'bg-[#25D366] text-white active:scale-[0.98] shadow-[0_4px_16px_rgba(37,211,102,0.4)]' 
                                        : 'bg-[#F97316] text-white active:scale-[0.98] shadow-[0_4px_16px_rgba(249,115,22,0.4)]'
                            }`}
                        >
                            {bar.label} <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
                </div>
            )}
        </div>
    );
}
