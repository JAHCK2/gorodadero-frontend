import { Category } from "@/types/product";

export const CATEGORY_HIERARCHY: Record<string, string[]> = {
  "Bebidas": [
    "Aguas",
    "Energizantes e Hidratantes",
    "Gaseosas y Maltas",
    "Hidrantes y Energizantes",
    "Jugos y Néctares"
  ],
  "Carnes y Charcutería": [
    "Carnes Rojas",
    "Embutidos y Salchichería",
    "Pollo"
  ],
  "Cuidado Personal": [
    "Cuidado Capilar",
    "Desodorantes",
    "Higiene Corporal",
    "Higiene Oral"
  ],
  "Despensa": [
    "Aceites",
    "Alimento Infantil",
    "Arroz y Cereal",
    "Canasta Básica",
    "Enlatados",
    "Harinas",
    "Panadería",
    "Panadería y Desayuno",
    "Salsas y Sazonadores"
  ],
  "Dulces y Galletas": [
    "Chocolatería",
    "Dulcería",
    "Galletas"
  ],
  "Farmacia y Bebé": [
    "Analgésicos y Primeros Auxilios",
    "Cuidado Infantil y Pañales"
  ],
  "Frutas y Verduras": [
    "Frutas",
    "Verduras",
    "Verduras y Hortalizas"
  ],
  "Hogar y Limpieza": [
    "Lavandería",
    "Limpieza de Superficies",
    "Papel Higiénico y Cocina",
    "Utensilios",
    "Utensilios y Desechables"
  ],
  "Licores y Tabaco": [
    "Cervezas",
    "Cigarrillos y Vapeo",
    "Licores y Vinos",
    "Whisky"
  ],
  "Lácteos y Huevos": [
    "Bebidas Lácteas",
    "Huevos y Mantequillas",
    "Leche",
    "Quesos y Cremas"
  ],
  "Mascotas": [
    "Alimento Gato",
    "Alimento Perro"
  ],
  "Misceláneos": [
    "Papelería",
    "Varios"
  ],
  "Snacks y Pasabocas": [
    "Nueces y Tostadas",
    "Papas y Fritos"
  ],
};

function generateSlug(text: string): string {
    return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
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
