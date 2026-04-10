import { Category } from "@/types/product";

export const mockCategories: Category[] = [
    {
        id: "macro-1",
        name: "Bebidas y Licores",
        slug: "bebidas-y-licores",
        icon: "🥤",
        sortOrder: 1,
        isActive: true,
        parentId: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: "macro-2",
        name: "Pasabocas y Dulces",
        slug: "pasabocas-y-dulces",
        icon: "🍫",
        sortOrder: 2,
        isActive: true,
        parentId: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: "macro-3",
        name: "Lácteos y Desayuno",
        slug: "lacteos-y-desayuno",
        icon: "🧀",
        sortOrder: 3,
        isActive: true,
        parentId: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: "sub-1-1",
        name: "Cervezas",
        slug: "cervezas",
        icon: "🍺",
        sortOrder: 1,
        isActive: true,
        parentId: "macro-1",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: "sub-1-2",
        name: "Gaseosas",
        slug: "gaseosas",
        icon: "🥤",
        sortOrder: 2,
        isActive: true,
        parentId: "macro-1",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: "sub-2-1",
        name: "Papas y Fritos",
        slug: "papas-y-fritos",
        icon: "🍟",
        sortOrder: 1,
        isActive: true,
        parentId: "macro-2",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: "sub-2-2",
        name: "Chocolates",
        slug: "chocolates",
        icon: "🍫",
        sortOrder: 2,
        isActive: true,
        parentId: "macro-2",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: "sub-3-1",
        name: "Leche y Bebidas Lácteas",
        slug: "leche-y-bebidas-lacteas",
        icon: "🥛",
        sortOrder: 1,
        isActive: true,
        parentId: "macro-3",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: "sub-3-2",
        name: "Quesos",
        slug: "quesos",
        icon: "🧀",
        sortOrder: 2,
        isActive: true,
        parentId: "macro-3",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }
];
