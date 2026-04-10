// ═══════════════════════════════════════════
// GoRodadero — Tipos de Orden (TypeScript Titanium)
// ═══════════════════════════════════════════

/** Estados posibles de una orden */
export type OrderStatus = "pending" | "confirmed" | "dispatched" | "delivered" | "cancelled";

/** Item individual dentro de una orden */
export interface OrderItem {
    id: string;
    quantity: number;
    unitPrice: number;   // Centavos COP
    subtotal: number;    // Centavos COP
    productId: string;
    orderId: string;
    product?: {
        id: string;
        name: string;
        imageUrl: string | null;
    };
}

/** Orden completa */
export interface Order {
    id: string;
    status: OrderStatus;
    total: number;           // Centavos COP
    customerName: string;
    customerPhone: string;
    latitude: number | null;
    longitude: number | null;
    address: string | null;
    paymentMethod: string;
    notes: string | null;
    printed: boolean;
    createdAt: string;
    updatedAt: string;
    items: OrderItem[];
}

/** Métodos de pago aceptados */
export type PaymentMethod = "efectivo" | "nequi" | "daviplata" | "transferencia";
