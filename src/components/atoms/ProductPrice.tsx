// ═══════════════════════════════════════════════════════════
// Atom: ProductPrice — Orange #F97316 price display
// Formats to es-CO locale ($3.500, $12.000)
// ═══════════════════════════════════════════════════════════

import { formatCOP } from "@/lib/money";

interface ProductPriceProps {
    /** Price in COP (integer) */
    amount: number;
    /** "sm" = card inline (14px), "md" = larger card (16px), "lg" = detail hero (28px) */
    size?: "sm" | "md" | "lg";
}

export function ProductPrice({ amount, size = "sm" }: ProductPriceProps) {
    const sizeClass =
        size === "lg"
            ? "text-[28px] font-extrabold tracking-tight"
            : size === "md"
            ? "text-[16px] font-extrabold tracking-tight"
            : "text-[14px] font-extrabold tracking-tight";

    return (
        <span className={`text-[#F97316] ${sizeClass}`}>
            {formatCOP(amount)}
        </span>
    );
}
