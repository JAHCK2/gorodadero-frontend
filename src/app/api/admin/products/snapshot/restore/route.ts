// ═══════════════════════════════════════════
// API: Restore a snapshot backup
// POST /api/admin/products/snapshot/restore
// Body: { filename: string }
// ═══════════════════════════════════════════

import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const SNAPSHOT_DIR = path.join(process.cwd(), ".snapshots");

export async function POST(req: NextRequest) {
    try {
        const { filename } = await req.json() as { filename: string };
        if (!filename) return NextResponse.json({ error: "filename required" }, { status: 400 });

        const filePath = path.join(SNAPSHOT_DIR, filename);
        const content = await fs.readFile(filePath, "utf-8");
        const snapshot = JSON.parse(content);

        if (!snapshot.data || !Array.isArray(snapshot.data)) {
            return NextResponse.json({ error: "Invalid snapshot format" }, { status: 400 });
        }

        // Restore each product's category_id and attributes
        let restored = 0;
        const errors: string[] = [];

        for (const p of snapshot.data) {
            const updateData: Record<string, unknown> = {};
            if (p.category_id) updateData.category_id = p.category_id;
            if (p.name) updateData.name = p.name;
            if (p.sell_price !== undefined) updateData.sell_price = p.sell_price;
            if (p.buy_price !== undefined) updateData.buy_price = p.buy_price;
            if (p.stock !== undefined) updateData.stock = p.stock;
            if (p.unit_type !== undefined) updateData.unit_type = p.unit_type;
            if (p.unit_value !== undefined) updateData.unit_value = p.unit_value;
            if (p.barcode !== undefined) updateData.barcode = p.barcode;

            const { error } = await supabase
                .from("products")
                .update(updateData)
                .eq("id", p.id);

            if (error) errors.push(`${p.name}: ${error.message}`);
            else restored++;
        }

        return NextResponse.json({
            success: true,
            restored,
            total: snapshot.data.length,
            errors: errors.length > 0 ? errors.slice(0, 5) : undefined,
        });
    } catch (err) {
        return NextResponse.json({ error: String(err) }, { status: 500 });
    }
}
