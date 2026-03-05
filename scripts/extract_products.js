// Extract all products + categories from Supabase (simple query)
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
    "https://wmbliuwzwaqhyqrkzciz.supabase.co",
    "sb_publishable_kpABfShzMMIMLoDq-TQwSw_MOHDuckh"
);

async function main() {
    // 1. Fetch all categories
    const { data: categories, error: cErr } = await supabase
        .from("categories")
        .select("*")
        .order("sort_order", { ascending: true });

    if (cErr) { console.error("Category error:", JSON.stringify(cErr)); return; }

    // Build lookup map
    const catMap = {};
    for (const c of categories) { catMap[c.id] = c.name; }

    console.log("=== CATEGORIES (" + categories.length + ") ===");
    console.log(JSON.stringify(categories, null, 2));

    // 2. Fetch all products (paginate with range to get all)
    let allProducts = [];
    let from = 0;
    const pageSize = 1000;
    while (true) {
        const { data, error } = await supabase
            .from("products")
            .select("*")
            .order("name", { ascending: true })
            .range(from, from + pageSize - 1);

        if (error) { console.error("Products error:", JSON.stringify(error)); break; }
        if (!data || data.length === 0) break;
        allProducts = allProducts.concat(data);
        if (data.length < pageSize) break;
        from += pageSize;
    }

    // Add category name to each product
    for (const p of allProducts) {
        p._category_name = catMap[p.category_id] || "SIN CATEGORÍA";
    }

    console.log("\n=== PRODUCTS (total: " + allProducts.length + ") ===");
    console.log(JSON.stringify(allProducts, null, 2));
}

main().catch(console.error);
