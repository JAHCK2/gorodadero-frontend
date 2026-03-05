// ═══════════════════════════════════════════
// API: /api/categories — Listado jerárquico
// Usa Supabase JS (sin Prisma)
// ═══════════════════════════════════════════

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
    try {
        const { data: categories, error } = await supabase
            .from("categories")
            .select("*")
            .order("sort_order", { ascending: true });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        interface CategoryItem {
            id: string;
            name: string;
            slug: string;
            icon: string | null;
            sortOrder: number;
            isActive: boolean;
            parentId: string | null;
        }

        const allCategories: CategoryItem[] = (categories || []).map((c: Record<string, unknown>) => ({
            id: String(c.id),
            name: String(c.name),
            slug: String(c.slug),
            icon: c.icon ? String(c.icon) : null,
            sortOrder: Number(c.sort_order) || 0,
            isActive: Boolean(c.is_active),
            parentId: c.parentId ? String(c.parentId) : null,
        }));

        // Separar macro-categorías y subcategorías
        const macros = allCategories.filter((c) => c.parentId === null);
        const subs = allCategories.filter((c) => c.parentId !== null);

        const hierarchy = macros.map((macro) => ({
            ...macro,
            children: subs.filter((s) => s.parentId === macro.id),
        }));

        return NextResponse.json({
            all: allCategories,
            hierarchy,
            total: allCategories.length,
        });
    } catch (error) {
        console.error("[API/categories] GET error:", error);
        return NextResponse.json(
            { error: "Error al obtener categorías" },
            { status: 500 }
        );
    }
}
