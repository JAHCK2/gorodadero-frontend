// ═══════════════════════════════════════════
// GoRodadero — Validación centralizada
// Un solo lugar para todas las reglas de validación
// ═══════════════════════════════════════════

import { MIN_ORDER_DELIVERY } from "./constants";

/** Resultado de validación */
export interface ValidationResult {
    valid: boolean;
    error: string | null;
}

// ─── Validadores individuales ───

/** Valida que un campo requerido no esté vacío */
export function validateRequired(value: string, fieldName: string): ValidationResult {
    const trimmed = value.trim();
    if (!trimmed) {
        return { valid: false, error: `${fieldName} es obligatorio` };
    }
    return { valid: true, error: null };
}

/** Valida teléfono colombiano: 10 dígitos, empieza por 3 */
export function validatePhone(phone: string): ValidationResult {
    const cleaned = phone.replace(/\D/g, "");
    if (!cleaned) {
        return { valid: false, error: "El teléfono es obligatorio" };
    }
    // Acepta: 3001234567 o 573001234567
    const isLocal = /^3\d{9}$/.test(cleaned);
    const isWithPrefix = /^57\d{10}$/.test(cleaned);
    if (!isLocal && !isWithPrefix) {
        return { valid: false, error: "Ingresa un teléfono colombiano válido (10 dígitos)" };
    }
    return { valid: true, error: null };
}

/** Normaliza teléfono a formato +57 */
export function normalizePhone(phone: string): string {
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.startsWith("57") && cleaned.length === 12) return cleaned;
    if (cleaned.startsWith("3") && cleaned.length === 10) return `57${cleaned}`;
    return cleaned;
}

/** Valida que la ubicación esté presente */
export function validateLocation(lat: number | null, lng: number | null): ValidationResult {
    if (lat === null || lng === null) {
        return { valid: false, error: "Debes compartir tu ubicación para confirmar el pedido" };
    }
    // Validar que esté en un rango razonable (Colombia ~-4 a 13 lat, -67 a -79 lng)
    if (lat < -5 || lat > 15 || lng < -82 || lng > -66) {
        return { valid: false, error: "La ubicación no parece estar en Colombia" };
    }
    return { valid: true, error: null };
}

/** Valida monto mínimo del pedido */
export function validateMinOrder(total: number): ValidationResult {
    if (total < MIN_ORDER_DELIVERY) {
        return {
            valid: false,
            error: `El pedido mínimo es $${MIN_ORDER_DELIVERY.toLocaleString("es-CO")}`,
        };
    }
    return { valid: true, error: null };
}

/** Valida que se haya seleccionado un método de pago */
export function validatePaymentMethod(method: string | null): ValidationResult {
    if (!method) {
        return { valid: false, error: "Selecciona un método de pago" };
    }
    const validMethods = ["efectivo", "nequi", "daviplata", "transferencia"];
    if (!validMethods.includes(method)) {
        return { valid: false, error: "Método de pago no válido" };
    }
    return { valid: true, error: null };
}

// ─── Validación completa del checkout ───

export interface CheckoutData {
    customerName: string;
    customerPhone: string;
    latitude: number | null;
    longitude: number | null;
    address: string | null;
    paymentMethod: string | null;
    notes: string;
    total: number;
}

export interface CheckoutValidation {
    valid: boolean;
    errors: Record<string, string>;
}

/** Valida TODOS los campos del checkout de una vez */
export function validateCheckout(data: CheckoutData): CheckoutValidation {
    const errors: Record<string, string> = {};

    const nameResult = validateRequired(data.customerName, "El nombre");
    if (!nameResult.valid) errors.customerName = nameResult.error!;

    const phoneResult = validatePhone(data.customerPhone);
    if (!phoneResult.valid) errors.customerPhone = phoneResult.error!;

    const locationResult = validateLocation(data.latitude, data.longitude);
    if (!locationResult.valid) errors.location = locationResult.error!;

    const paymentResult = validatePaymentMethod(data.paymentMethod);
    if (!paymentResult.valid) errors.paymentMethod = paymentResult.error!;

    const orderResult = validateMinOrder(data.total);
    if (!orderResult.valid) errors.total = orderResult.error!;

    return {
        valid: Object.keys(errors).length === 0,
        errors,
    };
}
