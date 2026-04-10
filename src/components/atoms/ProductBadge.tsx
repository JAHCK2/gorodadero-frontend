// ═══════════════════════════════════════════════════════════
// Atom: ProductBadge — "180 g", "200 ml", "1 Und"
// Glassmorphism-ready unit badge
// ═══════════════════════════════════════════════════════════

interface ProductBadgeProps {
    /** Unit type: "g", "ml", "Und", "kg", "l", etc. */
    unitType?: string | null;
    /** Numeric value: 180, 200, null */
    unitValue?: number | null;
    /** Visual size: "sm" for card overlay, "md" for bottom sheet */
    size?: "sm" | "md";
}

function unitLabel(unitType?: string | null, unitValue?: number | null): string {
    if (!unitType && !unitValue) return "1 Und";
    const val = unitValue ?? "";
    const type = unitType || "Und";
    return `${val} ${type}`.trim();
}

export function ProductBadge({
    unitType,
    unitValue,
    size = "sm",
}: ProductBadgeProps) {
    const label = unitLabel(unitType, unitValue);

    const sizeClass =
        size === "md"
            ? "px-2 py-0.5 text-[11px]"
            : "px-1.5 py-0.5 text-[9px]";

    return (
        <span
            className={`inline-block rounded-md bg-slate-200/90 text-slate-700 font-bold leading-none ${sizeClass}`}
        >
            {label}
        </span>
    );
}
