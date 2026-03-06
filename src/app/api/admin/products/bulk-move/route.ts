// ═══════════════════════════════════════════
// API: Bulk move products to a new category
// PATCH /api/admin/products/bulk-move
// Body: { productIds: string[], targetCategoryId: string }
// ═══════════════════════════════════════════

import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function PATCH(req: NextRequest) {
    try {
        const { productIds, targetCategoryId } = await req.json() as {
            productIds: string[];
            targetCategoryId: string;
        };

        if (!productIds?.length || !targetCategoryId) {
            return NextResponse.json(
                { error: "productIds and targetCategoryId are required" },
                { status: 400 }
            );
        }

        // Verify target category exists
        const { data: cat } = await supabase
            .from("categories")
            .select("id, name")
            .eq("id", targetCategoryId)
            .single();

        if (!cat) {
            return NextResponse.json({ error: "Target category not found" }, { status: 404 });
        }

        // Bulk update
        const { error, count } = await supabase
            .from("products")
            .update({ category_id: targetCategoryId })
            .in("id", productIds);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            moved: count || productIds.length,
            targetCategory: cat.name,
        });
    } catch (err) {
        return NextResponse.json({ error: String(err) }, { status: 500 });
    }
}
