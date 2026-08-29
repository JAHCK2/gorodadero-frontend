import { Product } from '@/types/product';
import { getSubcategoryId } from './categoryMapper';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://eoqethwihsupbcivmgvw.supabase.co';
const PUBLIC_MEDIA_BUCKET = `${SUPABASE_URL}/storage/v1/object/public/product-media-public`;

function parseCOPPrice(raw: string | number | null | undefined): number {
    if (!raw) return 0;
    if (typeof raw === 'number') return Math.round(raw);
    // Convierte "1.500" o "1,500" a 1500
    const parsed = parseInt(String(raw).replace(/\./g, '').replace(/,/g, '').trim(), 10);
    return isNaN(parsed) ? 0 : parsed;
}

/**
 * Resuelve la URL limpia de la imagen oficial del producto.
 * Prioridad:
 * 1. Campo `productos.imagen` si está configurado y no es un marcador de rechazo.
 * 2. Si es una URL completa (Supabase, Vercel, etc.), se utiliza directamente.
 * 3. Si apunta al patrón de storage `products/{id}/processed/{mediaId}.webp`, se construye la URL del bucket público `product-media-public`.
 * 4. Si es una ruta relativa local (`/product-images/...`, `/candidatos_pim/...`, etc.), se apunta al CDN de Chucho V2.
 * 5. Se anexa el parámetro de versión `?v=${updated_at || 'v1'}` para refresco instantáneo sin caché residual.
 */
export function resolveProductImageUrl(rawImage: string | null | undefined, productId: string, updatedAt?: string | null): string | null {
    if (!rawImage || rawImage === 'RECHAZADA_TODAS' || rawImage === 'NO_IMAGE' || rawImage.trim() === '') {
        return null;
    }

    let url: string = rawImage.trim();

    if (url.startsWith('data:image')) {
        return url; // Data URIs inline
    }

    if (url.startsWith('http://') || url.startsWith('https://')) {
        // Ya es URL absoluta completa
    } else if (url.startsWith('products/') || url.includes('/processed/')) {
        // Patrón directo de Supabase Storage bucket `product-media-public`
        const cleanPath = url.startsWith('/') ? url.slice(1) : url;
        url = `${PUBLIC_MEDIA_BUCKET}/${cleanPath}`;
    } else if (url.startsWith('/')) {
        // Ruta relativa al CDN de Chucho V2
        url = `https://chucho-v2.vercel.app${url}`;
    } else {
        url = `https://chucho-v2.vercel.app/${url}`;
    }

    // Anexar parámetro de versión para caché inteligente
    const versionParam = updatedAt ? encodeURIComponent(updatedAt) : 'v1';
    const separator = url.includes('?') ? '&' : '?';
    
    // Evitar duplicar ?v= si ya viene incluido
    if (!url.includes('v=') && !url.startsWith('data:')) {
        url = `${url}${separator}v=${versionParam}`;
    }

    return url;
}

export function mapSupabaseToProduct(item: any, marginMultiplier: number = 1.40): Product {
    const rawId = item._id || item.id || `prod_${Date.now()}`;
    const rawCategoria = item.categoria || 'MISCELÁNEOS';
    const rawSubcategoria = item.subcategoria || 'Varios';
    const rawMarca = item.marca ? item.marca.trim() : null;
    const rawBarcode = item.barcode ? String(item.barcode).trim() : null;

    // Buscar subcategoría mapeada
    const catId = getSubcategoryId(rawCategoria, rawSubcategoria);

    // Resolver URL oficial de imagen
    const imageUrl = resolveProductImageUrl(item.imagen, rawId, item.updated_at);

    // Extraer unidad y valor de la base de datos o usando RegEx desde el nombre
    let unitValue: number | null = null;
    if (item.unit_value !== undefined && item.unit_value !== null && item.unit_value !== '') {
        unitValue = parseFloat(String(item.unit_value).replace(',', '.'));
    } else if (item.contenido_neto !== undefined && item.contenido_neto !== null && item.contenido_neto !== '') {
        unitValue = parseFloat(String(item.contenido_neto).replace(',', '.'));
    } else if (item.gramaje !== undefined && item.gramaje !== null && item.gramaje !== '') {
        unitValue = parseFloat(String(item.gramaje).replace(',', '.'));
    }

    let unitType: string | null = null;
    if (item.unit_type && String(item.unit_type).trim() !== '') {
        unitType = String(item.unit_type).trim();
    } else if (item.unidad_medida && String(item.unidad_medida).trim() !== '') {
        unitType = String(item.unidad_medida).trim();
    }

    // Si falta unidad o valor, inferir con RegEx desde el nombre
    if ((!unitValue || !unitType) && item.nombre) {
        const match = String(item.nombre).match(/(\d+(?:[.,]\d+)?)\s*(g|mg|kg|ml|l|lt|oz|lb|und|unidades|un|paq|display)\b/i);
        if (match) {
            if (!unitValue) unitValue = parseFloat(match[1].replace(',', '.'));
            if (!unitType) unitType = match[2].toUpperCase();
        }
    }

    // Regla Zero-Float: Precios siempre en enteros COP
    const costoBase = parseCOPPrice(item.vcompra);
    const precioGoRodadero = Math.round(costoBase * marginMultiplier);

    const now = new Date().toISOString();

    return {
        id: rawId,
        name: (item.nombre || 'Producto Sin Nombre').trim(),
        description: item.descripcion || item.description || null,
        imageUrl,
        sellPrice: precioGoRodadero,
        originalPrice: null,
        discountPercentage: null,
        stock: parseInt(item.stock, 10) || 0,
        isActive: item.is_active !== false && item.is_active !== 0,
        categoryId: catId,
        categoryName: rawCategoria,
        subcategoryId: catId,
        subcategoryName: rawSubcategoria,
        brand: rawMarca,
        barcode: rawBarcode,
        unitValue: isNaN(unitValue as number) ? null : unitValue,
        unitType: unitType || 'Und',
        createdAt: item.created_at || now,
        updatedAt: item.updated_at || now
    };
}
