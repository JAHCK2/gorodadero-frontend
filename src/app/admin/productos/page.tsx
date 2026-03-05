"use client";

// ═══════════════════════════════════════════
// Admin — Gestión de Productos
// DataTable conectada a /api/products con filtros
// ═══════════════════════════════════════════

import { useState, useEffect } from "react";
import Image from "next/image";
import { DataTable } from "@/components/admin/DataTable";
import { formatCOP } from "@/lib/money";
import type { DataTableColumn, AdminProduct } from "@/types/product";

export default function AdminProductosPage() {
    const [categoryFilter, setCategoryFilter] = useState<string>("");
    const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);

    // Load categories for the filter dropdown
    useEffect(() => {
        fetch("/api/categories")
            .then((r) => r.json())
            .then((json) => {
                if (json.all) {
                    setCategories(
                        json.all.map((c: { id: string; name: string }) => ({
                            id: c.id,
                            name: c.name,
                        }))
                    );
                }
            })
            .catch(console.error);
    }, []);

    const columns: DataTableColumn<AdminProduct>[] = [
        {
            key: "imageUrl",
            header: "",
            width: "48px",
            render: (item) =>
                item.imageUrl ? (
                    <Image
                        src={item.imageUrl}
                        alt={item.name}
                        width={36}
                        height={36}
                        className="product-thumb"
                        style={{
                            borderRadius: "8px",
                            objectFit: "cover",
                            background: "rgba(255,255,255,0.05)",
                        }}
                    />
                ) : (
                    <div style={{
                        width: 36,
                        height: 36,
                        borderRadius: 8,
                        background: "rgba(255,255,255,0.05)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 14,
                        color: "#475569",
                    }}>
                        📦
                    </div>
                ),
        },
        {
            key: "name",
            header: "Producto",
            render: (item) => (
                <span style={{ fontWeight: 500, color: "#e2e8f0" }}>
                    {item.name}
                </span>
            ),
        },
        {
            key: "category",
            header: "Categoría",
            width: "140px",
            render: (item) => (
                <span style={{
                    fontSize: 12,
                    padding: "3px 8px",
                    borderRadius: 6,
                    background: "rgba(139,92,246,0.12)",
                    color: "#a78bfa",
                }}>
                    {item.category?.name || "—"}
                </span>
            ),
        },
        {
            key: "buyPrice",
            header: "Compra",
            width: "100px",
            render: (item) => (
                <span style={{ fontVariantNumeric: "tabular-nums", color: "#94a3b8" }}>
                    {formatCOP(item.buyPrice)}
                </span>
            ),
        },
        {
            key: "sellPrice",
            header: "Venta",
            width: "100px",
            render: (item) => (
                <span style={{ fontVariantNumeric: "tabular-nums", fontWeight: 600, color: "#22c55e" }}>
                    {formatCOP(item.sellPrice)}
                </span>
            ),
        },
        {
            key: "stock",
            header: "Stock",
            width: "70px",
            render: (item) => (
                <span style={{
                    fontVariantNumeric: "tabular-nums",
                    color: item.stock > 0 ? "#cbd5e1" : "#f87171",
                    fontWeight: item.stock === 0 ? 600 : 400,
                }}>
                    {item.stock}
                </span>
            ),
        },
        {
            key: "isActive",
            header: "Estado",
            width: "80px",
            render: (item) => (
                <span
                    style={{
                        fontSize: 11,
                        fontWeight: 600,
                        padding: "3px 8px",
                        borderRadius: 20,
                        background: item.isActive
                            ? "rgba(34,197,94,0.12)"
                            : "rgba(248,113,113,0.12)",
                        color: item.isActive ? "#22c55e" : "#f87171",
                    }}
                >
                    {item.isActive ? "Activo" : "Inactivo"}
                </span>
            ),
        },
    ];

    const extraParams: Record<string, string> = {};
    if (categoryFilter) {
        extraParams.categoryId = categoryFilter;
    }

    return (
        <div>
            <header className="admin-page-header">
                <div>
                    <h1 className="admin-page-title">Productos</h1>
                    <p className="admin-page-subtitle">
                        Inventario completo de GoRodadero
                    </p>
                </div>
            </header>

            {/* Category filter */}
            <div style={{ marginBottom: 16, display: "flex", gap: 8, flexWrap: "wrap" }}>
                <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="category-filter-select"
                >
                    <option value="">Todas las categorías</option>
                    {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                            {c.name}
                        </option>
                    ))}
                </select>
            </div>

            <DataTable<AdminProduct>
                columns={columns}
                fetchUrl="/api/products"
                searchPlaceholder="Buscar productos por nombre..."
                extraParams={extraParams}
            />

            <style>{`
                .admin-page-header {
                    display: flex;
                    align-items: flex-start;
                    justify-content: space-between;
                    margin-bottom: 20px;
                }
                .admin-page-title {
                    font-family: var(--font-outfit), sans-serif;
                    font-weight: 700;
                    font-size: 28px;
                    color: #f1f5f9;
                    margin: 0 0 4px;
                }
                .admin-page-subtitle {
                    font-size: 14px;
                    color: #64748b;
                    margin: 0;
                }

                .category-filter-select {
                    padding: 8px 12px;
                    border-radius: 10px;
                    border: 1px solid rgba(255,255,255,0.08);
                    background: rgba(15, 23, 42, 0.6);
                    color: #cbd5e1;
                    font-size: 13px;
                    outline: none;
                    cursor: pointer;
                    transition: border-color 0.2s;
                    min-width: 200px;
                }
                .category-filter-select:focus {
                    border-color: rgba(96,165,250,0.4);
                }
                .category-filter-select option {
                    background: #0f172a;
                    color: #e2e8f0;
                }

                @media (max-width: 768px) {
                    .admin-page-title { font-size: 22px; }
                    .category-filter-select { min-width: 100%; }
                }
            `}</style>
        </div>
    );
}
