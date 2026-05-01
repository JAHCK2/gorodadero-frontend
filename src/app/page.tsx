import { CatalogShell } from "@/components/CatalogShell";
import { supabase } from "@/lib/supabase";
import { buildCategoriesFromHierarchy } from "@/lib/categoryMapper";
import { mapSupabaseToProduct } from "@/lib/productMapper";

// Revalidar los precios y el inventario cada 60 segundos
export const revalidate = 60;

export default async function App() {
    // 1. Obtener configuración (margen de ganancia)
    const { data: configData } = await supabase.from('configuracion').select('*');
    let marginMultiplier = 1.40;
    if (configData) {
        const marginRow = configData.find(c => c.clave === 'margen_ganancia');
        if (marginRow && marginRow.valor) {
            // Convierte el entero "40" a multiplicador "1.40"
            const percentage = parseFloat(marginRow.valor) || 40;
            marginMultiplier = 1 + (percentage / 100);
        }
    }

    // 2. Obtener base de datos en crudo
    const { data: rawProducts, error } = await supabase
        .from('productos')
        .select('*')
        .limit(3000);

    if (error) {
        console.error("Error al obtener productos de Supabase:", error);
    }

    // 2. Mapear categorías puras (estructura Titanium V2)
    const realCategories = buildCategoriesFromHierarchy();

    // 4. Mapear productos puros y cargar imágenes
    const realProducts = (rawProducts || []).map(p => mapSupabaseToProduct(p, marginMultiplier));

    return <CatalogShell categories={realCategories} products={realProducts} />;
}
