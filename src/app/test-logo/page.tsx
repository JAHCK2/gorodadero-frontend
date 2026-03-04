import { LogoFromPDF } from "@/components/tienda/LogoFromPDF"

function GoLogo({ className = "w-32 h-16" }: { className?: string }) {
    return (
        <svg
            viewBox="-10 -10 240 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <defs>
                {/* Sombra exterior para el diseño de "sticker" */}
                <filter id="logo-shadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="5" stdDeviation="4" floodColor="#000" floodOpacity="0.25" />
                </filter>

                {/* Grupo base con las formas (Texto y Chevrones) */}
                <g id="logo-elements">
                    {/* El texto GO: extra bold, itálica, letras súper juntas */}
                    <text
                        x="20" y="85"
                        fontFamily="'Arial Black', Impact, sans-serif"
                        fontStyle="italic"
                        fontWeight="900"
                        fontSize="85"
                        fill="#FFFFFF"
                        letterSpacing="-8"
                        transform="skewX(-10)"
                    >
                        GO
                    </text>

                    {/* Los 3 Chevrones superpuestos sobre la 'O' */}
                    <g transform="translate(25, -5)">
                        {/* Amarillo */}
                        <path d="M 125 35 L 145 55 L 125 75" stroke="#FBBF24" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" fill="none" />

                        {/* Azul */}
                        <path d="M 145 35 L 165 55 L 145 75" stroke="#1D4ED8" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" fill="none" />

                        {/* Rojo */}
                        <path d="M 165 35 L 185 55 L 165 75" stroke="#E11D48" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    </g>
                </g>
            </defs>

            {/* TÉCNICA DE STICKER: Apilamos las mismas formas con distintos bordes */}

            {/* Capa 1: Borde blanco exterior masivo con sombra */}
            <use href="#logo-elements" stroke="#FFFFFF" strokeWidth="26" strokeLinejoin="round" filter="url(#logo-shadow)" />

            {/* Capa 2: Borde negro unificado (crea la base negra envolvente) */}
            <use href="#logo-elements" stroke="#1A1A1A" strokeWidth="16" strokeLinejoin="round" />

            {/* Capa 3: Formas reales (Texto blanco, interior transparente que muestra el negro base, y flechas de colores) */}
            <use href="#logo-elements" />
        </svg>
    )
}

export default function TestLogoPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <h1 className="text-2xl font-black mb-8 text-black text-center">Laboratorio SVG: Refinado</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
                <div className="flex flex-col items-center p-12 bg-white rounded-[2.5rem] shadow-sm">
                    <span className="text-sm font-bold text-gray-400 mb-8 tracking-widest uppercase">Fondo Blanco</span>
                    {/* Logo en tamaño grande para ver detalles */}
                    <GoLogo className="w-64 h-auto" />
                </div>

                <div className="flex flex-col items-center p-12 bg-[#0A0A0A] rounded-[2.5rem] shadow-xl">
                    <span className="text-sm font-bold text-gray-500 mb-8 tracking-widest uppercase">Fondo Oscuro</span>
                    {/* Logo en tamaño grande para ver detalles */}
                    <GoLogo className="w-64 h-auto" />
                </div>
            </div>

            <h2 className="text-2xl font-black mb-8 mt-16 text-black text-center">Extracción Directa del PDF</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
                <div className="flex flex-col items-center p-12 bg-white rounded-[2.5rem] shadow-sm">
                    <span className="text-sm font-bold text-gray-400 mb-8 tracking-widest uppercase">Fondo Blanco</span>
                    <LogoFromPDF className="w-64 h-auto" />
                </div>

                <div className="flex flex-col items-center p-12 bg-[#0A0A0A] rounded-[2.5rem] shadow-xl">
                    <span className="text-sm font-bold text-gray-500 mb-8 tracking-widest uppercase">Fondo Oscuro</span>
                    <LogoFromPDF className="w-64 h-auto" />
                </div>
            </div>
        </div>
    )
}
