// ═══════════════════════════════════════════
// API: Inline product update
// PATCH /api/admin/products/update
// Accepts any product field for update
// ═══════════════════════════════════════════

import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function PATCH(req: NextRequest) {
    try {
        const body = await req.json() as Record<string, unknown>;
        const id = body.id as string;

        if (!id) {
            return NextResponse.json({ error: "Product id is required" }, { status: 400 });
        }

        // Map all possible fields
        const updateData: Record<string, unknown> = {};
        if (body.name !== undefined) updateData.name = body.name;
        if (body.sell_price !== undefined) updateData.sell_price = Math.round(Number(body.sell_price));
        if (body.buy_price !== undefined) updateData.buy_price = Math.round(Number(body.buy_price));
        if (body.stock !== undefined) updateData.stock = Number(body.stock);
        if (body.unit_type !== undefined) updateData.unit_type = body.unit_type;
        if (body.unit_value !== undefined) updateData.unit_value = Number(body.unit_value);
        if (body.description !== undefined) updateData.description = body.description;
        if (body.image_url !== undefined) updateData.image_url = body.image_url;
        if (body.is_active !== undefined) updateData.is_active = body.is_active;

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ error: "No fields to update" }, { status: 400 });
        }

        const { data, error } = await supabase
            .from("products")
            .update(updateData)
            .eq("id", id)
            .select("id, name")
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, product: data });
    } catch (err) {
        return NextResponse.json({ error: String(err) }, { status: 500 });
    }
}
