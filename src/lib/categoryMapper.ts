import { Category } from "@/types/product";

export function generateSlug(text: string | null | undefined): string {
    if (!text) return "general";
    return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .replace(/^-+|-+$/g, '');
}

/**
 * Configuración visual y de orden para macro-categorías conocidas.
 * Si una categoría de CHUCHO-V2 coincide con estas palabras clave,
 * se le asigna su icono y prioridad oficial.
 */
interface KnownMacroConfig {
    canonicalName: string;
    icon: string;
    priority: number;
    keywords: string[];
}

export const KNOWN_MACRO_CONFIG: Record<string, KnownMacroConfig> = {
    "DESPENSA": {
        canonicalName: "DESPENSA",
        icon: "🥫",
        priority: 1,
        keywords: ["despensa", "abarrotes", "granos", "aceites", "enlatados", "conservas", "pastas", "salsas"]
    },
    "FRUTAS Y VERDURAS": {
        canonicalName: "FRUTAS Y VERDURAS",
        icon: "🍎",
        priority: 2,
        keywords: ["frutas", "verduras", "hortalizas", "pulpas", "frescos"]
    },
    "CARNES": {
        canonicalName: "CARNES",
        icon: "🥩",
        priority: 3,
        keywords: ["carnes", "pollo", "cerdo", "res", "pescados", "mariscos"]
    },
    "LÁCTEOS Y REFRIGERADOS": {
        canonicalName: "LÁCTEOS Y REFRIGERADOS",
        icon: "🧀",
        priority: 4,
        keywords: ["lacteos", "refrigerados", "leches", "quesos", "yogurt", "huevos", "mantequillas"]
    },
    "DELICATESSEN": {
        canonicalName: "DELICATESSEN",
        icon: "🥓",
        priority: 5,
        keywords: ["delicatessen", "charcuteria", "madurados"]
    },
    "PASABOCAS Y DULCES": {
        canonicalName: "PASABOCAS Y DULCES",
        icon: "🍪",
        priority: 6,
        keywords: ["pasabocas", "dulces", "snacks", "galletas", "chocolates", "confiteria", "papas", "mecato"]
    },
    "BEBIDAS": {
        canonicalName: "BEBIDAS",
        icon: "🧃",
        priority: 7,
        keywords: ["bebidas", "gaseosas", "aguas", "jugos", "refrescos", "hidratantes", "energizantes"]
    },
    "PANADERÍA": {
        canonicalName: "PANADERÍA",
        icon: "🥐",
        priority: 8,
        keywords: ["panaderia", "pan", "reposteria", "arepas", "tortas", "bizcocheria"]
    },
    "VINOS Y LICORES": {
        canonicalName: "VINOS Y LICORES",
        icon: "🍷",
        priority: 9,
        keywords: ["vinos", "licores", "cervezas", "whisky", "ron", "aguardiente", "vodka", "tequila", "cigarrillos", "tabacos"]
    },
    "CUIDADO PERSONAL": {
        canonicalName: "CUIDADO PERSONAL",
        icon: "🧴",
        priority: 10,
        keywords: ["cuidado personal", "higiene", "shampoo", "jabones", "desodorantes", "oral", "cabello", "afeitado"]
    },
    "CUIDADO DE LA PIEL": {
        canonicalName: "CUIDADO DE LA PIEL",
        icon: "☀️",
        priority: 11,
        keywords: ["cuidado de la piel", "bloqueador", "bronceador", "proteccion solar", "cremas piel"]
    },
    "BOTIQUÍN": {
        canonicalName: "BOTIQUÍN",
        icon: "💊",
        priority: 12,
        keywords: ["botiquin", "farmacia", "salud", "analgesicos", "vitaminas", "medicamentos", "drogueria"]
    },
    "MUNDO DEL BEBÉ": {
        canonicalName: "MUNDO DEL BEBÉ",
        icon: "🍼",
        priority: 13,
        keywords: ["bebe", "bebes", "infantil", "panales", "compotas", "formula"]
    },
    "ASEO HOGAR": {
        canonicalName: "ASEO HOGAR",
        icon: "🧹",
        priority: 14,
        keywords: ["aseo", "limpieza", "hogar", "detergentes", "desinfectantes", "blanqueadores", "suavizantes", "ambientadores"]
    },
    "MASCOTAS": {
        canonicalName: "MASCOTAS",
        icon: "🐕",
        priority: 15,
        keywords: ["mascotas", "perros", "gatos", "alimento mascotas", "aves"]
    },
    "MISCELÁNEOS": {
        canonicalName: "MISCELÁNEOS",
        icon: "📦",
        priority: 90,
        keywords: ["miscelaneos", "varios", "papeleria", "otros", "general"]
    },
};

/**
 * Resuelve metadatos (nombre visual, icono, prioridad y slug) para cualquier categoría,
 * sea conocida o completamente nueva creada en CHUCHO-V2.
 */
export function resolveMacroMeta(rawCategory: string | null | undefined): {
    displayName: string;
    icon: string;
    priority: number;
    slug: string;
} {
    const clean = (rawCategory || "").trim();
    if (!clean) {
        return {
            displayName: "MISCELÁNEOS",
            icon: "📦",
            priority: 99,
            slug: "miscelaneos"
        };
    }

    // Extraer emoji si ya viene incluido en el string desde la base de datos
    const emojiMatch = clean.match(/^(\p{Extended_Pictographic}|\p{Emoji_Presentation})/u);
    const textWithoutEmoji = clean.replace(/^(\p{Extended_Pictographic}|\p{Emoji_Presentation})\s*/u, '').trim();
    const norm = generateSlug(textWithoutEmoji || clean);

    // 1. Coincidencia EXACTA por nombre canónico (Prioridad absoluta para evitar falsos positivos)
    for (const [key, conf] of Object.entries(KNOWN_MACRO_CONFIG)) {
        const normKey = generateSlug(key);
        if (norm === normKey || norm === generateSlug(conf.canonicalName)) {
            return {
                displayName: conf.canonicalName,
                icon: conf.icon,
                priority: conf.priority,
                slug: normKey
            };
        }
    }

    // 2. Coincidencia por palabras completas (tokens) para evitar que "res" capture "licores"
    const normTokens = norm.split('-');
    for (const [key, conf] of Object.entries(KNOWN_MACRO_CONFIG)) {
        const normKey = generateSlug(key);
        const matchesKeyword = conf.keywords.some(k => {
            const kSlug = generateSlug(k);
            const kTokens = kSlug.split('-');
            if (kTokens.length === 1) {
                return normTokens.includes(kSlug);
            }
            return norm.includes(kSlug);
        });

        if (matchesKeyword) {
            return {
                displayName: conf.canonicalName,
                icon: conf.icon,
                priority: conf.priority,
                slug: normKey
            };
        }
    }

    // Categoría nueva / desconocida (creada en CHUCHO-V2)
    const icon = emojiMatch ? emojiMatch[0] : "📦";
    const displayName = textWithoutEmoji.toUpperCase() || clean.toUpperCase();
    return {
        displayName,
        icon,
        priority: 50,
        slug: norm || "general"
    };
}

/**
 * Construye la jerarquía completa de categorías (Macro + Subcategorías)
 * 100% DINÁMICAMENTE a partir de los productos activos reales de Supabase.
 * Nunca más quedará un producto o categoría huérfana.
 */
export function buildDynamicCategories(rawProducts: Array<{ categoria?: string | null; subcategoria?: string | null }>): Category[] {
    const categories: Category[] = [];
    const dateStr = new Date().toISOString();
    
    // Mapeo: macroSlug -> { meta, subs: Set de nombres de subcategorías }
    const macroMap = new Map<string, {
        meta: ReturnType<typeof resolveMacroMeta>;
        subs: Set<string>;
    }>();

    for (const p of rawProducts) {
        const rawMacro = (p.categoria || "MISCELÁNEOS").trim();
        const rawSub = (p.subcategoria || "Varios").trim();

        const meta = resolveMacroMeta(rawMacro);
        if (!macroMap.has(meta.slug)) {
            macroMap.set(meta.slug, { meta, subs: new Set<string>() });
        }
        macroMap.get(meta.slug)!.subs.add(rawSub);
    }

    // Ordenar macro-categorías por prioridad definida y luego alfabéticamente
    const sortedMacros = Array.from(macroMap.values()).sort((a, b) => {
        if (a.meta.priority !== b.meta.priority) {
            return a.meta.priority - b.meta.priority;
        }
        return a.meta.displayName.localeCompare(b.meta.displayName, "es");
    });

    let macroSort = 1;
    for (const item of sortedMacros) {
        const macroId = `macro-${item.meta.slug}`;
        categories.push({
            id: macroId,
            name: item.meta.displayName,
            slug: item.meta.slug,
            icon: item.meta.icon,
            sortOrder: macroSort++,
            isActive: true,
            parentId: null,
            createdAt: dateStr,
            updatedAt: dateStr
        });

        // Ordenar subcategorías alfabéticamente
        const sortedSubs = Array.from(item.subs).sort((a, b) => a.localeCompare(b, "es"));
        let subSort = 1;
        for (const subName of sortedSubs) {
            const subSlug = generateSlug(subName) || "varios";
            categories.push({
                id: `sub-${item.meta.slug}-${subSlug}`,
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

/**
 * Devuelve el ID canónico determinista de la subcategoría para un producto.
 * Garantiza 100% de coincidencia biunívoca con `buildDynamicCategories()`.
 */
export function getSubcategoryId(rawMacro: string | null | undefined, rawSub: string | null | undefined): string {
    const meta = resolveMacroMeta(rawMacro);
    const subSlug = generateSlug(rawSub || "Varios") || "varios";
    return `sub-${meta.slug}-${subSlug}`;
}

/**
 * Helper de compatibilidad (retrocompatibilidad).
 */
export function buildCategoriesFromHierarchy(): Category[] {
    // Si se invoca sin productos, construye la estructura base conocida
    const mockProducts = Object.keys(KNOWN_MACRO_CONFIG).map(cat => ({
        categoria: cat,
        subcategoria: "Varios"
    }));
    return buildDynamicCategories(mockProducts);
}
