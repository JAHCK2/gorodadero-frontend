// API: /api/orders — Endpoints de órdenes
// TODO: GET (listar órdenes), POST (crear nueva orden)

import { NextResponse } from "next/server";

export async function GET() {
    // TODO: Prisma query con filtro por status, paginación
    return NextResponse.json({ message: "GET /api/orders — pendiente" });
}

export async function POST() {
    // TODO: Validar body, crear orden + items, disparar evento realtime
    return NextResponse.json({ message: "POST /api/orders — pendiente" });
}
