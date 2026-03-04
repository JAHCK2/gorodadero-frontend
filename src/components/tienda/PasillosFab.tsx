"use client";

export function PasillosFab({ onClick }: { onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className="fixed bottom-24 right-4 z-50 flex flex-col items-center justify-center w-16 h-16 rounded-full bg-black text-white shadow-xl shadow-black/40 hover:scale-105 active:scale-95 transition-transform"
            aria-label="Abrir Pasillos"
        >
            <span className="text-xl leading-none">🍓</span>
            <span className="text-[7px] font-black uppercase tracking-wider mt-0.5">
                Pasillos
            </span>
        </button>
    );
}
