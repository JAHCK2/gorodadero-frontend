// API: /api/whatsapp — Genera el deep link de WhatsApp con la orden formateada
// TODO: Recibir datos de la orden, formatear mensaje, devolver URL wa.me

import { NextResponse } from "next/server";

export async function POST() {
    // TODO: Formatear mensaje con items, total, dirección. Devolver wa.me URL
    return NextResponse.json({ message: "POST /api/whatsapp — pendiente" });
}
