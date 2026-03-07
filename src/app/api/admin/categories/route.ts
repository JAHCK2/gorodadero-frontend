// ═══════════════════════════════════════════
// API: Category management
// PATCH /api/admin/categories — Bulk update sort_order
// POST  /api/admin/categories — Create new category
// DELETE /api/admin/categories — Delete a category
// ═══════════════════════════════════════════

import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function slugify(text: string) {
    return text.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/ñ/g, 'n')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

export async function PATCH(req: NextRequest) {
    try {
        const { updates } = await req.json() as {
            updates: { id: string; sort_order: number }[];
        };

        if (!updates || !Array.isArray(updates) || updates.length === 0) {
            return NextResponse.json({ error: "No updates provided" }, { status: 400 });
        }

        const results = await Promise.all(
            updates.map(({ id, sort_order }) =>
                supabase.from("categories").update({ sort_order }).eq("id", id)
            )
        );

        const errors = results.filter(r => r.error);
        if (errors.length > 0) {
            return NextResponse.json(
                { error: "Some updates failed", details: errors.map(e => e.error?.message) },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true, updated: updates.length });
    } catch (err) {
        return NextResponse.json({ error: String(err) }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json() as {
            name: string;
            icon?: string;
            parentId?: string | null;
        };

        if (!body.name || body.name.trim().length === 0) {
            return NextResponse.json({ error: "Name is required" }, { status: 400 });
        }

        const name = body.name.trim();
        const suffix = body.parentId ? '-sub' : '-macro';
        const slug = slugify(name) + suffix;

        // Get next sort_order
        const { data: existing } = body.parentId
            ? await supabase.from("categories").select("sort_order").eq("parentId", body.parentId).order("sort_order", { ascending: false }).limit(1)
            : await supabase.from("categories").select("sort_order").is("parentId", null).order("sort_order", { ascending: false }).limit(1);

        const nextOrder = (existing && existing.length > 0 ? existing[0].sort_order : 0) + 1;

        const insertData: Record<string, unknown> = {
            name,
            slug,
            icon: body.icon || (body.parentId ? '📦' : '📁'),
            sort_order: nextOrder,
            is_active: true,
        };
        if (body.parentId) insertData.parentId = body.parentId;

        const { data, error } = await supabase
            .from("categories")
            .insert(insertData)
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, category: data });
    } catch (err) {
        return NextResponse.json({ error: String(err) }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const { id } = await req.json() as { id: string };
        if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

        // Check for products using this category
        const { count } = await supabase.from("products").select("*", { count: "exact", head: true }).eq("category_id", id);
        if (count && count > 0) {
            return NextResponse.json({ error: `No se puede eliminar: tiene ${count} productos asignados` }, { status: 400 });
        }

        // Check for subcategories
        const { count: subCount } = await supabase.from("categories").select("*", { count: "exact", head: true }).eq("parentId", id);
        if (subCount && subCount > 0) {
            return NextResponse.json({ error: `No se puede eliminar: tiene ${subCount} subcategorías` }, { status: 400 });
        }

        const { error } = await supabase.from("categories").delete().eq("id", id);
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });

        return NextResponse.json({ success: true });
    } catch (err) {
        return NextResponse.json({ error: String(err) }, { status: 500 });
    }
}
