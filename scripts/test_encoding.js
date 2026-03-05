// Quick encoding test
const { createClient } = require("@supabase/supabase-js");
const s = createClient(
    "https://wmbliuwzwaqhyqrkzciz.supabase.co",
    "sb_publishable_kpABfShzMMIMLoDq-TQwSw_MOHDuckh"
);

(async () => {
    const { data } = await s
        .from("products")
        .select("name")
        .order("name")
        .limit(2253);

    // Find all names that contain non-ASCII characters
    const special = data.filter(p =>
        /[^\x20-\x7E]/.test(p.name) || /├|┐|║/.test(p.name)
    );

    console.log("Products with special chars:", special.length);
    const sample = special.slice(0, 15);
    for (const p of sample) {
        const chars = Array.from(p.name).map(c => {
            const code = c.charCodeAt(0);
            return code > 127 ? `[${c}:U+${code.toString(16).padStart(4, '0')}]` : c;
        }).join("");
        console.log("RAW:", p.name);
        console.log("HEX:", chars);
        console.log("---");
    }
})();
