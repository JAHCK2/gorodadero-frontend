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
    // Fetch categories
    const categoriesRes = await supabase.from("categories").select("*").order("sort_order", { ascending: true });

    if (categoriesRes.error) console.error("[Admin/Categorias] Categories error:", categoriesRes.error);

    // Fetch ALL products (Supabase caps at 1000 per request, so paginate)
    let allProducts: Record<string, unknown>[] = [];
    let offset = 0;
    const PAGE = 1000;
    while (true) {
        const { data, error } = await supabase
            .from("products")
            .select("*")
            .order("name", { ascending: true })
            .range(offset, offset + PAGE - 1);
        if (error) { console.error("[Admin/Categorias] Products error:", error); break; }
        allProducts = allProducts.concat(data || []);
        if (!data || data.length < PAGE) break;
        offset += PAGE;
    }
    console.log(`[Admin/Categorias] Loaded ${allProducts.length} products`);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const categories = (categoriesRes.data || []).map((c: Record<string, any>) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        icon: c.icon,
        sortOrder: c.sort_order ?? 0,
        isActive: c.is_active ?? true,
        parentId: c.parentId ?? c.parentid ?? null,
    }));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const products = (allProducts).map((p: Record<string, any>) => ({
        id: p.id,
        name: p.name || "",
        description: p.description || "",
        imageUrl: p.image_url || "",
        sellPrice: Number(p.sell_price) || 0,
        buyPrice: Number(p.buy_price) || 0,
        stock: Number(p.stock) || 0,
        categoryId: p.category_id,
        unitType: p.unit_type || "",
        unitValue: p.unit_value != null ? Number(p.unit_value) : null,
        barcode: p.barcode || null,
        isActive: p.is_active ?? true,
        createdAt: p.created_at || "",
        updatedAt: p.updated_at || "",
    }));

    return (
        <MerchandisingClient
            categories={categories}
            products={products}
        />
    );
}
