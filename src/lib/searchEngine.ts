import { Product } from "@/types/product";

export interface SearchProduct extends Product {
    // Optionally extend Product if search specific fields are needed,
    // but typically we can just use the base Product type.
}

/* ─────────────────────────────────────────────────────────────
   UNIT SYNONYMS — Mapeo de lenguaje natural a unit_type
   ───────────────────────────────────────────────────────────── */

export const UNIT_SYNONYMS: Record<string, string> = {
    // Litros
    litro: "L", litros: "L", lt: "L", lts: "L",
    // Mililitros
    mililitro: "ml", mililitros: "ml",
    // Kilogramos
    kilo: "kg", kilos: "kg", kilogramo: "kg", kilogramos: "kg",
    // Gramos
    gramo: "g", gramos: "g",
    // Onzas
    onza: "oz", onzas: "oz",
    // Unidades
    unidad: "und", unidades: "und",
    // Libras
    libra: "lb", libras: "lb",
};

/* ─────────────────────────────────────────────────────────────
   SMART SEARCH ENGINE — Multi-índice con 3 niveles
   Prioridad: Barcode > Unit-Type Match > Pure Fuzzy
   ───────────────────────────────────────────────────────────── */

/** Normaliza: lowercase + strip acentos */
export function normalize(s: string): string {
    return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}

export function fuzzyTokenSearch(products: SearchProduct[], raw: string): SearchProduct[] {
    const processed = normalize(raw);
    if (!processed) return [];
    const tokens = processed.split(/\s+/).filter(Boolean);

    return products
        .filter((p) => {
            const haystack = normalize(p.name);
            return tokens.every((token) => haystack.includes(token));
        })
        .sort((a, b) => a.name.localeCompare(b.name, "es"))
        .slice(0, 50);
}

export function smartSearch(products: SearchProduct[], query: string): SearchProduct[] {
    const raw = query.trim();
    if (!raw) return [];

    // ── 1) BARCODE EXACT MATCH (máxima prioridad) ──
    const barcodeMatch = products.find(
        (p) => p.barcode && p.barcode === raw
    );
    if (barcodeMatch) {
        const rest = fuzzyTokenSearch(products, raw).filter(p => p.id !== barcodeMatch.id);
        return [barcodeMatch, ...rest].slice(0, 50);
    }

    // ── 2) UNIT-TYPE MATCH (si query contiene sinónimo de unidad) ──
    const normalizedQuery = normalize(raw);
    const tokens = normalizedQuery.split(/\s+/).filter(Boolean);

    // Check if any token is a unit synonym
    let detectedUnitType: string | null = null;
    const nameTokens: string[] = [];

    for (const token of tokens) {
        if (UNIT_SYNONYMS[token]) {
            detectedUnitType = UNIT_SYNONYMS[token];
        } else {
            nameTokens.push(token);
        }
    }

    if (detectedUnitType) {
        // Filter by unit_type first, then fuzzy on remaining name tokens
        const unitFiltered = products.filter(p => p.unitType === detectedUnitType);

        let results: SearchProduct[];
        if (nameTokens.length > 0) {
            // Further filter by name tokens
            results = unitFiltered
                .filter(p => {
                    const haystack = normalize(p.name);
                    return nameTokens.every(t => haystack.includes(t));
                })
                .sort((a, b) => a.name.localeCompare(b.name, "es"))
                .slice(0, 50);
        } else {
            // Only unit filter, sort by name
            results = unitFiltered
                .sort((a, b) => a.name.localeCompare(b.name, "es"))
                .slice(0, 50);
        }

        if (results.length > 0) return results;
        // Fallthrough to pure fuzzy if unit-type match yields nothing
    }

    // ── 3) PURE FUZZY TOKEN SEARCH (fallback) ──
    return fuzzyTokenSearch(products, raw);
}
