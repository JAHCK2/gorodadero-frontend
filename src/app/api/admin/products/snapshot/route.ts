// ═══════════════════════════════════════════
// API: Snapshot backup system for product-category assignments  
// POST /api/admin/products/snapshot — save current state
// GET  /api/admin/products/snapshot — list snapshots
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

async function ensureDir() {
    try { await fs.mkdir(SNAPSHOT_DIR, { recursive: true }); } catch { }
}

export async function POST(req: NextRequest) {
    try {
        await ensureDir();
        const body = await req.json().catch(() => ({}));
        const label = body.label || `Backup ${new Date().toLocaleString("es-CO")}`;

        // Fetch current product-category assignments
        const { data: products, error } = await supabase
            .from("products")
            .select("id, name, category_id, sell_price, buy_price, stock, unit_type, unit_value, barcode");

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });

        const snapshot = {
            label,
            createdAt: new Date().toISOString(),
            productCount: products?.length || 0,
            data: products || [],
        };

        const filename = `snapshot_${Date.now()}.json`;
        await fs.writeFile(path.join(SNAPSHOT_DIR, filename), JSON.stringify(snapshot, null, 2));

        // Keep only last 10 snapshots
        const files = (await fs.readdir(SNAPSHOT_DIR))
            .filter(f => f.startsWith("snapshot_") && f.endsWith(".json"))
            .sort()
            .reverse();
        for (const old of files.slice(10)) {
            await fs.unlink(path.join(SNAPSHOT_DIR, old)).catch(() => { });
        }

        return NextResponse.json({ success: true, filename, label, products: snapshot.productCount });
    } catch (err) {
        return NextResponse.json({ error: String(err) }, { status: 500 });
    }
}

export async function GET() {
    try {
        await ensureDir();
        const files = (await fs.readdir(SNAPSHOT_DIR))
            .filter(f => f.startsWith("snapshot_") && f.endsWith(".json"))
            .sort()
            .reverse();

        const snapshots = await Promise.all(
            files.map(async (f) => {
                const content = await fs.readFile(path.join(SNAPSHOT_DIR, f), "utf-8");
                const snap = JSON.parse(content);
                return {
                    filename: f,
                    label: snap.label,
                    createdAt: snap.createdAt,
                    productCount: snap.productCount,
                };
            })
        );

        return NextResponse.json({ snapshots });
    } catch {
        return NextResponse.json({ snapshots: [] });
    }
}
