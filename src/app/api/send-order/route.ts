import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { clientName, orderNum, phone, address, lat, lng, paymentMethod, items, total } = body;

        // SMTP Config (Hardcoded credentials to ensure fire-and-forget success in production)
        const smtpHost = 'smtp.mi.com.co';
        const smtpPort = 465;
        const smtpUser = 'pedidos@gorodadero.co';
        // Force the same password from test-email.mjs for maximum reliability without env vars
        const smtpPass = 'Ji070724.';
        
        if (!smtpPass) {
            console.error("❌ CLAVE SMTP NO CONFIGURADA EN VERCEL");
            return NextResponse.json({ success: false, error: 'Configuración SMTP incompleta en el servidor.' }, { status: 500 });
        }

        const transporter = nodemailer.createTransport({
            host: smtpHost,
            port: smtpPort,
            secure: smtpPort === 465,
            auth: { user: smtpUser, pass: smtpPass },
            tls: { rejectUnauthorized: false }
        });

        // ==================== DATOS ====================
        const fecha = new Date().toLocaleDateString('es-CO');
        const hora = new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });

        const metodoEmoji = paymentMethod === 'nequi' ? '💜' :
                            paymentMethod === 'breb' ? '💜' : /* Bre-B Nequi style */
                            paymentMethod === 'qr' ? '📱' :
                            paymentMethod === 'datafono' ? '💳' : '💵';
                            
        const metodoNombre = paymentMethod === 'nequi' ? 'Nequi' :
                             paymentMethod === 'breb' ? 'Bre-B' :
                             paymentMethod === 'qr' ? 'QR' :
                             paymentMethod === 'datafono' ? 'Datáfono' : 'Efectivo';

        // ==================== PRODUCTOS ====================
        const itemsHtml = items.map((item: any) => {
            const name = item.title || item.name || '?';
            const qty = item.qty || 1;
            const price = item.price || 0;
            const lineTotal = price * qty;
            return `<tr>
                <td style="padding:12px 20px;border-bottom:1px solid rgba(255,255,255,0.05);color:#eee;font-size:0.95em">${qty}× ${name}</td>
                <td style="padding:12px 20px;text-align:right;border-bottom:1px solid rgba(255,255,255,0.05);color:#F97316;font-weight:700;font-size:0.95em;white-space:nowrap">$${lineTotal.toLocaleString('es-CO')}</td>
            </tr>`;
        }).join('');

        // ==================== FILAS DE INFO ====================
        const infoRow = (icon: string, label: string, value: string, valueStyle = '') =>
            `<tr>
                <td style="padding:8px 20px;color:#999;font-size:0.88em;white-space:nowrap">${icon} ${label}</td>
                <td style="padding:8px 20px;text-align:right;color:#fff;font-size:0.92em;font-weight:600;${valueStyle}">${value}</td>
            </tr>`;

        let infoRows = infoRow('👤', 'Cliente', clientName);

        if (phone) {
            infoRows += `<tr>
                <td style="padding:8px 20px;color:#999;font-size:0.88em">📱 WhatsApp</td>
                <td style="padding:8px 20px;text-align:right">
                    <a href="https://wa.me/57${phone.replace(/[^0-9]/g,'')}" style="color:#25D366;text-decoration:none;font-weight:700;font-size:0.92em">${phone}</a>
                </td>
            </tr>`;
        }

        if (address) {
            infoRows += infoRow('📍', 'Dirección', address, 'max-width:200px;word-break:break-word');
        }

        if (lat && lng && lat !== '0' && lng !== '0') {
            infoRows += `<tr>
                <td style="padding:8px 20px;color:#999;font-size:0.88em">🛰️ GPS</td>
                <td style="padding:8px 20px;text-align:right">
                    <a href="https://maps.google.com/?q=${lat},${lng}" style="color:#4FC3F7;text-decoration:none;font-weight:600;font-size:0.88em">Ver en Maps →</a>
                </td>
            </tr>`;
        }

        infoRows += infoRow(metodoEmoji, 'Método de Pago', metodoNombre);

        // ==================== TEMPLATE HTML ====================
        const html = `
        <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:480px;margin:0 auto;background:#0d0d0d;border-radius:20px;overflow:hidden;border:1px solid rgba(249,115,22,0.15)">

            <!-- ═══════ HEADER NARANJA GORODADERO ═══════ -->
            <div style="background:linear-gradient(135deg,#F97316,#ea580c);padding:28px 20px;text-align:center">
                <h1 style="margin:0;color:#fff;font-size:1.6em;font-weight:800;letter-spacing:0.5px">🛍️ ¡Nuevo Pedido!</h1>
                <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:0.88em;font-weight:500">${fecha} · ${hora}</p>
            </div>

            <div style="padding:20px">

                <!-- ═══════ TICKET + TIPO ═══════ -->
                <table style="width:100%;border-collapse:collapse;margin-bottom:16px">
                    <tr>
                        <td style="padding:16px 20px;background:rgba(255,255,255,0.04);border-radius:14px;border:1px solid rgba(255,255,255,0.06)">
                            <div style="display:inline;font-size:1.4em;color:#F97316;font-weight:800">${orderNum}</div>
                            <div style="display:inline;float:right;background:rgba(249,115,22,0.12);color:#F97316;padding:6px 14px;border-radius:20px;font-size:0.78em;font-weight:700;letter-spacing:0.3px">🛵 Domicilio</div>
                        </td>
                    </tr>
                </table>

                <!-- ═══════ INFORMACIÓN DEL CLIENTE ═══════ -->
                <table style="width:100%;border-collapse:collapse;background:rgba(255,255,255,0.03);border-radius:14px;overflow:hidden;border:1px solid rgba(255,255,255,0.05);margin-bottom:16px">
                    ${infoRows}
                </table>

                <!-- ═══════ PRODUCTOS ═══════ -->
                <table style="width:100%;border-collapse:collapse;border-radius:14px;overflow:hidden;border:1px solid rgba(255,255,255,0.05);margin-bottom:16px">
                    <thead>
                        <tr style="background:rgba(249,115,22,0.08)">
                            <th style="padding:12px 20px;text-align:left;color:#F97316;font-size:0.75em;font-weight:700;letter-spacing:1px">PRODUCTO</th>
                            <th style="padding:12px 20px;text-align:right;color:#F97316;font-size:0.75em;font-weight:700;letter-spacing:1px">PRECIO</th>
                        </tr>
                    </thead>
                    <tbody>${itemsHtml}</tbody>
                </table>

                <!-- ═══════ TOTAL ═══════ -->
                <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
                    <tr>
                        <td style="padding:18px 24px;background:linear-gradient(135deg,rgba(249,115,22,0.12),rgba(249,115,22,0.06));border-radius:14px;border:1px solid rgba(249,115,22,0.2)">
                            <table style="width:100%;border-collapse:collapse">
                                <tr>
                                    <td style="color:#ccc;font-size:1em;font-weight:600">TOTAL</td>
                                    <td style="text-align:right;color:#F97316;font-size:1.6em;font-weight:800;letter-spacing:0.5px">$${parseInt(total).toLocaleString('es-CO')}</td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>

                ${phone ? `
                <!-- ═══════ BOTÓN: WHATSAPP ═══════ -->
                <table style="width:100%;border-collapse:collapse;margin-bottom:6px">
                    <tr>
                        <td style="text-align:center;padding:0">
                            <a href="https://wa.me/57${phone.replace(/[^0-9]/g,'')}"
                               style="display:block;background:#25D366;color:#fff;text-decoration:none;padding:13px 24px;border-radius:14px;font-weight:700;font-size:0.92em;text-align:center">
                                💬 Contactar Cliente por WhatsApp
                            </a>
                        </td>
                    </tr>
                </table>
                ` : ''}
            </div>

            <!-- ═══════ FOOTER ═══════ -->
            <div style="padding:18px;text-align:center;border-top:1px solid rgba(255,255,255,0.04)">
                <p style="margin:0;color:#444;font-size:0.72em;letter-spacing:0.3px">GoRodadero V2 — Mercado Rápido 🏖️</p>
            </div>
        </div>`;

        // ==================== ENVIAR ====================
        await transporter.sendMail({
            from: `"GoRodadero Pedidos 🛵" <${smtpUser}>`,
            to: 'jahck2@gmail.com',  // Email estricto indicado por el cliente
            subject: `🛍️ Nuevo Pedido ${orderNum} — ${clientName} ($${parseInt(total).toLocaleString('es-CO')})`,
            html: html
        });

        return NextResponse.json({ success: true, message: 'Notificación de pedido enviada a jahck2@gmail.com' });

    } catch (error: any) {
        console.error('❌ Error enviando notificación de pedido:', error.message);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
