import fs from 'fs';
import path from 'path';
import { Product } from '@/types/product';
import { getSubcategoryId, buildCategoriesFromHierarchy } from './categoryMapper';

const publicImagesPath = process.env.NODE_ENV === 'development' 
  ? path.join(process.cwd(), 'public', 'images', 'productos')
  : null;

function parseCOPPrice(raw: string | number | null | undefined): number {
    if (!raw) return 0;
    if (typeof raw === 'number') return raw;
    // Convierte "1.500" a 1500
    const parsed = parseInt(raw.replace(/\./g, '').replace(/,/g, ''), 10);
    return isNaN(parsed) ? 0 : parsed;
}

export function mapSupabaseToProduct(item: any): Product {
    // Buscar la subcategoría mapeada
    const catId = getSubcategoryId(item.categoria, item.subcategoria) || "sub-miscelaneos-varios";

    // Detectar si la imagen local existe (solo en dev)
    let imageUrl = null;
    const barcode = item.barcode?.trim();

    // 1. Priorizar URL absoluta probada desde Tinder (Supabase)
    if (item.imagen && item.imagen !== 'RECHAZADA_TODAS') {
        // [Fase 1 - Hotlinking a Chucho V2] 
        // Interceptar las rutas relativas que el Tinder de Chucho guarda
        if (item.imagen.startsWith('/product-images/')) {
            imageUrl = `https://chucho-v2.vercel.app${item.imagen}`;
        } else {
            imageUrl = item.imagen;
        }
    } 
    // 2. Si no hay URL, buscar archivo físico en dev (Legacy fallback)
    else if (barcode && publicImagesPath && fs.existsSync(path.join(publicImagesPath, `${barcode}.webp`))) {
        imageUrl = `/images/productos/${barcode}.webp`;
    }

    // Extraer unidad y valor de unidad usando RegEx desde el nombre
    let unitValue: number | null = null;
    let unitType: string | null = null;
    if (item.nombre) {
        const match = item.nombre.match(/(\d+(?:[.,]\d+)?)\s*(g|mg|kg|ml|l|lt|oz|lb)\b/i);
        if (match) {
            unitValue = parseFloat(match[1].replace(',', '.'));
            unitType = match[2].toUpperCase();
        }
    }

    return {
        id: item._id || item.id,
        name: item.nombre || 'Producto Sin Nombre',
        description: null,
        imageUrl,
        sellPrice: parseCOPPrice(item.vventa),
        originalPrice: null,
        discountPercentage: null,
        stock: parseInt(item.stock) || 0,
        isActive: true,
        categoryId: catId,
        barcode: barcode || null,
        unitValue,
        unitType,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
}
