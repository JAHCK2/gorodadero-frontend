// ═══════════════════════════════════════════
// GoRodadero — Tipos de Producto (TypeScript Titanium)
// ═══════════════════════════════════════════

/** Categoría con jerarquía auto-referenciada */
export interface Category {
    id: string;
    name: string;
    slug: string;
    icon: string | null;
    sortOrder: number;
    isActive: boolean;
    parentId: string | null;
    createdAt: string;
    updatedAt: string;
    children?: Category[];
}

/** Producto visible en la tienda pública (sin buyPrice) */
export interface Product {
    id: string;
    name: string;
    description: string | null;
    imageUrl: string | null;
    sellPrice: number;           // Centavos COP (entero)
    originalPrice: number | null; // Centavos COP — precio tachado
    discountPercentage: number | null;
    stock: number;
    isActive: boolean;
    categoryId: string;
    createdAt: string;
    updatedAt: string;
    category?: Category;
}

/** Producto completo para el admin (incluye costo de compra) */
export interface AdminProduct extends Product {
    buyPrice: number;            // Centavos COP (entero) — SOLO admin
}

/** Respuesta paginada genérica */
export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        pageSize: number;
        total: number;
        totalPages: number;
    };
}

/** Filtros para la tabla de productos */
export interface ProductFilters {
    search: string;
    categoryId: string | null;
    isActive: boolean | null;
    page: number;
    pageSize: number;
}

/** Item en el carrito */
export interface CartItem {
    product: Product;
    quantity: number;
}

/** Columna para DataTable genérica */
export interface DataTableColumn<T> {
    key: string;
    header: string;
    width?: string;
    sortable?: boolean;
    render?: (item: T) => React.ReactNode;
}
