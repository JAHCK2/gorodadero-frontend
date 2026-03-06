// ═══════════════════════════════════════════
// API: Inline product update
// PATCH /api/admin/products/update
// Body: { id, name?, sell_price?, buy_price?, stock?, unit_type?, unit_value?, barcode? }
// ═══════════════════════════════════════════

import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function PATCH(req: NextRequest) {
    try {
        const body = await req.json();
        const { id, ...fields } = body as {
            id: string;
            name?: string;
            sell_price?: number;
            buy_price?: number;
            stock?: number;
            unit_type?: string;
            unit_value?: number;
            barcode?: string;
        };

        if (!id) {
            return NextResponse.json({ error: "Product id is required" }, { status: 400 });
        }

        // Only include non-undefined fields
        const updateData: Record<string, unknown> = {};
        if (fields.name !== undefined) updateData.name = fields.name;
        if (fields.sell_price !== undefined) updateData.sell_price = Math.round(Number(fields.sell_price));
        if (fields.buy_price !== undefined) updateData.buy_price = Math.round(Number(fields.buy_price));
        if (fields.stock !== undefined) updateData.stock = Number(fields.stock);
        if (fields.unit_type !== undefined) updateData.unit_type = fields.unit_type;
        if (fields.unit_value !== undefined) updateData.unit_value = Number(fields.unit_value);
        if (fields.barcode !== undefined) updateData.barcode = fields.barcode || null;

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
