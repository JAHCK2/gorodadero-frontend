// API: /api/products — Endpoints de productos
// TODO: GET (listar/filtrar/paginar), POST (crear producto)

import { NextResponse } from "next/server";

export async function GET() {
    // TODO: Prisma query con paginación, filtros por categoría, búsqueda
    return NextResponse.json({ message: "GET /api/products — pendiente" });
}

export async function POST() {
    // TODO: Validar body, crear producto en DB
    return NextResponse.json({ message: "POST /api/products — pendiente" });
}
