// ═══════════════════════════════════════════
// GoRodadero — Utilidades Generales
// ═══════════════════════════════════════════

import { formatCOP } from "./money";

/** Formato rápido de precio COP */
export const formatPrice = formatCOP;

/** Classnames utility — filtra falsy y une */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
    return classes.filter(Boolean).join(" ");
}

/** Convierte texto a slug URL-friendly */
export function slugify(text: string): string {
    return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
}

/** Trunca texto a maxLength con "..." */
export function truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength).trimEnd() + "…";
}

/**
 * Fuzzy match score entre query y texto (0 a 1).
 * Tokeniza ambos y calcula la fracción de tokens del query
 * que aparecen como prefijo en los tokens del texto.
 */
export function fuzzyMatch(query: string, text: string): number {
    if (!query.trim()) return 1;
    const normalize = (s: string) =>
        s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    const queryTokens = normalize(query).split(/\s+/).filter(Boolean);
    const textTokens = normalize(text).split(/\s+/).filter(Boolean);

    if (queryTokens.length === 0) return 1;

    let matched = 0;
    for (const qt of queryTokens) {
        if (textTokens.some((tt) => tt.startsWith(qt) || tt.includes(qt))) {
            matched++;
        }
    }
    return matched / queryTokens.length;
}

/** Debounce genérico */
export function debounce<T extends (...args: unknown[]) => void>(
    fn: T,
    ms: number
): (...args: Parameters<T>) => void {
    let timer: ReturnType<typeof setTimeout>;
    return (...args: Parameters<T>) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), ms);
    };
}
