// ═══════════════════════════════════════════
// API: Database migration — adds missing columns 
// POST /api/admin/migrate
// One-time use to add barcode column + any other missing fields
// ═══════════════════════════════════════════

import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST() {
    const results: { column: string; status: string }[] = [];

    // Columns to ensure exist on "products" table
    const columns = [
        { name: "barcode", type: "text", default: "NULL" },
        { name: "unit_type", type: "text", default: "NULL" },
        { name: "unit_value", type: "numeric", default: "NULL" },
    ];

    for (const col of columns) {
        try {
            // Try to select the column — if it fails, it doesn't exist
            const { error: checkError } = await supabase
                .from("products")
                .select(col.name)
                .limit(1);

            if (checkError && checkError.message.includes("does not exist")) {
                // Column missing — add it via rpc or raw query
                // Supabase JS doesn't support ALTER TABLE directly,
                // so we use the REST API with a postgres function
                const { error: rpcError } = await supabase.rpc("exec_sql", {
                    query: `ALTER TABLE products ADD COLUMN IF NOT EXISTS ${col.name} ${col.type} DEFAULT ${col.default};`
                });

                if (rpcError) {
                    // Fallback: try direct insert with the column to trigger auto-creation
                    results.push({ column: col.name, status: `needs_manual: ${rpcError.message}` });
                } else {
                    results.push({ column: col.name, status: "created" });
                }
            } else {
                results.push({ column: col.name, status: "exists" });
            }
        } catch (err) {
            results.push({ column: col.name, status: `error: ${err}` });
        }
    }

    return NextResponse.json({ success: true, results });
}
