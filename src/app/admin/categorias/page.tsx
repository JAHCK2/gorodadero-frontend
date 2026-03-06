// ═══════════════════════════════════════════
// Admin — Gestión de Categorías & Merchandising Visual
// Server component: fetches data → passes to MerchandisingClient
// ═══════════════════════════════════════════

import { createClient } from "@supabase/supabase-js";
import MerchandisingClient from "@/components/admin/MerchandisingClient";

export const dynamic = "force-dynamic";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function AdminCategoriasPage() {
    // Use select("*") to avoid column name case sensitivity issues
    const [categoriesRes, productsRes] = await Promise.all([
        supabase.from("categories").select("*").order("sort_order", { ascending: true }),
        supabase.from("products").select("*").order("name", { ascending: true }).limit(5000),
    ]);

    if (categoriesRes.error) console.error("[Admin/Categorias] Categories error:", categoriesRes.error);
    if (productsRes.error) console.error("[Admin/Categorias] Products error:", productsRes.error);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const categories = (categoriesRes.data || []).map((c: Record<string, any>) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        icon: c.icon,
        sortOrder: c.sort_order ?? 0,
        isActive: c.is_active ?? true,
        parentId: c.parentId ?? c.parentid ?? null, // Handle Postgres casing
    }));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const products = (productsRes.data || []).map((p: Record<string, any>) => ({
        id: p.id,
        name: p.name,
        sellPrice: Number(p.sell_price) || 0,
        buyPrice: Number(p.buy_price) || 0,
        stock: Number(p.stock) || 0,
        categoryId: p.category_id,
        unitType: p.unit_type || "",
        unitValue: p.unit_value != null ? Number(p.unit_value) : null,
        barcode: p.barcode || "",
    }));

    return (
        <MerchandisingClient
            categories={categories}
            products={products}
        />
    );
}
