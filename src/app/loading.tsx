import Image from "next/image";

export default function Loading() {
    return (
        <div className="fixed inset-0 bg-[#0f172a] flex flex-col items-center justify-center z-[9999] px-6">
            <div className="relative flex flex-col items-center animate-pulse">
                <Image
                    src="/images/go-rodadero-full.png"
                    alt="GoRodadero"
                    width={220}
                    height={156}
                    priority
                    className="w-48 h-auto drop-shadow-[0_4px_24px_rgba(0,0,0,0.4)] mb-3"
                />
                <p className="text-[11px] font-extrabold text-[#5eead4] tracking-[0.25em] uppercase drop-shadow-[0_1px_3px_rgba(0,0,0,0.3)]">
                    Tu super en minutos
                </p>
            </div>
        </div>
    );
}
