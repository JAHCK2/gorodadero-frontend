import type { CartItem } from "@/types/product";
import { formatCOP } from "@/lib/money";

interface OrderData {
    clientName: string;
    phone: string;
    address: string;
    lat: string;
    lng: string;
    paymentMethod: 'efectivo' | 'nequi' | 'breb' | 'qr' | 'datafono';
    billAmount: number; // Only for efectivo
}

export function generateWhatsAppLink(
    orderData: OrderData,
    cartItems: CartItem[],
    total: number
): string {
    const WHATSAPP_NUMBER = "573202499339"; // Número oficial de GoRodadero (sin el signo +)

    let text = '\uD83E\uDD85 *GORODADERO | Tu Súper en Minutos*\n';
    text += '━━━━━━━━━━━━━━━━━━━━\n\n';

    // 1. Datos del Cliente
    text += `\uD83D\uDC64 *Cliente:* ${orderData.clientName}\n`;
    text += `\uD83D\uDCF1 *Celular:* ${orderData.phone}\n`;
    text += `\uD83D\uDCCD *Dirección:* ${orderData.address}\n`;

    if (orderData.lat && orderData.lng) {
        text += `\uD83D\uDDFA\uFE0F *GPS Exacto:* https://maps.google.com/?q=${orderData.lat},${orderData.lng}\n`;
    }

    // 2. Resumen del Carrito
    text += '\n\uD83D\uDED2 *MI PEDIDO:*\n';
    cartItems.forEach(item => {
        const lineTotal = item.product.sellPrice * item.quantity;
        text += `\u25AA ${item.quantity}x ${item.product.name} → ${formatCOP(lineTotal)}\n`;
    });

    // 3. Matemática y Finanzas
    text += '\n━━━━━━━━━━━━━━━━━━━━\n';
    text += `\uD83D\uDCB0 *TOTAL A PAGAR: ${formatCOP(total)}*\n`;

    if (orderData.paymentMethod === 'efectivo') {
        text += `\uD83D\uDCB5 *Modo:* Pago en Efectivo\n`;
        text += `\uD83D\uDCB8 *Pagará con:* ${formatCOP(orderData.billAmount)}\n`;
        const vueltas = Math.max(0, orderData.billAmount - total);
        text += `\uD83D\uDD04 *Traer Vueltas de:* ${formatCOP(vueltas)}\n`;
    } else if (orderData.paymentMethod === 'datafono') {
        text += `\uD83D\uDCB3 *Modo:* Traer Datáfono\n`;
        text += `\uD83D\uDDE3\uFE0F _Por favor envíen el datáfono con el repartidor._\n`;
    } else {
        const metodosMap: Record<string, string> = {
            'nequi': 'Nequi',
            'breb': 'Bre-B',
            'qr': 'QR Bancolombia / Nequi'
        };
        text += `\uD83D\uDCF2 *Modo:* Pago Digital (${metodosMap[orderData.paymentMethod] || 'Transferencia'})\n\n`;
        
        if (orderData.paymentMethod === 'nequi' || orderData.paymentMethod === 'breb') {
            text += `*Número ${metodosMap[orderData.paymentMethod]} GoRodadero:*\n`;
            text += `3045293384\n\n`;
        }
        
        text += `\uD83D\uDCF8 _En un momento les adjunto el comprobante de pago._\n`;
    }

    text += '━━━━━━━━━━━━━━━━━━━━\n';
    text += `\uD83D\uDCDE *Si quieres contactarnos haz clic aquí:* +573202499339\n`;
    text += '\u2705 _Pedido generado desde GoRodadero.co_';

    const encodedText = encodeURIComponent(text);
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedText}`;
}
