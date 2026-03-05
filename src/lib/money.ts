// ═══════════════════════════════════════════
// GoRodadero — Zero-Float Financial Engine
// ═══════════════════════════════════════════
//
// REGLA DE ORO: Los precios en COP se procesan como
// ENTEROS para evitar errores de coma flotante.
// Prisma Decimal → number entero → cálculos → formateo
//

/**
 * Clase inmutable para aritmética financiera segura.
 * Internamente almacena centavos como entero.
 *
 * @example
 * const price = Money.fromDecimal(6000);     // $6.000
 * const total = price.multiply(3);            // $18.000
 * console.log(total.format());                // "$18.000"
 */
export class Money {
    /** Valor interno en la unidad mínima (peso entero para COP) */
    private readonly _cents: number;

    private constructor(cents: number) {
        // Clamp a entero — barrera final contra floats
        this._cents = Math.round(cents);
    }

    // ─── Constructores ───

    /** Crea Money desde un valor decimal de Prisma/Supabase (ej. 6000 → $6.000) */
    static fromDecimal(value: number | string | null | undefined): Money {
        if (value === null || value === undefined) return new Money(0);
        const num = typeof value === "string" ? parseFloat(value) : value;
        return new Money(Math.round(num));
    }

    /** Crea Money desde centavos directamente */
    static fromCents(cents: number): Money {
        return new Money(cents);
    }

    /** Money con valor cero */
    static zero(): Money {
        return new Money(0);
    }

    // ─── Aritmética (inmutable — retorna nueva instancia) ───

    add(other: Money): Money {
        return new Money(this._cents + other._cents);
    }

    subtract(other: Money): Money {
        return new Money(this._cents - other._cents);
    }

    multiply(factor: number): Money {
        return new Money(Math.round(this._cents * factor));
    }

    /** Suma un array de Money */
    static sum(items: Money[]): Money {
        return items.reduce((acc, item) => acc.add(item), Money.zero());
    }

    // ─── Comparadores ───

    isZero(): boolean {
        return this._cents === 0;
    }

    isPositive(): boolean {
        return this._cents > 0;
    }

    greaterThan(other: Money): boolean {
        return this._cents > other._cents;
    }

    equals(other: Money): boolean {
        return this._cents === other._cents;
    }

    // ─── Output ───

    /** Retorna el valor entero (para cálculos y serialización) */
    toCents(): number {
        return this._cents;
    }

    /** Formatea como precio colombiano: "$6.000" */
    format(): string {
        return "$" + this._cents.toLocaleString("es-CO");
    }

    /** Formatea sin signo: "6.000" */
    formatRaw(): string {
        return this._cents.toLocaleString("es-CO");
    }

    /** Para serialización JSON */
    toJSON(): number {
        return this._cents;
    }
}

// ─── Helpers rápidos (funciones puras para uso inline) ───

/** Formato rápido de precio COP: formatCOP(6000) → "$6.000" */
export function formatCOP(value: number | string | null | undefined): string {
    return Money.fromDecimal(value).format();
}
