const { createClient } = require("@supabase/supabase-js");
const s = createClient("https://wmbliuwzwaqhyqrkzciz.supabase.co", "sb_publishable_kpABfShzMMIMLoDq-TQwSw_MOHDuckh");

(async () => {
    const { data } = await s.from("categories").select("*").limit(5);
    console.log("Column names:", Object.keys(data[0]));
    data.forEach(c => console.log(JSON.stringify({ name: c.name, id: c.id, parentId: c.parentId, parent_id: c.parent_id })));

    const { data: macros, count } = await s.from("categories").select("*", { count: "exact" }).is("parentId", null);
    console.log("Macros with parentId IS NULL:", macros?.length, "count:", count);

    // Check if maybe the column is parent_id
    const { data: m2 } = await s.from("categories").select("*").is("parent_id", null);
    console.log("Macros with parent_id IS NULL:", m2?.length);

    // Get ALL categories and check which have no parent
    const { data: all } = await s.from("categories").select("*");
    const noParent = all.filter(c => c.parentId === null && c.parent_id === null && c.parentid === null);
    console.log("Total categories:", all.length);
    console.log("No parent at all:", noParent.length);

    // Show first 3 full objects
    console.log("\nFirst 3 full objects:");
    all.slice(0, 3).forEach(c => console.log(JSON.stringify(c)));

    process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
