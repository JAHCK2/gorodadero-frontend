"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Image from "next/image"
import {
    ChevronDown,
    User,
    Search,
    SlidersHorizontal,
    Zap,
    Timer,
    ShoppingBag,
    Plus,
    Star,
    Home,
    Heart,
    ClipboardList,
    ShoppingCart,
    Store,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

import type { Category, Product } from "@prisma/client"
import { LogoGoOficial } from "./LogoGoOficial"

interface Props {
    initialProducts: Product[];
    categories: Category[];
}

const proofItems = [
    { product: "Cerveza Aguila", time: "hace 2 min" },
    { product: "Aguacate Hass x3", time: "hace 1 min" },
    { product: "Papas Margarita", time: "ahora" },
    { product: "Helado Bon Ice", time: "hace 3 min" },
    { product: "Ron Viejo de Caldas", time: "hace 1 min" },
    { product: "Acetaminofén", time: "hace 4 min" },
    { product: "Banano criollo", time: "ahora" },
    { product: "Six Pack Poker", time: "hace 2 min" },
]

interface NavItem {
    name: string
    icon: LucideIcon
    isCart?: boolean
}

const navItems: NavItem[] = [
    { name: "Inicio", icon: Home },
    { name: "Favoritos", icon: Heart },
    { name: "Pedidos", icon: ClipboardList },
    { name: "Carrito", icon: ShoppingCart, isCart: true },
]

function formatPrice(price: any) {
    const num = Number(price);
    if (isNaN(num)) return "$0";
    return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(num);
}

/* ========================================================================
   HEADER
   ======================================================================== */
function Header() {
    return (
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-white/30">
            <div className="px-5 pt-4 pb-3">
                <div className="flex items-center justify-between mb-2.5">
                    <LogoGoOficial className="w-[50px] h-auto flex-shrink-0" />
                    <button className="flex items-center gap-1 text-[11px] text-muted-foreground font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse flex-shrink-0" />
                        <span className="text-foreground font-bold truncate">El Rodadero</span>
                        <ChevronDown className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                    </button>
                    <button
                        className="flex items-center justify-center w-10 h-10 rounded-full bg-white/60 backdrop-blur-sm border border-white/40"
                        aria-label="Perfil de usuario"
                    >
                        <User className="w-5 h-5 text-foreground" />
                    </button>
                </div>
                <h1 className="text-[22px] font-black text-foreground tracking-tight leading-tight">
                    {"¡Para ti, vecino!"}
                </h1>
            </div>
        </header>
    )
}

/* ========================================================================
   SEARCH BAR
   ======================================================================== */
function SearchBar() {
    return (
        <div className="px-5 py-3">
            <div className="relative flex items-center gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Busca en GoRodadero..."
                        className="w-full h-12 pl-11 pr-4 rounded-2xl bg-white/90 backdrop-blur-sm text-sm font-semibold text-foreground placeholder:text-muted-foreground/70 shadow-lg shadow-black/[0.04] border border-white/50 outline-none focus:ring-2 focus:ring-go-red/30 focus:border-go-red/40 transition-all duration-200"
                        aria-label="Buscar productos"
                    />
                </div>
                <button
                    className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-2xl bg-foreground text-white shadow-lg shadow-black/10"
                    aria-label="Filtros"
                >
                    <SlidersHorizontal className="w-[18px] h-[18px]" />
                </button>
            </div>
        </div>
    )
}

/* ========================================================================
   PROMO BANNER
   ======================================================================== */
function PromoBanner() {
    const [seconds, setSeconds] = useState(599)

    useEffect(() => {
        const interval = setInterval(() => {
            setSeconds((s) => (s > 0 ? s - 1 : 599))
        }, 1000)
        return () => clearInterval(interval)
    }, [])

    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60

    return (
        <div className="px-5 py-2">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0f1128] via-[#1a1f4e] to-[#0d1030] p-5">
                <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-go-yellow/10 blur-2xl" />
                <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-go-red/10 blur-2xl" />
                <div className="absolute top-1/2 right-1/4 w-20 h-20 rounded-full bg-go-blue/20 blur-xl" />

                <div className="relative">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 mb-3">
                        <Timer className="w-3.5 h-3.5 text-go-yellow" />
                        <span className="text-[11px] font-bold text-go-yellow tracking-wide">
                            {`Cupón activo por ${mins}:${secs.toString().padStart(2, "0")}`}
                        </span>
                    </div>

                    <div className="flex items-end justify-between gap-4">
                        <div className="flex-1">
                            <h2 className="text-xl font-black text-white leading-tight tracking-tight">
                                {"Entrega en"}
                                <span className="flex items-center gap-1.5 mt-0.5">
                                    <Zap className="w-6 h-6 text-go-yellow fill-go-yellow" />
                                    <span className="text-go-yellow text-2xl">15 min</span>
                                </span>
                            </h2>
                            <p className="mt-2 text-xs font-semibold text-white/50 leading-relaxed">
                                {"Usa el código "}
                                <span className="text-go-yellow font-black">GORODA15</span>
                                {" y obtén envío gratis"}
                            </p>
                        </div>

                        <button className="flex-shrink-0 px-5 py-2.5 rounded-xl bg-go-yellow text-foreground text-xs font-black tracking-wide shadow-lg shadow-yellow-500/25 hover:shadow-yellow-500/40 active:scale-95 transition-all duration-200">
                            Pedir ahora
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

/* ========================================================================
   SOCIAL PROOF
   ======================================================================== */
function SocialProof() {
    const [visible, setVisible] = useState<number[]>([0, 1, 2])
    const indexRef = useRef(3)

    const rotate = useCallback(() => {
        setVisible((prev) => {
            const next = [...prev]
            next.shift()
            next.push(indexRef.current % proofItems.length)
            indexRef.current++
            return next
        })
    }, [])

    useEffect(() => {
        const interval = setInterval(rotate, 3000)
        return () => clearInterval(interval)
    }, [rotate])

    return (
        <section className="py-3 px-5" aria-label="Actividad reciente">
            <div className="flex items-center gap-2 mb-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <p className="text-xs font-bold text-muted-foreground">
                    Comprando ahora en El Rodadero
                </p>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                {visible.map((idx) => {
                    const item = proofItems[idx]
                    return (
                        <div
                            key={`${idx}-${item.product}`}
                            className="flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl bg-white/80 backdrop-blur-sm border border-white/40 shadow-sm transition-all duration-500"
                        >
                            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-go-red/10">
                                <ShoppingBag className="w-3.5 h-3.5 text-go-red" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[11px] font-bold text-foreground truncate max-w-[120px]">
                                    {item.product}
                                </p>
                                <p className="text-[9px] font-semibold text-muted-foreground">
                                    {item.time}
                                </p>
                            </div>
                        </div>
                    )
                })}
            </div>
        </section>
    )
}

/* ========================================================================
   CATEGORIES (DYNAMIC FROM PRISMA)
   ======================================================================== */
function Categories({ categories }: { categories: Category[] }) {
    const [activeIdx, setActiveIdx] = useState<number>(0)

    return (
        <section className="py-3" aria-label="Categorias">
            <div className="flex items-center justify-between px-5 mb-3">
                <h2 className="text-sm font-black text-foreground tracking-tight">Categorias</h2>
                <button className="text-[11px] font-bold text-go-red">Ver todas</button>
            </div>
            <div className="flex gap-4 overflow-x-auto px-5 pb-2 no-scrollbar">
                {categories.map((cat, idx) => {
                    const isActive = activeIdx === idx
                    // Using a generic Lucide icon since we don't have perfect mapping yet
                    const Icon = Store;

                    return (
                        <button
                            key={cat.id}
                            onClick={() => setActiveIdx(idx)}
                            className="flex flex-col items-center gap-1.5 min-w-[68px] group"
                        >
                            <div
                                className={`rounded-full p-[3px] transition-all duration-300 ${isActive
                                    ? "bg-gradient-to-tr from-yellow-400 via-blue-600 to-red-600 shadow-lg shadow-red-500/20"
                                    : "bg-transparent"
                                    }`}
                            >
                                <div
                                    className={`rounded-full transition-all duration-300 ${isActive ? "p-[3px] bg-white" : "p-0"
                                        }`}
                                >
                                    <div
                                        className={`flex items-center justify-center w-[56px] h-[56px] rounded-full transition-all duration-300 ${isActive
                                            ? "bg-white scale-100"
                                            : "bg-white/90 backdrop-blur-sm border-2 border-white/50 shadow-md shadow-black/[0.04] group-hover:shadow-lg group-hover:scale-105"
                                            }`}
                                    >
                                        <Icon
                                            className={`w-6 h-6 transition-colors duration-200 ${isActive ? "text-go-red" : "text-foreground/70 group-hover:text-go-red"
                                                }`}
                                        />
                                    </div>
                                </div>
                            </div>
                            <span
                                className={`text-[11px] font-bold leading-tight text-center transition-colors duration-200 ${isActive ? "text-go-red" : "text-foreground"
                                    } truncate w-full px-1`}
                            >
                                {cat.name.charAt(0).toUpperCase() + cat.name.slice(1)}
                            </span>
                        </button>
                    )
                })}
            </div>
        </section>
    )
}

/* ========================================================================
   PRODUCT CARD (DYNAMIC FROM PRISMA)
   ======================================================================== */
function ProductCard({ product }: { product: Product }) {
    return (
        <div className="flex items-center gap-3.5 p-3 bg-white/90 backdrop-blur-sm rounded-3xl shadow-sm shadow-black/[0.03] border border-white/60 hover:shadow-md hover:shadow-black/[0.06] transition-all duration-200">
            <div className="relative flex-shrink-0 w-[76px] h-[76px] rounded-2xl bg-slate-50 flex items-center justify-center overflow-hidden">
                {product.imageUrl ? (
                    <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        className="object-cover"
                    />
                ) : (
                    <div className="font-extrabold text-2xl text-gray-200">GO</div>
                )}
            </div>

            <div className="flex-1 min-w-0">
                <h3 className="text-sm font-black text-foreground truncate">
                    {product.name}
                </h3>
                <p className="text-[11px] text-muted-foreground font-semibold mt-0.5 truncate">
                    {product.description || ""}
                </p>
                <div className="flex items-center gap-1 mt-1">
                    <Star className="w-3 h-3 text-go-yellow fill-go-yellow" />
                    <span className="text-[10px] font-bold text-muted-foreground">
                        5.0
                    </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-sm font-black text-foreground">
                        {formatPrice(product.sellPrice)}
                    </span>
                </div>
            </div>

            <button
                className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-go-red text-white shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 active:scale-90 transition-all duration-200"
                aria-label={`Añadir ${product.name} al carrito`}
            >
                <Plus className="w-5 h-5" strokeWidth={2.5} />
            </button>
        </div>
    )
}

/* ========================================================================
   PRODUCT SECTION
   ======================================================================== */
function ProductSection({ products }: { products: Product[] }) {
    return (
        <section className="px-5 py-3" aria-label="Productos favoritos">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-black text-foreground tracking-tight">
                    Los favoritos de hoy
                </h2>
                <button className="text-[11px] font-bold text-go-red">
                    Ver todos
                </button>
            </div>

            <div className="flex flex-col gap-3">
                {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </section>
    )
}

/* ========================================================================
   BOTTOM NAV
   ======================================================================== */
function BottomNav() {
    const [active, setActive] = useState("Inicio")

    return (
        <nav
            className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-t border-white/20 pb-safe-bottom"
            aria-label="Navegación principal"
            style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 0.75rem)' }}
        >
            <div className="max-w-md mx-auto flex items-center justify-around px-2 py-2">
                {navItems.map((item) => {
                    const Icon = item.icon
                    const isActive = active === item.name

                    if (item.isCart) {
                        return (
                            <button
                                key={item.name}
                                onClick={() => setActive(item.name)}
                                className="relative flex flex-col items-center gap-0.5 -mt-5"
                                aria-label={item.name}
                                aria-current={isActive ? "page" : undefined}
                            >
                                <div className="flex items-center justify-center w-14 h-14 rounded-full bg-go-yellow shadow-lg shadow-yellow-500/30">
                                    <Icon className="w-6 h-6 text-foreground" />
                                    <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center w-5 h-5 rounded-full bg-go-red text-white text-[10px] font-black shadow-sm shadow-red-500/30">
                                        3
                                    </span>
                                </div>
                                <span className="text-[10px] font-bold text-foreground mt-0.5">
                                    {item.name}
                                </span>
                            </button>
                        )
                    }

                    return (
                        <button
                            key={item.name}
                            onClick={() => setActive(item.name)}
                            className="flex flex-col items-center gap-0.5 py-1.5 px-3"
                            aria-label={item.name}
                            aria-current={isActive ? "page" : undefined}
                        >
                            <Icon
                                className={`w-5 h-5 transition-colors duration-200 ${isActive ? "text-foreground" : "text-muted-foreground"
                                    }`}
                            />
                            <span
                                className={`text-[10px] font-bold transition-colors duration-200 ${isActive ? "text-foreground" : "text-muted-foreground"
                                    }`}
                            >
                                {item.name}
                            </span>
                            {isActive && (
                                <div className="w-1 h-1 rounded-full bg-go-red mt-0.5" />
                            )}
                        </button>
                    )
                })}
            </div>
        </nav>
    )
}

/* ========================================================================
   PAGE WRAPPER (HOME CLIENT)
   ======================================================================== */
export default function GoRodaderoHomeClient({ initialProducts, categories }: Props) {
    return (
        <div className="min-h-screen bg-background font-sans">
            <div className="max-w-md mx-auto relative pb-28">
                <Header />
                <SearchBar />
                <PromoBanner />
                <SocialProof />
                <Categories categories={categories} />
                <ProductSection products={initialProducts} />
            </div>
            <BottomNav />
        </div>
    )
}
