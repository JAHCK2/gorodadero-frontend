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

    let text = '🦅 *GORODADERO | Tu Súper en Minutos*\n';
    text += '━━━━━━━━━━━━━━━━━━━━\n\n';

    // 1. Datos del Cliente
    text += `👤 *Cliente:* ${orderData.clientName}\n`;
    text += `📱 *Celular:* ${orderData.phone}\n`;
    text += `📍 *Dirección:* ${orderData.address}\n`;

    if (orderData.lat && orderData.lng) {
        text += `🗺️ *GPS Exacto:* https://maps.google.com/?q=${orderData.lat},${orderData.lng}\n`;
    }

    // 2. Resumen del Carrito
    text += '\n🛒 *MI PEDIDO:*\n';
    cartItems.forEach(item => {
        const lineTotal = item.product.sellPrice * item.quantity;
        text += `▪ ${item.quantity}x ${item.product.name} → ${formatCOP(lineTotal)}\n`;
    });

    // 3. Matemática y Finanzas
    text += '\n━━━━━━━━━━━━━━━━━━━━\n';
    text += `💰 *TOTAL A PAGAR: ${formatCOP(total)}*\n`;

    if (orderData.paymentMethod === 'efectivo') {
        text += `💵 *Modo:* Pago en Efectivo\n`;
        text += `💸 *Pagará con:* ${formatCOP(orderData.billAmount)}\n`;
        const vueltas = Math.max(0, orderData.billAmount - total);
        text += `🔄 *Traer Vueltas de:* ${formatCOP(vueltas)}\n`;
    } else if (orderData.paymentMethod === 'datafono') {
        text += `💳 *Modo:* Traer Datáfono\n`;
        text += `🗣️ _Por favor envíen el datáfono con el repartidor._\n`;
    } else {
        const metodosMap: Record<string, string> = {
            'nequi': 'Nequi',
            'breb': 'Bre-B',
            'qr': 'QR Bancolombia / Nequi'
        };
        text += `📲 *Modo:* Pago Digital (${metodosMap[orderData.paymentMethod] || 'Transferencia'})\n\n`;
        
        if (orderData.paymentMethod === 'nequi' || orderData.paymentMethod === 'breb') {
            text += `*Número ${metodosMap[orderData.paymentMethod]} GoRodadero:*\n`;
            text += `3045293384\n\n`;
        }
        
        text += `📸 _En un momento les adjunto el comprobante de pago._\n`;
    }

    text += '━━━━━━━━━━━━━━━━━━━━\n';
    text += `📞 *Si quieres contactarnos haz clic aquí:* +573202499339\n`;
    text += '✅ _Pedido generado desde GoRodadero.co_';

    const encodedText = encodeURIComponent(text);
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedText}`;
}
