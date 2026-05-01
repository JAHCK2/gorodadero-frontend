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

export function mapSupabaseToProduct(item: any, marginMultiplier: number = 1.40): Product {
    // Buscar la subcategoría mapeada
    const catId = getSubcategoryId(item.categoria, item.subcategoria) || "sub-miscelaneos-varios";

    // Detectar si la imagen local existe (solo en dev)
    let imageUrl = null;
    const barcode = item.barcode?.trim();

    // 1. Apuntar directamente al CDN de Chucho V2 basado en el código de barras
    // PERO solo si la imagen ya fue asignada/aprobada en la base de datos (no está vacía ni rechazada)
    if (barcode && item.imagen && item.imagen !== 'RECHAZADA_TODAS' && item.imagen !== 'NO_IMAGE') {
        imageUrl = `https://chucho-v2.vercel.app/product-images/${barcode}.png`;
    }

    // Extraer unidad y valor de la base de datos o usando RegEx desde el nombre
    let unitValue: number | null = item.unit_value ? parseFloat(item.unit_value) : null;
    let unitType: string | null = item.unit_type ? item.unit_type.toUpperCase() : null;

    if ((!unitValue || !unitType) && item.nombre) {
        const match = item.nombre.match(/(\d+(?:[.,]\d+)?)\s*(g|mg|kg|ml|l|lt|oz|lb)\b/i);
        if (match) {
            unitValue = parseFloat(match[1].replace(',', '.'));
            unitType = match[2].toUpperCase();
        }
    }

    // Asegurar que el nombre tenga la unidad visible al final si no la tenía
    let finalName = item.nombre || 'Producto Sin Nombre';
    if (unitValue && unitType) {
        const regexCheck = new RegExp(`${unitValue}\\s*${unitType}`, 'i');
        if (!regexCheck.test(finalName)) {
            finalName = `${finalName} ${unitValue}${unitType.toLowerCase()}`;
        }
    }

    // La regla de oro para GoRodadero: margen dinámico sobre el costo base (vcompra)
    const costo_base = parseCOPPrice(item.vcompra);
    const precioGoRodadero = Math.round(costo_base * marginMultiplier);

    return {
        id: item._id || item.id,
        name: finalName,
        description: null,
        imageUrl,
        sellPrice: precioGoRodadero,
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
