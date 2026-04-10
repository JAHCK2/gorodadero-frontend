import { CatalogShell } from "@/components/CatalogShell";
import { supabase } from "@/lib/supabase";
import { buildCategoriesFromHierarchy } from "@/lib/categoryMapper";
import { mapSupabaseToProduct } from "@/lib/productMapper";

// Revalidar los precios y el inventario cada 60 segundos
export const revalidate = 60;

export default async function App() {
    // 1. Obtener base de datos en crudo
    // (Nota: si Supabase te limita a 1000, podrías necesitar un loop paginado aquí en el futuro)
    const { data: rawProducts, error } = await supabase
        .from('productos')
        .select('*')
        .limit(3000);

    if (error) {
        console.error("Error al obtener productos de Supabase:", error);
    }

    // 2. Mapear categorías puras (estructura Titanium V2)
    const realCategories = buildCategoriesFromHierarchy();

    // 3. Mapear productos puros y cargar imágenes físicas locales si existen
    const realProducts = (rawProducts || []).map(mapSupabaseToProduct);

    return <CatalogShell categories={realCategories} products={realProducts} />;
}
