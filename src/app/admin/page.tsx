"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function AdminDashboard() {
    const [pin, setPin] = useState("");
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    
    const [activeTab, setActiveTab] = useState<"pedidos" | "informes" | "config">("pedidos");
    
    const [pedidos, setPedidos] = useState<any[]>([]);
    const [margen, setMargen] = useState("40");
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const MASTER_PIN = "2024";

    useEffect(() => {
        if (isAuthenticated) {
            loadData();
        }
    }, [isAuthenticated]);

    async function loadData() {
        setIsLoading(true);
        // Load Config
        const { data: configData } = await supabase.from('configuracion').select('*');
        if (configData) {
            const m = configData.find(c => c.clave === 'margen_ganancia');
            if (m) setMargen(m.valor);
        }

        // Load Pedidos
        const { data: pedidosData } = await supabase
            .from('pedidos')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(100);
        
        if (pedidosData) {
            setPedidos(pedidosData);
        }
        setIsLoading(false);
    }

    async function saveConfig() {
        setIsSaving(true);
        try {
            const res = await fetch('/api/admin/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ clave: 'margen_ganancia', valor: margen, pin: MASTER_PIN })
            });
            const data = await res.json();
            if (data.success) {
                alert("¡Margen actualizado! Los precios se recalcularán automáticamente en la tienda.");
            } else {
                alert("Error guardando: " + data.error);
            }
        } catch (err: any) {
            alert("Error de conexión: " + err.message);
        }
        setIsSaving(false);
    }

    function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        if (pin === MASTER_PIN) {
            setIsAuthenticated(true);
        } else {
            alert("PIN Incorrecto");
            setPin("");
        }
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert("¡Copiado al portapapeles!");
    };

    if (!isAuthenticated) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#0d0d0d] p-4">
                <form onSubmit={handleLogin} className="bg-white/5 p-8 rounded-3xl border border-white/10 text-center max-w-sm w-full backdrop-blur-md">
                    <h1 className="text-2xl font-bold text-white mb-2">Acceso Restringido</h1>
                    <p className="text-gray-400 mb-6 text-sm">Ingresa el PIN maestro para entrar al panel administrativo.</p>
                    <input 
                        type="password" 
                        value={pin}
                        onChange={e => setPin(e.target.value)}
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-center text-white text-2xl tracking-[0.5em] mb-4 focus:outline-none focus:border-orange-500 transition-colors"
                        placeholder="••••"
                        autoFocus
                    />
                    <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-colors">
                        Entrar al Cuartel
                    </button>
                </form>
            </div>
        );
    }

    // Calcula estadísticas rápidas
    const totalVentas = pedidos.reduce((acc, p) => acc + (Number(p.total) || 0), 0);
    const totalPedidos = pedidos.length;

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-8">
            <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Panel Administrativo</h1>
                    <p className="text-gray-400 text-sm mt-1">GoRodadero V2 — Dashboard en vivo</p>
                </div>
                <div className="flex gap-2">
                    <Link href="/" className="text-orange-400 hover:text-orange-300 text-sm px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors font-medium flex items-center gap-2">
                        <span>Ir a la Tienda</span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                    </Link>
                    <button onClick={() => setIsAuthenticated(false)} className="text-gray-400 hover:text-white text-sm px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                        Cerrar Sesión
                    </button>
                </div>
            </header>

            {/* TABS */}
            <div className="flex space-x-2 mb-8 bg-white/5 p-1 rounded-xl w-fit">
                <button onClick={() => setActiveTab('pedidos')} className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors ${activeTab === 'pedidos' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}>📦 Pedidos</button>
                <button onClick={() => setActiveTab('informes')} className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors ${activeTab === 'informes' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}>📈 Informes</button>
                <button onClick={() => setActiveTab('config')} className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors ${activeTab === 'config' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}>⚙️ Configuración</button>
            </div>

            {isLoading ? (
                <div className="text-center py-20 text-gray-500">Cargando datos de Supabase...</div>
            ) : (
                <div className="space-y-6">
                    
                    {activeTab === 'config' && (
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8">
                            <h2 className="text-xl font-bold text-white mb-6">⚙️ Parámetros del Sistema</h2>
                            
                            <div className="max-w-md">
                                <label className="block text-gray-400 text-sm font-medium mb-2">
                                    Porcentaje de Ganancia
                                </label>
                                <div className="flex gap-4 items-center mb-4">
                                    <div className="relative">
                                        <input 
                                            type="number" 
                                            step="1"
                                            value={margen}
                                            onChange={e => setMargen(e.target.value)}
                                            className="bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-lg focus:outline-none focus:border-orange-500 transition-colors w-32"
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">%</span>
                                    </div>
                                    <span className="text-gray-500 text-sm">
                                        Ej: 40 = +40% de ganancia sobre el costo
                                    </span>
                                </div>
                                <button 
                                    onClick={saveConfig}
                                    disabled={isSaving}
                                    className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold py-3 px-6 rounded-xl transition-colors"
                                >
                                    {isSaving ? 'Guardando...' : 'Guardar y Aplicar en Tienda'}
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'pedidos' && (
                        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-white/5 border-b border-white/5 text-gray-400 text-sm">
                                            <th className="p-4 font-medium">Fecha</th>
                                            <th className="p-4 font-medium">Pedido</th>
                                            <th className="p-4 font-medium">Cliente</th>
                                            <th className="p-4 font-medium">Método</th>
                                            <th className="p-4 font-medium text-right">Total</th>
                                            <th className="p-4 font-medium text-center">Acción</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5 text-sm">
                                        {pedidos.map(p => {
                                            const d = new Date(p.created_at);
                                            const itemsResumen = Array.isArray(p.items) 
                                                ? p.items.map((i:any) => `${i.qty}x ${i.title || i.name}`).join('\n')
                                                : '';
                                            const textoParaCopiar = `🛒 PEDIDO ${p.order_num}\nCliente: ${p.client_name}\nCel: ${p.phone}\nDir: ${p.address}\n\n📝 Productos:\n${itemsResumen}\n\n💰 Total: $${p.total?.toLocaleString('es-CO')}\nMétodo: ${p.payment_method}`;

                                            return (
                                                <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                                                    <td className="p-4 text-gray-400">
                                                        {d.toLocaleDateString('es-CO')} <br/><span className="text-xs">{d.toLocaleTimeString('es-CO')}</span>
                                                    </td>
                                                    <td className="p-4 font-mono text-orange-400 font-bold">{p.order_num}</td>
                                                    <td className="p-4 text-white">
                                                        <div className="font-medium">{p.client_name}</div>
                                                        <div className="text-gray-500 text-xs mt-0.5">{p.phone}</div>
                                                    </td>
                                                    <td className="p-4">
                                                        <span className="px-2.5 py-1 rounded-full bg-white/10 text-xs font-medium text-gray-300">
                                                            {p.payment_method}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-right text-white font-bold">
                                                        ${Number(p.total).toLocaleString('es-CO')}
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        <button 
                                                            onClick={() => copyToClipboard(textoParaCopiar)}
                                                            className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg transition-colors"
                                                        >
                                                            Copiar
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        {pedidos.length === 0 && (
                                            <tr>
                                                <td colSpan={6} className="p-8 text-center text-gray-500">No hay pedidos registrados aún.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'informes' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                                <h3 className="text-gray-400 text-sm font-medium mb-1">Total de Ventas Históricas</h3>
                                <div className="text-4xl font-bold text-white mb-2">${totalVentas.toLocaleString('es-CO')}</div>
                                <div className="text-sm text-green-400 bg-green-400/10 inline-block px-2 py-0.5 rounded-md">+{totalPedidos} pedidos completados</div>
                            </div>

                            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                                <h3 className="text-gray-400 text-sm font-medium mb-4">Métricas de Crecimiento</h3>
                                <p className="text-sm text-gray-500 mb-4">
                                    Aquí podrás ver gráficos avanzados por semana y por mes, así como el filtro de marcas y proveedores (requiere más datos históricos para generar gráficas).
                                </p>
                                <div className="h-32 bg-white/5 rounded-xl border border-white/5 flex items-center justify-center text-gray-600 text-sm">
                                    [Área Reservada para Gráfica Recharts]
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            )}
        </div>
    );
}
