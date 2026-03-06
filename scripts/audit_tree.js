const { createClient } = require("@supabase/supabase-js");
const sb = createClient(
    "https://wmbliuwzwaqhyqrkzciz.supabase.co",
    "sb_publishable_kpABfShzMMIMLoDq-TQwSw_MOHDuckh"
);

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

async function audit() {
    const [cats, prods] = await Promise.all([
        fetchAll("categories", "*"),
        fetchAll("products", "id, name, category_id"),
    ]);

    const macros = cats.filter(c => !c.parentId);
    const subs = cats.filter(c => c.parentId);
    const catCount = {};
    prods.forEach(p => { catCount[p.category_id] = (catCount[p.category_id] || 0) + 1; });

    const orphans = prods.filter(p => !p.category_id);
    const macroIds = new Set(macros.map(m => m.id));
    const directMacro = prods.filter(p => macroIds.has(p.category_id));
    const emptySubs = subs.filter(s => !catCount[s.id]);

    console.log("=== ARBOL DE INVENTARIO GORODADERO ===");
    console.log("Total productos:", prods.length);
    console.log("Total macro-categorias:", macros.length);
    console.log("Total sub-categorias:", subs.length);
    console.log("");

    macros.sort((a, b) => a.sort_order - b.sort_order).forEach((m, i) => {
        const mySubs = subs.filter(s => s.parentId === m.id).sort((a, b) => a.sort_order - b.sort_order);
        const macroTotal = mySubs.reduce((sum, s) => sum + (catCount[s.id] || 0), 0) + (catCount[m.id] || 0);
        console.log(`${i + 1}. MACRO: ${m.icon || ""} ${m.name} (${macroTotal} productos)`);
        mySubs.forEach(s => {
            const cnt = catCount[s.id] || 0;
            console.log(`   SUB: ${s.name} (${cnt})${cnt === 0 ? " ** VACIO **" : ""}`);
        });
        if (catCount[m.id]) {
            console.log(`   !! DIRECTO EN MACRO: ${catCount[m.id]} productos`);
        }
        console.log("");
    });

    console.log("=== DIAGNOSTICO ===");
    console.log("Productos sin categoria (null):", orphans.length);
    if (orphans.length > 0) orphans.slice(0, 10).forEach(p => console.log("  -", p.name));
    console.log("Sub-categorias vacias:", emptySubs.length);
    emptySubs.forEach(s => console.log("  -", s.name));
    console.log("Productos en macro (sin sub):", directMacro.length);
    if (directMacro.length > 0) directMacro.slice(0, 15).forEach(p => console.log("  -", p.name));
}

audit().catch(e => console.error("FATAL:", e));
