// ═══════════════════════════════════════════
// GoRodadero — Constantes Globales
// ═══════════════════════════════════════════

export const STORE_NAME = "GoRodadero";
export const CURRENCY = "COP";
export const WHATSAPP_PHONE = process.env.NEXT_PUBLIC_WHATSAPP_PHONE || "573001234567";

/** Monto mínimo para delivery (en pesos COP, entero) */
export const MIN_ORDER_DELIVERY = 10_000;

/** Productos por página en la DataTable admin */
export const ITEMS_PER_PAGE = 25;

/** Máximo de resultados de búsqueda */
export const MAX_SEARCH_RESULTS = 50;

/** Status labels para órdenes */
export const ORDER_STATUS_LABELS: Record<string, string> = {
    pending: "Pendiente",
    confirmed: "Confirmado",
    dispatched: "Despachado",
    delivered: "Entregado",
    cancelled: "Cancelado",
};

/** Colores por status */
export const ORDER_STATUS_COLORS: Record<string, string> = {
    pending: "#f59e0b",
    confirmed: "#3b82f6",
    dispatched: "#8b5cf6",
    delivered: "#22c55e",
    cancelled: "#ef4444",
};
