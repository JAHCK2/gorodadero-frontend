// ═══════════════════════════════════════════
// GoRodadero — Tipos TypeScript
// ═══════════════════════════════════════════

export interface Category {
    id: string;
    name: string;
    slug: string;
    icon: string | null;
    sort_order: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface Product {
    id: string;
    name: string;
    description: string | null;
    image_url: string | null;
    buy_price: number;
    sell_price: number;
    stock: number;
    is_active: boolean;
    category_id: string | null;
    created_at: string;
    updated_at: string;
    // Relación
    categories?: Category;
}

export interface CartItem {
    product: Product;
    quantity: number;
}
