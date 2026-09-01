import type { Product } from "../types/product";

export interface SearchProduct extends Product {
    // Extends base Product type
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
   Prioridad: Barcode > Brand/Category/Unit Match > Pure Fuzzy Multi-field
   ───────────────────────────────────────────────────────────── */

/** Normaliza: lowercase + strip acentos */
export function normalize(s: string | null | undefined): string {
    if (!s) return "";
    return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}

/** Normaliza código de barras eliminando espacios en blanco */
export function normalizeBarcode(b: string | null | undefined): string {
    if (!b) return "";
    return b.replace(/\s+/g, "").trim();
}

/** Construye el texto completo indexable de un producto (nombre + marca + categorías + barcode) */
function getProductSearchHaystack(p: SearchProduct): string {
    return `${normalize(p.name)} ${normalize(p.brand)} ${normalize(p.categoryName)} ${normalize(p.subcategoryName)} ${p.barcode || ''}`;
}

export function fuzzyTokenSearch(products: SearchProduct[], raw: string): SearchProduct[] {
    const processed = normalize(raw);
    if (!processed) return [];
    const tokens = processed.split(/\s+/).filter(Boolean);

    return products
        .filter((p) => {
            const haystack = getProductSearchHaystack(p);
            return tokens.every((token) => haystack.includes(token));
        })
        .sort((a, b) => {
            // Priorizar coincidencias exactas en marca o inicio de nombre
            const normA = normalize(a.name);
            const normB = normalize(b.name);
            const aStartsWith = normA.startsWith(processed);
            const bStartsWith = normB.startsWith(processed);
            if (aStartsWith && !bStartsWith) return -1;
            if (!aStartsWith && bStartsWith) return 1;

            const aBrandMatch = a.brand && normalize(a.brand).includes(processed);
            const bBrandMatch = b.brand && normalize(b.brand).includes(processed);
            if (aBrandMatch && !bBrandMatch) return -1;
            if (!aBrandMatch && bBrandMatch) return 1;

            return a.name.localeCompare(b.name, "es");
        })
        .slice(0, 50);
}

export function smartSearch(products: SearchProduct[], query: string): SearchProduct[] {
    const raw = query.trim();
    if (!raw) return [];

    // ── 1) BARCODE EXACT MATCH DETERMINISTA (máxima prioridad) ──
    const rawBarcode = normalizeBarcode(raw);
    const isNumericBarcode = /^\d{8,14}$/.test(rawBarcode);
    if (isNumericBarcode) {
        const exactBarcodeMatch = products.find(
            (p) => normalizeBarcode(p.barcode) === rawBarcode
        );
        if (exactBarcodeMatch) {
            return [exactBarcodeMatch];
        }
    }

    // ── 1.1) BARCODE PARTIAL MATCH ──
    const barcodeMatch = products.find(
        (p) => p.barcode && normalizeBarcode(p.barcode).includes(rawBarcode)
    );
    if (barcodeMatch && raw.length >= 6) {
        const rest = fuzzyTokenSearch(products, raw).filter(p => p.id !== barcodeMatch.id);
        return [barcodeMatch, ...rest].slice(0, 50);
    }

    // ── 2) UNIT-TYPE MATCH (si query contiene sinónimo de unidad) ──
    const normalizedQuery = normalize(raw);
    const tokens = normalizedQuery.split(/\s+/).filter(Boolean);

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
        // Filtrar por unit_type primero, luego fuzzy sobre el resto
        const unitFiltered = products.filter(p => p.unitType && normalize(p.unitType) === normalize(detectedUnitType));

        if (nameTokens.length > 0) {
            const results = unitFiltered
                .filter(p => {
                    const haystack = getProductSearchHaystack(p);
                    return nameTokens.every(t => haystack.includes(t));
                })
                .sort((a, b) => a.name.localeCompare(b.name, "es"))
                .slice(0, 50);

            if (results.length > 0) return results;
        } else if (unitFiltered.length > 0) {
            return unitFiltered.sort((a, b) => a.name.localeCompare(b.name, "es")).slice(0, 50);
        }
    }

    // ── 3) PURE FUZZY TOKEN SEARCH (multi-campo: nombre, marca, categoría, barcode) ──
    return fuzzyTokenSearch(products, raw);
}
