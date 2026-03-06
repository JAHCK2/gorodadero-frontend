import { createClient } from "@supabase/supabase-js"
import CatalogClient from "@/components/tienda/CatalogClient"

// Use environment variables for Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || ""

// ISR: regenerate page every 60s in background — visitors get instant cached response
export const revalidate = 60;

export default async function HomePage() {
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Fetch all categories and all products in parallel
    const [categoriesRes, productsRes] = await Promise.all([
        supabase.from("categories").select("*").eq("is_active", true).order("sort_order", { ascending: true }),
        supabase.from("products").select("*").order("name", { ascending: true }).limit(3000)
    ]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const allCategories = (categoriesRes.data || []).map((c: Record<string, any>) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        icon: c.icon,
        sortOrder: c.sort_order,
        isActive: c.is_active,
        parentId: c.parentId ?? c.parentid ?? null, // Handle Postgres casing
        createdAt: c.created_at,
        updatedAt: c.updated_at
    }));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const products = (productsRes.data || []).map((p: Record<string, any>) => ({
        id: p.id,
        name: p.name,
        description: p.description || null,
        imageUrl: p.image_url || null,
        buyPrice: p.buy_price ? Number(p.buy_price) : 0,
        sellPrice: p.sell_price ? Number(p.sell_price) : 0,
        originalPrice: p.originalprice ? Number(p.originalprice) : (p.originalPrice ? Number(p.originalPrice) : null),
        discountPercentage: p.discountpercentage ? Number(p.discountpercentage) : (p.discountPercentage ? Number(p.discountPercentage) : null),
        stock: p.stock ?? 0,
        categoryId: p.category_id,
        isActive: p.is_active ?? true,
        barcode: p.barcode || null,
        unitValue: p.unit_value ? Number(p.unit_value) : null,
        unitType: p.unit_type || null,
        createdAt: p.created_at,
        updatedAt: p.updated_at
    }));

    // Separate macro-categories (no parent) vs subcategories (has parent)
    const macroCategories = allCategories.filter((c) => c.parentId === null);
    const subcategories = allCategories.filter((c) => c.parentId !== null);

    return (
        <CatalogClient
            macroCategories={macroCategories}
            subcategories={subcategories}
            initialProducts={products}
        />
    );
}
