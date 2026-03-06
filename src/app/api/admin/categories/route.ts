// ═══════════════════════════════════════════
// API: Bulk update category sort_order
// PATCH /api/admin/categories
// Body: { updates: { id: string, sort_order: number }[] }
// ═══════════════════════════════════════════

import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function PATCH(req: NextRequest) {
    try {
        const { updates } = await req.json() as {
            updates: { id: string; sort_order: number }[];
        };

        if (!updates || !Array.isArray(updates) || updates.length === 0) {
            return NextResponse.json({ error: "No updates provided" }, { status: 400 });
        }

        // Update each category's sort_order
        const results = await Promise.all(
            updates.map(({ id, sort_order }) =>
                supabase.from("categories").update({ sort_order }).eq("id", id)
            )
        );

        const errors = results.filter(r => r.error);
        if (errors.length > 0) {
            return NextResponse.json(
                { error: "Some updates failed", details: errors.map(e => e.error?.message) },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true, updated: updates.length });
    } catch (err) {
        return NextResponse.json({ error: String(err) }, { status: 500 });
    }
}
