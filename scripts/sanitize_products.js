// ═══════════════════════════════════════════════════════════
// GoRodadero — ETL Sanitizer v2.0
// Script de Normalización de Catálogo de Productos
// ═══════════════════════════════════════════════════════════
//
// NOTA: Los datos en Supabase usan UTF-8 correctamente
//       (ñ, á, é, etc. son válidos). No se necesita
//       reparación de encoding.
//
// Reglas:
//   1. Title Case con excepciones de conectores
//   2. Estándar de unidades de medida
//   3. Limpieza de espacios y formato
//
// Uso: node scripts/sanitize_products.js [--update]
//   sin flag     → DRY RUN, solo muestra cambios
//   --update     → Aplica cambios a Supabase
// ═══════════════════════════════════════════════════════════

const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
    "https://wmbliuwzwaqhyqrkzciz.supabase.co",
    "sb_publishable_kpABfShzMMIMLoDq-TQwSw_MOHDuckh"
);

const DRY_RUN = !process.argv.includes("--update");

// ═══════════════════════════════════════════════════════════
// PASO 1: Title Case con excepciones
// ═══════════════════════════════════════════════════════════

const LOWERCASE_WORDS = new Set([
    "de", "del", "en", "con", "y", "la", "el", "las", "los",
    "a", "al", "por", "para", "sin", "o", "u", "e", "un", "una",
]);

// Marcas / siglas que siempre se escriben con su forma exacta
const BRAND_MAP = {
    "postobon": "Postobón",
    "postobón": "Postobón",
    "aguardiente": "Aguardiente",
    "jgb": "JGB",
    "h2oh": "H2Oh",
    "3d": "3D",
    "fabuloso": "Fabuloso",
};

function toTitleCase(text) {
    return text
        .split(/\s+/)
        .filter(Boolean)
        .map((word, index) => {
            const lower = word.toLowerCase();

            // Brand override
            if (BRAND_MAP[lower]) return BRAND_MAP[lower];

            // If word is all uppercase and 2-4 chars, might be a brand/acronym — keep as-is
            // But only if it doesn't look like a unit of measure
            if (word.length <= 4 && word === word.toUpperCase() && /^[A-Z]+$/.test(word)) {
                // Check if it's a unit — will be fixed by standardizeUnits
                if (["ML", "GR", "GRS", "KG", "KGS", "LT", "LTS", "CC", "OZ", "UND"].includes(word)) {
                    return lower; // Let unit standardizer handle it
                }
                return word; // Keep as uppercase acronym
            }

            // Lowercase connectors (except first word)
            if (index > 0 && LOWERCASE_WORDS.has(lower)) {
                return lower;
            }

            // "x" as separator stays lowercase when between numbers/units
            if (lower === "x" && index > 0) {
                return "x";
            }

            // Standard title case
            return lower.charAt(0).toUpperCase() + lower.slice(1);
        })
        .join(" ");
}

// ═══════════════════════════════════════════════════════════
// PASO 2: Estándar de Unidades de Medida
// ═══════════════════════════════════════════════════════════

function standardizeUnits(text) {
    let result = text;

    // --- Litros: l, lt, lts, LT, Lt → "L" ---
    result = result.replace(
        /(\d+(?:[.,]\d+)?)\s*(?:lts|Lts|LTS|lt|Lt|LT|ltr|Ltr|litros?|Litros?)\b/gi,
        "$1 L"
    );
    // Solo "l" minúscula cuando sigue a número y no es parte de palabra
    result = result.replace(/(\d+(?:[.,]\d+)?)\s*l\b(?!\w)/g, "$1 L");

    // --- Mililitros: ML, Ml, ml → "ml" ---
    result = result.replace(
        /(\d+(?:[.,]\d+)?)\s*(?:ML|Ml|mL|ml\.?)\b/gi,
        "$1 ml"
    );

    // --- Gramos: GR, gr, grs, G → "g" ---
    result = result.replace(
        /(\d+(?:[.,]\d+)?)\s*(?:grs?|GRS?|Grs?|gramos?|Gramos?)\b/gi,
        "$1 g"
    );
    result = result.replace(/(\d+(?:[.,]\d+)?)\s*G\b(?![\w])/g, "$1 g");

    // --- Kilogramos: K, kg, kgs, KG → "kg" ---
    result = result.replace(
        /(\d+(?:[.,]\d+)?)\s*(?:kgs?|KGS?|Kgs?|kilos?|Kilos?)\b/gi,
        "$1 kg"
    );

    // --- Unidades: u, unds, uni → "und" ---
    result = result.replace(
        /(\d+)\s*(?:unds?|uds?|uni|unidades?|Unds?|Uds?|Uni|Unidades?)\b/gi,
        "$1 und"
    );

    // --- Onzas: oz, OZ → "oz" ---
    result = result.replace(
        /(\d+(?:[.,]\d+)?)\s*(?:OZ|Oz|oz)\b/gi,
        "$1 oz"
    );

    // --- Centímetros cúbicos: cm3, CC → "cc" ---
    result = result.replace(
        /(\d+(?:[.,]\d+)?)\s*(?:cm3|CM3|Cm3|CC|Cc|cc)\b/gi,
        "$1 cc"
    );

    // --- Grados: "grados" → "°" ---
    result = result.replace(
        /(\d+)\s*grados\b/gi,
        "$1°"
    );

    return result;
}

// ═══════════════════════════════════════════════════════════
// PIPELINE
// ═══════════════════════════════════════════════════════════

function sanitize(name) {
    let result = name;

    // 0. Trim
    result = result.trim();

    // 1. Standardize units BEFORE title case
    result = standardizeUnits(result);

    // 2. Title Case
    result = toTitleCase(result);

    // 3. Re-apply unit standards (title case may have altered them)
    result = standardizeUnits(result);

    // 4. Clean up double spaces
    result = result.replace(/\s{2,}/g, " ").trim();

    return result;
}

// ═══════════════════════════════════════════════════════════
// EJECUCIÓN
// ═══════════════════════════════════════════════════════════

async function main() {
    console.log("===================================================");
    console.log("  GoRodadero ETL Sanitizer v2.0");
    console.log("  Mode:", DRY_RUN ? "DRY RUN (no changes)" : "UPDATE (writing to Supabase)");
    console.log("===================================================\n");

    // 1. Fetch all products
    let allProducts = [];
    let from = 0;
    const pageSize = 1000;
    while (true) {
        const { data, error } = await supabase
            .from("products")
            .select("id, name")
            .order("name", { ascending: true })
            .range(from, from + pageSize - 1);

        if (error) { console.error("FETCH ERROR:", error); return; }
        if (!data || data.length === 0) break;
        allProducts = allProducts.concat(data);
        if (data.length < pageSize) break;
        from += pageSize;
    }

    console.log("Products loaded:", allProducts.length, "\n");

    // 2. Sanitize
    let changedCount = 0;
    const changes = [];

    for (const product of allProducts) {
        const cleaned = sanitize(product.name);
        if (cleaned !== product.name) {
            changedCount++;
            changes.push({
                id: product.id,
                oldName: product.name,
                newName: cleaned,
            });
        }
    }

    console.log("Products to modify:", changedCount, "/", allProducts.length);
    console.log("Products unchanged:", allProducts.length - changedCount, "\n");

    // 3. Show sample
    const sample = changes.slice(0, 50);
    console.log("-- Sample Changes -----------------------------------");
    for (const c of sample) {
        console.log("  BEFORE:", c.oldName);
        console.log("  AFTER :", c.newName);
        console.log("");
    }

    if (changes.length > 50) {
        console.log("  ... and", changes.length - 50, "more\n");
    }

    // 4. Apply
    if (!DRY_RUN) {
        console.log("\nApplying changes to Supabase...\n");

        let successCount = 0;
        let errorCount = 0;

        const BATCH_SIZE = 50;
        for (let i = 0; i < changes.length; i += BATCH_SIZE) {
            const batch = changes.slice(i, i + BATCH_SIZE);

            const promises = batch.map((c) =>
                supabase
                    .from("products")
                    .update({ name: c.newName })
                    .eq("id", c.id)
                    .then(({ error }) => {
                        if (error) {
                            console.error("  ERROR updating:", c.oldName, "->", error.message);
                            errorCount++;
                        } else {
                            successCount++;
                        }
                    })
            );

            await Promise.all(promises);

            const done = Math.min(i + BATCH_SIZE, changes.length);
            process.stdout.write("  Progress: " + done + " / " + changes.length +
                " (" + Math.round(done / changes.length * 100) + "%)\r");
        }

        console.log("\n\n===================================================");
        console.log("  SUCCESS:", successCount);
        console.log("  ERRORS:", errorCount);
        console.log("===================================================");
    } else {
        console.log("\nRun with --update to apply changes to Supabase:");
        console.log("  node scripts/sanitize_products.js --update\n");
    }
}

main().catch(console.error);
