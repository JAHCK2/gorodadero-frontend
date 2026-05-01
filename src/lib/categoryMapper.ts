import { Category } from "@/types/product";

export const CATEGORY_HIERARCHY: Record<string, string[]> = {
  "🥫 DESPENSA": ["Huevos", "Aceites y Vinagres", "Café y Chocolate", "Encurtidos y Conservas", "Salsas de Mesa", "Bebidas en Polvo", "Arroz y Granos", "Infusiones y Té", "Harinas", "Leche en Polvo"],
  "🍎 FRUTAS Y VERDURAS": ["Verduras"],
  "🥩 CARNES": ["Pollo", "Cerdo"],
  "🧀 LÁCTEOS Y REFRIGERADOS": ["Leches", "Arepas y Tortillas", "Quesos y Sueros", "Carnes Frías y Embutidos"],
  "🥓 DELICATESSEN": ["Charcutería Fina", "Quesos Maduros"],
  "🍪 PASABOCAS Y DULCES": ["Galletas Saladas", "Papas y Snacks", "Galletas Dulces"],
  "🧃 BEBIDAS": ["Jugos y Refrescos", "Gaseosas y Maltas", "Bebidas Energizantes e Hidratantes", "Agua y Té Frío"],
  "🥐 PANADERÍA": ["Panadería de la Casa"],
  "🍷 VINOS Y LICORES": ["Cremas y Aperitivos", "Cigarrillos y Tabacos", "Aguardiente", "Vodka", "Cervezas", "Ron", "Tequila", "Whisky"],
  "🧴 CUIDADO PERSONAL": ["Higiene Femenina", "Shampoo y Acondicionador", "Papel Higiénico", "Cuidado Oral", "Desodorantes Masculinos"],
  "☀️ CUIDADO DE LA PIEL": ["Protectores Solares", "Cremas"],
  "💊 BOTIQUÍN": ["Analgésicos y Antigripales", "Multivitamínicos"],
  "🍼 MUNDO DEL BEBÉ": ["Coladas y Papillas", "Cuidado de la Colita", "Compotas"],
  "🧹 ASEO HOGAR": ["Limpieza Superficies", "Cuidado Baño", "Suavizantes", "Esponjas y Fibras", "Blanqueadores", "Detergentes", "Ambientadores", "Desechables", "Insecticidas"],
  "🐕 MASCOTAS": ["Perros", "Gatos"],
  "📦 MISCELÁNEOS": ["Varios"]
};

function generateSlug(text: string): string {
    return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/^-+|-+$/g, '');
}

/** 
 * Genera el array plano maestro de categorías V2 a partir del hierarchy de CHUCHO-V2 
 */
export function buildCategoriesFromHierarchy(): Category[] {
    const categories: Category[] = [];
    const dateStr = new Date().toISOString();
    let macroSort = 1;

    for (const [macroName, subCategories] of Object.entries(CATEGORY_HIERARCHY)) {
        const macroSlug = generateSlug(macroName);
        const macroId = `macro-${macroSlug}`;

        categories.push({
            id: macroId,
            name: macroName,
            slug: macroSlug,
            icon: null,
            sortOrder: macroSort++,
            isActive: true,
            parentId: null,
            createdAt: dateStr,
            updatedAt: dateStr
        });

        let subSort = 1;
        for (const subName of subCategories) {
            const subSlug = generateSlug(subName);
            categories.push({
                id: `sub-${macroSlug}-${subSlug}`,
                name: subName,
                slug: subSlug,
                icon: null,
                sortOrder: subSort++,
                isActive: true,
                parentId: macroId,
                createdAt: dateStr,
                updatedAt: dateStr
            });
        }
    }

    return categories;
}

/** Devuelve el sub-id mapeado para usarlo como categoryId en el Producto */
export function getSubcategoryId(macroName: string, subName: string): string | null {
    if (!macroName || !subName) return null;
    return `sub-${generateSlug(macroName)}-${generateSlug(subName)}`;
}
