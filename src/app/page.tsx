import { CatalogShell } from "@/components/CatalogShell";
import { supabase } from "@/lib/supabase";
import { buildDynamicCategories } from "@/lib/categoryMapper";
import { mapSupabaseToProduct } from "@/lib/productMapper";

// Revalidar los precios, inventario y categorías cada 60 segundos (ISR)
export const revalidate = 60;

/**
 * Descarga todo el catálogo maestro desde Supabase superando el límite
 * estándar de 1.000 filas por consulta mediante paginación por rangos.
 */
async function fetchCompleteProductsCatalog() {
    const PAGE_SIZE = 1000;
    let allProducts: any[] = [];
    let from = 0;

    while (true) {
        const { data, error } = await supabase
            .from('productos')
            .select('*')
            .range(from, from + PAGE_SIZE - 1);

        if (error) {
            console.error("Error al obtener productos de Supabase (range):", error);
            break;
        }

        if (!data || data.length === 0) break;

        allProducts.push(...data);

        // Si trajimos menos que el tamaño de página, llegamos al final
        if (data.length < PAGE_SIZE) break;

        from += PAGE_SIZE;
    }

    return allProducts;
}

export default async function App() {
    // 1. Obtener configuración de margen digital de la tienda
    let marginMultiplier = 1.40;
    try {
        const { data: configData } = await supabase.from('configuracion').select('*');
        if (configData) {
            const marginRow = configData.find(c => c.clave === 'margen_ganancia');
            if (marginRow && marginRow.valor) {
                const percentage = parseFloat(marginRow.valor) || 40;
                marginMultiplier = 1 + (percentage / 100);
            }
        }
    } catch (e) {
        console.error("Error al leer configuración de margen:", e);
    }

    // 2. Obtener la totalidad del catálogo maestro
    const rawProducts = await fetchCompleteProductsCatalog();

    // 3. Filtrar únicamente los productos activos
    const activeRawProducts = rawProducts.filter(p => p.is_active !== false && p.is_active !== 0);

    // 4. Construir dinámicamente el árbol de categorías (100% en tiempo real desde Supabase)
    const realCategories = buildDynamicCategories(activeRawProducts);

    // 5. Mapear productos canónicos con precios Zero-Float y resolución de Media V2
    const realProducts = activeRawProducts.map(p => mapSupabaseToProduct(p, marginMultiplier));

    return <CatalogShell categories={realCategories} products={realProducts} />;
}
