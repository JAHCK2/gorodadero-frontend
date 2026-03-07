// ═══════════════════════════════════════════
// API: /api/products — CRUD con Supabase JS
// GET: Paginación + Búsqueda + Filtros
// ═══════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { ITEMS_PER_PAGE } from "@/lib/constants";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
        const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") || String(ITEMS_PER_PAGE))));
        const search = searchParams.get("search")?.trim() || "";
        const categoryId = searchParams.get("categoryId") || null;
        const isActive = searchParams.get("isActive");

        // Build query
        let query = supabase
            .from("products")
            .select("*, categories(id, name, slug)", { count: "exact" });

        if (search) {
            query = query.ilike("name", `%${search}%`);
        }

        if (categoryId) {
            query = query.eq("category_id", categoryId);
        }

        if (isActive !== null && isActive !== "" && isActive !== undefined) {
            query = query.eq("is_active", isActive === "true");
        }

        // Pagination
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        const { data: products, count, error } = await query
            .order("name", { ascending: true })
            .range(from, to);

        if (error) {
            console.error("[API/products] GET error:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        const total = count || 0;

        // Serialize — map snake_case to camelCase + numbers
        const serialized = (products || []).map((p: Record<string, unknown>) => ({
            id: p.id,
            name: p.name,
            description: p.description,
            imageUrl: p.image_url,
            buyPrice: Number(p.buy_price) || 0,
            sellPrice: Number(p.sell_price) || 0,
            originalPrice: p.originalPrice ? Number(p.originalPrice) : null,
            discountPercentage: p.discountPercentage ? Number(p.discountPercentage) : null,
            stock: Number(p.stock) || 0,
            isActive: p.is_active,
            categoryId: p.category_id,
            unitType: p.unit_type || null,
            unitValue: p.unit_value ? Number(p.unit_value) : null,
            barcode: p.barcode || null,
            createdAt: p.created_at,
            updatedAt: p.updated_at,
            category: p.categories || null,
        }));

        return NextResponse.json({
            data: serialized,
            pagination: {
                page,
                pageSize,
                total,
                totalPages: Math.ceil(total / pageSize),
            },
        });
    } catch (error) {
        console.error("[API/products] GET error:", error);
        return NextResponse.json(
            { error: "Error al obtener productos" },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const { name, description, imageUrl, buyPrice, sellPrice, stock, categoryId, isActive } = body;

        if (!name || buyPrice === undefined || sellPrice === undefined || !categoryId) {
            return NextResponse.json(
                { error: "Campos requeridos: name, buyPrice, sellPrice, categoryId" },
                { status: 400 }
            );
        }

        const { data: product, error } = await supabase
            .from("products")
            .insert({
                name,
                description: description || null,
                image_url: imageUrl || null,
                buy_price: Math.round(Number(buyPrice)),
                sell_price: Math.round(Number(sellPrice)),
                stock: stock || 0,
                category_id: categoryId,
                is_active: isActive !== false,
            })
            .select("*, categories(id, name, slug)")
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            id: product.id,
            name: product.name,
            sellPrice: Number(product.sell_price),
            buyPrice: Number(product.buy_price),
            category: product.categories,
        }, { status: 201 });
    } catch (error) {
        console.error("[API/products] POST error:", error);
        return NextResponse.json(
            { error: "Error al crear producto" },
            { status: 500 }
        );
    }
}
