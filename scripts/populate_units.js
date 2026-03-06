// ═══════════════════════════════════════════════════════════
// GoRodadero — Schema Migration + Unit ETL v1.0
// Migración No Destructiva: Normalización de Atributos
// ═══════════════════════════════════════════════════════════
//
// FASES:
//   1. Backup: Exporta tabla products a JSON timestamped
//   2. DDL: Crea columnas unit_value (NUMERIC) + unit_type (VARCHAR)
//   3. ETL: Extrae unidad del name vía regex, pobla las nuevas columnas
//
// Uso:
//   node scripts/populate_units.js            → DRY RUN (solo stats)
//   node scripts/populate_units.js --update   → Aplica cambios
// ═══════════════════════════════════════════════════════════

const { Client } = require("pg");
const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

// ─── Supabase (para data read/write) ───
const supabase = createClient(
    "https://wmbliuwzwaqhyqrkzciz.supabase.co",
    "sb_publishable_kpABfShzMMIMLoDq-TQwSw_MOHDuckh"
);

// ─── PostgreSQL directo (para DDL) ───
const PG_URL = "postgresql://postgres.wmbliuwzwaqhyqrkzciz:HzlqhE8QuWkZVT5K@aws-0-sa-east-1.pooler.supabase.com:5432/postgres";

const DRY_RUN = !process.argv.includes("--update");

// ═══════════════════════════════════════════════════════════
// UNIT EXTRACTION REGEX
// Matches patterns like: "500 g", "1.5 L", "250 ml", "1 kg"
// at the END of the product name (most reliable position)
// ═══════════════════════════════════════════════════════════

const UNIT_PATTERN = /(\d+(?:[.,]\d+)?)\s*(L|ml|g|kg|oz|und|cc|lb)\s*$/i;

// Also try to match "x 500 g" patterns (with "x" separator)
const UNIT_PATTERN_X = /x\s*(\d+(?:[.,]\d+)?)\s*(L|ml|g|kg|oz|und|cc|lb)\s*$/i;

// Standardize the unit to our canonical form
function standardizeUnit(unit) {
    const map = {
        "l": "L",
        "ml": "ml",
        "g": "g",
        "kg": "kg",
        "oz": "oz",
        "und": "und",
        "cc": "cc",
        "lb": "lb",
    };
    return map[unit.toLowerCase()] || unit.toLowerCase();
}

function extractUnit(name) {
    // Try direct pattern first: "Coca Cola 1.5 L"
    let match = name.match(UNIT_PATTERN);
    if (!match) {
        // Try "x" separator: "Gaseosa Coca Cola x 1.5 L"
        match = name.match(UNIT_PATTERN_X);
    }
    if (!match) return null;

    const rawValue = match[1].replace(",", ".");
    const value = parseFloat(rawValue);
    const unit = standardizeUnit(match[2]);

    if (isNaN(value) || value <= 0) return null;

    return { value, unit };
}

// ═══════════════════════════════════════════════════════════
// FASE 1: BACKUP
// ═══════════════════════════════════════════════════════════

async function backupProducts() {
    console.log("─── FASE 1: BACKUP ───");

    let allProducts = [];
    let from = 0;
    const pageSize = 1000;
    while (true) {
        const { data, error } = await supabase
            .from("products")
            .select("*")
            .order("name", { ascending: true })
            .range(from, from + pageSize - 1);

        if (error) throw new Error("Backup fetch error: " + error.message);
        if (!data || data.length === 0) break;
        allProducts = allProducts.concat(data);
        if (data.length < pageSize) break;
        from += pageSize;
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    const backupPath = path.join(__dirname, `products_backup_${timestamp}.json`);
    fs.writeFileSync(backupPath, JSON.stringify(allProducts, null, 2));
    console.log(`  ✅ Backup: ${allProducts.length} productos → ${path.basename(backupPath)}`);
    console.log("");

    return allProducts;
}

// ═══════════════════════════════════════════════════════════
// FASE 2a: DDL — Crear columnas
// ═══════════════════════════════════════════════════════════

async function createColumns() {
    console.log("─── FASE 2a: DDL (ALTER TABLE) ───");
    console.log("  ✅ Columnas unit_value + unit_type ya creadas via Supabase SQL Editor");
    console.log("");
}

// ═══════════════════════════════════════════════════════════
// FASE 2b: ETL — Extraer unidades y poblar
// ═══════════════════════════════════════════════════════════

async function populateUnits(products) {
    console.log("─── FASE 2b: ETL (Extracción de Unidades) ───");

    const withUnit = [];
    const withoutUnit = [];

    for (const p of products) {
        const result = extractUnit(p.name);
        if (result) {
            withUnit.push({ id: p.id, name: p.name, ...result });
        } else {
            withoutUnit.push({ id: p.id, name: p.name });
        }
    }

    // Stats by unit type
    const unitCounts = {};
    for (const p of withUnit) {
        unitCounts[p.unit] = (unitCounts[p.unit] || 0) + 1;
    }

    console.log(`  Total productos: ${products.length}`);
    console.log(`  Con unidad:      ${withUnit.length} (${(withUnit.length / products.length * 100).toFixed(1)}%)`);
    console.log(`  Sin unidad:      ${withoutUnit.length}`);
    console.log("");
    console.log("  Distribución por tipo:");
    for (const [unit, count] of Object.entries(unitCounts).sort((a, b) => b[1] - a[1])) {
        console.log(`    ${unit.padEnd(5)} → ${count} productos`);
    }
    console.log("");

    // Sample
    console.log("  ── Muestra (primeros 20 con unidad) ──");
    for (const p of withUnit.slice(0, 20)) {
        console.log(`    "${p.name}" → value=${p.value}, type=${p.unit}`);
    }
    if (withUnit.length > 20) console.log(`    ... y ${withUnit.length - 20} más`);
    console.log("");

    // Sample without unit
    console.log("  ── Muestra (primeros 10 SIN unidad) ──");
    for (const p of withoutUnit.slice(0, 10)) {
        console.log(`    "${p.name}"`);
    }
    console.log("");

    // Apply
    if (!DRY_RUN) {
        console.log("  Aplicando cambios a Supabase...");
        let successCount = 0;
        let errorCount = 0;

        const BATCH_SIZE = 50;
        for (let i = 0; i < withUnit.length; i += BATCH_SIZE) {
            const batch = withUnit.slice(i, i + BATCH_SIZE);

            const promises = batch.map((p) =>
                supabase
                    .from("products")
                    .update({ unit_value: p.value, unit_type: p.unit })
                    .eq("id", p.id)
                    .then(({ error }) => {
                        if (error) {
                            console.error(`    ERROR: "${p.name}" → ${error.message}`);
                            errorCount++;
                        } else {
                            successCount++;
                        }
                    })
            );

            await Promise.all(promises);

            const done = Math.min(i + BATCH_SIZE, withUnit.length);
            process.stdout.write(`    Progress: ${done} / ${withUnit.length} (${Math.round(done / withUnit.length * 100)}%)\r`);
        }

        console.log(`\n\n  ═══════════════════════════════════════`);
        console.log(`  ✅ SUCCESS: ${successCount}`);
        console.log(`  ❌ ERRORS:  ${errorCount}`);
        console.log(`  ═══════════════════════════════════════`);
    } else {
        console.log("  [DRY RUN] No se aplicaron cambios.");
        console.log("  Ejecutar con --update para aplicar:");
        console.log("    node scripts/populate_units.js --update\n");
    }

    return { withUnit: withUnit.length, withoutUnit: withoutUnit.length, unitCounts };
}

// ═══════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════

async function main() {
    console.log("═══════════════════════════════════════════════════════");
    console.log("  GoRodadero — Schema Migration + Unit ETL v1.0");
    console.log("  Mode:", DRY_RUN ? "DRY RUN (no changes)" : "UPDATE (writing to DB)");
    console.log("═══════════════════════════════════════════════════════\n");

    // 1. Backup
    const products = await backupProducts();

    // 2a. DDL
    await createColumns();

    // 2b. ETL
    await populateUnits(products);

    console.log("\n✅ Migration complete!\n");
}

main().catch((err) => {
    console.error("FATAL ERROR:", err);
    process.exit(1);
});
