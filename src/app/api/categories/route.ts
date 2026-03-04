// API: /api/categories — Endpoints de categorías
// TODO: GET (listar categorías activas ordenadas)

import { NextResponse } from "next/server";

export async function GET() {
    // TODO: Prisma query ordenada por sortOrder
    return NextResponse.json({ message: "GET /api/categories — pendiente" });
}
