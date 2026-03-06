// ═══════════════════════════════════════════════════════════
// GoRodadero — ETL Re-Categorización v1.0
// Auditoría Comercial: Mover productos de subs legacy
// a sub-categorías detalladas via keyword matching
// ═══════════════════════════════════════════════════════════
//
// Uso:
//   node scripts/recategorize.js            → DRY RUN
//   node scripts/recategorize.js --update   → Aplica cambios
// ═══════════════════════════════════════════════════════════

const { createClient } = require("@supabase/supabase-js");
const sb = createClient(
    "https://wmbliuwzwaqhyqrkzciz.supabase.co",
    "sb_publishable_kpABfShzMMIMLoDq-TQwSw_MOHDuckh"
);

const DRY_RUN = !process.argv.includes("--update");

async function fetchAll(table, select) {
    let all = [], from = 0, size = 1000;
    while (true) {
        const { data, error } = await sb.from(table).select(select).range(from, from + size - 1);
        if (error) throw error;
        if (!data || data.length === 0) break;
        all = all.concat(data);
        if (data.length < size) break;
        from += size;
    }
    return all;
}

function n(s) { return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""); }

// ═══════════════════════════════════════════════════════════
// KEYWORD RULES — name match → target subcategory slug
// Each rule: [keywords[], targetSubSlug]
// First match wins — order matters!
// ═══════════════════════════════════════════════════════════

// ── SNACKS (370) → split into detailed subs ──
const SNACKS_RULES = [
    // Chocolates
    [["jet ", "jumbo", "burbuja", "choco krispis", "chocolat", "chocobreak", "nucita", "cacao", "cocosette", "toronto", "bon bon bum choco", "m&m", "snickers", "milky way", "kinder", "ferrero", "toblerone", "hershey"], "chocolates"],
    // Galletas
    [["festival", "ducales", "noel", "wafer", "galleta", "oreo", "chips ahoy", "club social", "saltinas", "crakeñas", "gallet", "ritz", "tosh", "cracker", "belvita", "marias"], "galletas"],
    // Gomitas y caramelos
    [["trululu", "goma", "gomita", "caramelo", "bon bon bum", "frunas", "chupeta", "colombina", "super coco", "cofler", "halls", "menta", "chicle", "mentos", "paleta", "dulce"], "gomitas-y-caramelos"],
    // Snacks salados (fallback for the rest)
    [["margarita", "de todito", "doritos", "cheetos", "choclitos", "papa", "mani", "tocineta", "chicharr", "natuchips", "todo rico", "ramo", "ponque", "achira", "platanito", "yupi", "cheese tris"], "snacks-salados"],
];

// ── BEBIDAS (284 in "bebidas") → split ──
const BEBIDAS_RULES = [
    // Aguas
    [["cristal", "brisa", "agua ", "manantial", "oasis", "cielo"], "aguas"],
    // Gaseosas y maltas
    [["coca cola", "coca-cola", "postobon", "postobón", "pepsi", "sprite", "fanta", "gaseosa", "big cola", "colombiana", "manzana", "uva ", "limonada", "7up", "canada dry", "schweppes", "malta", "pony malta", "club colombia", "kola roman"], "gaseosas-y-maltas"],
    // Jugos y néctares
    [["hit", "del valle", "jugo", "pulpa", "nectar", "tampico", "tutti frutti", "frutto", "baggio", "suntea", "country hill", "ades", "alpina"], "jugos-y-nectares"],
    // Energizantes e isotónicas
    [["red bull", "monster", "vive 100", "gatorade", "powerade", "speed max", "electrolit", "squash", "energi", "isotonico", "peak", "predator", "volt"], "energizantes-e-isotonicas"],
    // Té y café listo
    [["te ", "tea", "cafe ", "coffee", "nescafe", "mr tea", "fuze", "hatsu", "matcha", "lipton"], "te-y-cafe-listo"],
];

// ── LICORES (153) → split ──
const LICORES_RULES = [
    [["aguardiente", "antioqueño", "nectar", "cristal "], "aguardientes"],
    [["old parr", "buchanan", "buchanans", "jack daniel", "johnnie walker", "chivas", "something special", "grant", "whisky", "whiskey", "label"], "whisky"],
    [["corona", "aguila", "poker", "club colombia", "pilsen", "cerveza", "miller", "heineken", "budweiser", "bud light", "stella", "tecate", "michelob", "andina", "lata"], "cervezas"],
    [["ron ", "ron medellin", "ron viejo", "tres esquinas", "bacardi", "havana", "captain morgan"], "rones"],
    [["tequila", "jose cuervo", "jimador"], "tequilas"],
    [["vino", "wine", "sangria", "espumoso", "cava", "champagne", "lambrusco"], "vinos"],
];

// ── ASEO (149 in "aseo") → Cuidado Hogar subs ──
const ASEO_RULES = [
    [["papel higien", "toalla", "servilleta", "absorbente", "familia", "scott", "rollo"], "papeles-y-absorbentes"],
    [["detergente", "ariel", "fab", "rindex", "tide", "dersa", "123", "top"], "detergente"],
    [["axion", "lavaloza", "lava loza", "lavaplatos"], "lavalozas"],
    [["suavitel", "suavizante", "floral"], "suavizantes"],
    [["fabuloso", "limpia", "multiuso", "clorox", "cloro", "desinfect", "ajax", "varsol", "pinesol", "lysol", "blanqueador", "limpiavidrios", "creolina"], "limpiadores-multiusos"],
    [["vaso ", "plato ", "cuchara", "tenedor", "desechable", "pitillo", "bolsa", "aluminio", "stretch"], "desechables"],
];

// ── BELLEZA (291 in "belleza") → Cuidado Personal subs ──
const BELLEZA_RULES = [
    [["jabon", "jabón", "palmolive", "protex", "dove bar", "rexona bar", "lux bar"], "jabones"],
    [["toalla femenin", "toallas femenin", "kotex", "nosotras", "stayfree", "always", "tampax", "protector", "pantiprotector"], "proteccion-femenina"],
    [["prestobarba", "gillette", "afeit", "cuchilla", "rastrillo", "depil", "veet", "nair"], "afeitado-y-depilacion"],
    [["shampoo", "champu", "acondicionador", "savital", "sedal", "pantene", "head & shoulders", "h&s", "tresemme", "tratamiento capilar", "crema peinar"], "cuidado-capilar"],
    [["cepillo dental", "crema dental", "colgate", "oral-b", "oral b", "listerine", "enjuague bucal", "seda dental", "hilo dental", "dientes"], "cuidado-oral"],
    [["desodorante", "rexona", "dove deo", "speed stick", "lady speed", "old spice", "axe", "secret", "antitranspirante"], "desodorantes"],
];

// ── LACTEOS (151 in "lacteos") → Lácteos subs ──
const LACTEOS_RULES = [
    [["queso", "mozarella", "mozzarella", "parmesano", "doble crema"], "quesos"],
    [["leche ", "leche entera", "leche deslact", "alqueria", "colanta", "alpina leche", "parmalat"], "leche-natural"],
    [["yogurt", "yogur", "kumis", "avena alpina", "bebida lactea", "bon yurt"], "yogurt-y-bebidas-lacteas"],
    [["dulce de leche", "arequipe", "crema de leche", "leche condensada", "natilla", "manjar"], "lacteos-y-cremas-dulces"],
    [["mantequilla", "margarina", "rama ", "campi"], "mantequillas-y-margarinas"],
    [["arepa"], "arepas"],
];

// ── CARNES (46 in "carnes") → Carnes subs ──
const CARNES_RULES = [
    [["pollo", "pechuga", "muslo", "ala de", "filete pollo"], "pollo-y-aves"],
    [["cerdo", "chuleta", "costilla", "tocino bacon", "tocineta cerdo"], "carne-de-cerdo"],
    [["salchicha", "jamon", "jamón", "chorizo", "mortadela", "salchichon", "butifarra", "embutido"], "embutidos"],
    [["res ", "carne molida", "bistec", "costilla res", "lomo", "sobrebarriga", "falda"], "carne-de-res"],
];

// ── SALUD (145 in "salud" under Despensa) → Farmacia macro subs ──
const SALUD_RULES = [
    [["dolex", "advil", "ibuprofeno", "acetaminof", "aspirina", "naproxeno", "diclofenac", "analges", "dolor"], "dolor"],
    [["dristan", "gripa", "tos", "loratadina", "descongestion", "vick", "antiflu"], "gripa-y-tos"],
    // Fallback: everything else → salud digestiva
    [[], "salud-digestiva"], // catch-all
];

// ── DESPENSA remainders ──
const DESPENSA_REMAP = {
    "aceites": "aceites-y-vinagres",
    "granos": "arroz-y-granos",
    "harinas": "harina-y-mezclas",
    "pastas": "pastas-y-masas",
    "endulzantes": "azucar-y-endulzantes",
    "sazonadores": "condimentos-y-salsas",
    "conservas": "conservas",
    "cereales": "cereales",
    "enlatados": "conservas", // merge with conservas
};

// Legacy subs to deactivate after migration
const LEGACY_SLUGS = ["snacks", "bebidas", "aseo", "belleza", "licores", "lacteos", "carnes"];

// ═══════════════════════════════════════════════════════════
// MATCHING ENGINE
// ═══════════════════════════════════════════════════════════

function matchRules(productName, rules) {
    const name = n(productName);
    for (const [keywords, targetSlug] of rules) {
        if (keywords.length === 0) return targetSlug; // catch-all
        if (keywords.some(kw => name.includes(n(kw)))) return targetSlug;
    }
    return null;
}

// ═══════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════

async function main() {
    console.log("═══════════════════════════════════════════════════════");
    console.log("  GoRodadero — ETL Re-Categorización v1.0");
    console.log("  Mode:", DRY_RUN ? "DRY RUN" : "UPDATE");
    console.log("═══════════════════════════════════════════════════════\n");

    const [cats, prods] = await Promise.all([
        fetchAll("categories", "*"),
        fetchAll("products", "id, name, category_id"),
    ]);

    // Build slug→id map
    const slugToId = {};
    const idToSlug = {};
    const idToName = {};
    cats.forEach(c => {
        slugToId[c.slug] = c.id;
        idToSlug[c.id] = c.slug;
        idToName[c.id] = c.name;
    });

    // Also need to handle "utensilios", "otros", "ferreteria" → need a new macro or reassign
    // Let's check if there's already a suitable one or we map to Cuidado Hogar
    // "utensilios" + "ferreteria" → Cuidado Hogar → Desechables (closest fit)
    // "otros" → keep in Despensa → "otros" sub stays (it's a catch-all)

    const moves = []; // { productId, productName, fromSlug, toSlug }
    const unmoved = []; // products that couldn't be matched

    for (const p of prods) {
        const currentSlug = idToSlug[p.category_id];
        if (!currentSlug) continue;

        let targetSlug = null;

        // Determine which ruleset to apply based on current category
        if (currentSlug === "snacks") {
            targetSlug = matchRules(p.name, SNACKS_RULES);
            if (!targetSlug) targetSlug = "snacks-salados"; // fallback
        } else if (currentSlug === "bebidas") {
            targetSlug = matchRules(p.name, BEBIDAS_RULES);
            if (!targetSlug) targetSlug = "gaseosas-y-maltas"; // fallback
        } else if (currentSlug === "licores") {
            targetSlug = matchRules(p.name, LICORES_RULES);
            if (!targetSlug) targetSlug = "cervezas"; // fallback
        } else if (currentSlug === "aseo") {
            targetSlug = matchRules(p.name, ASEO_RULES);
            if (!targetSlug) targetSlug = "limpiadores-multiusos"; // fallback
        } else if (currentSlug === "belleza") {
            targetSlug = matchRules(p.name, BELLEZA_RULES);
            if (!targetSlug) targetSlug = "jabones"; // fallback → revisit
        } else if (currentSlug === "lacteos") {
            targetSlug = matchRules(p.name, LACTEOS_RULES);
            if (!targetSlug) targetSlug = "lacteos-y-cremas-dulces"; // fallback
        } else if (currentSlug === "carnes") {
            targetSlug = matchRules(p.name, CARNES_RULES);
            if (!targetSlug) targetSlug = "embutidos"; // fallback
        } else if (currentSlug === "salud") {
            targetSlug = matchRules(p.name, SALUD_RULES);
        } else if (DESPENSA_REMAP[currentSlug]) {
            targetSlug = DESPENSA_REMAP[currentSlug];
        } else if (currentSlug === "utensilios" || currentSlug === "ferreteria") {
            targetSlug = "desechables"; // → Cuidado Hogar
        } else if (currentSlug === "otros") {
            // Keep in Despensa, remap to "caldos-y-sopas" is wrong... keep as is
            // Actually "otros" is a mixed bag. Leave in place for now.
            continue;
        } else {
            continue; // Already in a detailed sub (or macro)
        }

        if (targetSlug && slugToId[targetSlug]) {
            if (targetSlug !== currentSlug) {
                moves.push({
                    id: p.id,
                    name: p.name,
                    fromSlug: currentSlug,
                    from: idToName[p.category_id],
                    toSlug: targetSlug,
                    to: idToName[slugToId[targetSlug]],
                    targetCatId: slugToId[targetSlug],
                });
            }
        } else {
            unmoved.push({ name: p.name, currentSlug, targetSlug });
        }
    }

    // ── Stats ──
    const byFrom = {};
    const byTo = {};
    moves.forEach(m => {
        byFrom[m.fromSlug] = (byFrom[m.fromSlug] || 0) + 1;
        byTo[m.toSlug] = (byTo[m.toSlug] || 0) + 1;
    });

    console.log(`Total movimientos: ${moves.length}`);
    console.log(`Sin mover (sin match): ${unmoved.length}\n`);

    console.log("── Origen (legacy subs siendo vaciadas) ──");
    for (const [slug, count] of Object.entries(byFrom).sort((a, b) => b[1] - a[1])) {
        console.log(`  ${slug.padEnd(20)} → ${count} productos salen`);
    }
    console.log("");

    console.log("── Destino (subs detalladas recibiendo) ──");
    for (const [slug, count] of Object.entries(byTo).sort((a, b) => b[1] - a[1])) {
        console.log(`  ${slug.padEnd(30)} ← ${count} productos entran`);
    }
    console.log("");

    // Sample moves
    console.log("── Muestra de movimientos (primeros 30) ──");
    moves.slice(0, 30).forEach(m => {
        console.log(`  "${m.name}"`);
        console.log(`    ${m.from} → ${m.to}`);
    });
    if (moves.length > 30) console.log(`  ... y ${moves.length - 30} más\n`);

    if (unmoved.length > 0) {
        console.log("── Sin match (primeros 15) ──");
        unmoved.slice(0, 15).forEach(u => console.log(`  "${u.name}" (${u.currentSlug} → ${u.targetSlug || "?"})`));
    }

    // ── APPLY ──
    if (!DRY_RUN) {
        console.log("\n📦 Aplicando movimientos...");
        let success = 0, errors = 0;
        const BATCH = 50;
        for (let i = 0; i < moves.length; i += BATCH) {
            const batch = moves.slice(i, i + BATCH);
            const promises = batch.map(m =>
                sb.from("products").update({ category_id: m.targetCatId }).eq("id", m.id)
                    .then(({ error }) => {
                        if (error) { console.error(`  ERR: ${m.name}: ${error.message}`); errors++; }
                        else success++;
                    })
            );
            await Promise.all(promises);
            process.stdout.write(`  Progress: ${Math.min(i + BATCH, moves.length)}/${moves.length}\r`);
        }
        console.log(`\n  ✅ Movidos: ${success} | ❌ Errores: ${errors}`);

        // Deactivate legacy subs
        console.log("\n🗑️ Desactivando sub-categorías legacy...");
        for (const slug of LEGACY_SLUGS) {
            const id = slugToId[slug];
            if (!id) { console.log(`  SKIP: ${slug} (no encontrada)`); continue; }
            const { error } = await sb.from("categories").update({ is_active: false }).eq("id", id);
            if (error) console.error(`  ERR desactivando ${slug}: ${error.message}`);
            else console.log(`  ✅ ${slug} → is_active = false`);
        }

        console.log("\n✅ Re-categorización completa!");
    } else {
        console.log("\n[DRY RUN] Ejecutar con --update para aplicar:");
        console.log("  node scripts/recategorize.js --update\n");
    }
}

main().catch(e => console.error("FATAL:", e));
