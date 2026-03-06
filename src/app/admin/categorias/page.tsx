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
    const [categoriesRes, productsRes] = await Promise.all([
        supabase
            .from("categories")
            .select("id, name, slug, icon, sort_order, is_active, parentId")
            .order("sort_order", { ascending: true }),
        supabase
            .from("products")
            .select("id, name, sell_price, category_id")
            .order("name", { ascending: true })
            .limit(5000),
    ]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const categories = (categoriesRes.data || []).map((c: Record<string, any>) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        icon: c.icon,
        sortOrder: c.sort_order,
        isActive: c.is_active ?? true,
        parentId: c.parentId ?? null,
    }));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const products = (productsRes.data || []).map((p: Record<string, any>) => ({
        id: p.id,
        name: p.name,
        sellPrice: Number(p.sell_price) || 0,
        categoryId: p.category_id,
    }));

    return (
        <MerchandisingClient
            categories={categories}
            products={products}
        />
    );
}
