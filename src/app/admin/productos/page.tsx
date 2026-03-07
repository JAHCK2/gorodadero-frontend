"use client";

// ═══════════════════════════════════════════
// Admin — Gestión de Productos (Full-Featured)
// Smart Search (barcode + fuzzy) + Multi-select + Bulk Move + Edit
// ═══════════════════════════════════════════

import { useState, useEffect, useMemo, useRef, useCallback } from "react";

interface Category {
    id: string;
    name: string;
    slug: string;
    icon: string | null;
    sortOrder: number;
    isActive: boolean;
    parentId: string | null;
}

interface Product {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
    sellPrice: number;
    buyPrice: number;
    stock: number;
    categoryId: string;
    unitType: string;
    unitValue: number | null;
    barcode: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    category?: { id: string; name: string };
}

const formatCOP = (v: number) => "$" + v.toLocaleString("es-CO", { maximumFractionDigits: 0 });

/* ─────────────────────────────────────────────────────────────
   SMART SEARCH ENGINE — Idéntico al buscador estrella público
   Prioridad: Barcode > Unit-Type Match > Pure Fuzzy
   ───────────────────────────────────────────────────────────── */

const UNIT_SYNONYMS: Record<string, string> = {
    litro: "L", litros: "L", lt: "L", lts: "L",
    mililitro: "ml", mililitros: "ml",
    kilo: "kg", kilos: "kg", kilogramo: "kg", kilogramos: "kg",
    gramo: "g", gramos: "g",
    onza: "oz", onzas: "oz",
    unidad: "und", unidades: "und",
    libra: "lb", libras: "lb",
};

function normalize(s: string): string {
    return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}

function smartSearch(products: Product[], query: string): Product[] {
    const raw = query.trim();
    if (!raw) return products; // Show ALL if no query

    // 1) BARCODE EXACT MATCH
    const barcodeMatch = products.find(p => p.barcode && p.barcode === raw);
    if (barcodeMatch) {
        const rest = fuzzyTokenSearch(products, raw).filter(p => p.id !== barcodeMatch.id);
        return [barcodeMatch, ...rest];
    }

    // 2) UNIT-TYPE MATCH
    const normalizedQuery = normalize(raw);
    const tokens = normalizedQuery.split(/\s+/).filter(Boolean);
    let detectedUnitType: string | null = null;
    const nameTokens: string[] = [];

    for (const token of tokens) {
        if (UNIT_SYNONYMS[token]) {
            detectedUnitType = UNIT_SYNONYMS[token];
        } else {
            nameTokens.push(token);
        }
    }

    if (detectedUnitType) {
        const unitFiltered = products.filter(p => p.unitType === detectedUnitType);
        let results: Product[];
        if (nameTokens.length > 0) {
            results = unitFiltered.filter(p => {
                const haystack = normalize(p.name);
                return nameTokens.every(t => haystack.includes(t));
            }).sort((a, b) => a.name.localeCompare(b.name, "es"));
        } else {
            results = unitFiltered.sort((a, b) => a.name.localeCompare(b.name, "es"));
        }
        if (results.length > 0) return results;
    }

    // 3) PURE FUZZY TOKEN SEARCH
    return fuzzyTokenSearch(products, raw);
}

function fuzzyTokenSearch(products: Product[], raw: string): Product[] {
    const processed = normalize(raw);
    if (!processed) return products;
    const tokens = processed.split(/\s+/).filter(Boolean);
    return products
        .filter(p => {
            const haystack = normalize(p.name) + " " + normalize(p.barcode || "");
            return tokens.every(t => haystack.includes(t));
        })
        .sort((a, b) => a.name.localeCompare(b.name, "es"));
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */

export default function AdminProductosPage() {
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("");

    // Edit modal
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    // Multi-select
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [moveTarget, setMoveTarget] = useState("");
    const [moving, setMoving] = useState(false);
    const [moveMsg, setMoveMsg] = useState<string | null>(null);

    // Pagination
    const [page, setPage] = useState(1);
    const PER_PAGE = 50;

    const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [debouncedSearch, setDebouncedSearch] = useState("");

    // Load ALL categories
    useEffect(() => {
        fetch("/api/categories")
            .then(r => r.json())
            .then(json => { if (json.all) setCategories(json.all); })
            .catch(console.error);
    }, []);

    // Load ALL products (client-side smart search needs full catalog)
    useEffect(() => {
        setLoading(true);
        async function loadAll() {
            const all: Product[] = [];
            let pg = 1;
            let hasMore = true;
            while (hasMore) {
                const res = await fetch(`/api/products?page=${pg}&pageSize=100`);
                const json = await res.json();
                const items = json.data || [];
                all.push(...items);
                const totalPages = json.pagination?.totalPages || 1;
                hasMore = pg < totalPages;
                pg++;
            }
            setAllProducts(all);
            setLoading(false);
        }
        loadAll().catch(e => { console.error(e); setLoading(false); });
    }, []);

    // Debounced search
    const handleSearch = useCallback((val: string) => {
        setSearch(val);
        if (searchTimer.current) clearTimeout(searchTimer.current);
        searchTimer.current = setTimeout(() => {
            setDebouncedSearch(val);
            setPage(1);
        }, 200);
    }, []);

    // Smart search + category filter
    const filtered = useMemo(() => {
        let list = allProducts;
        if (categoryFilter) {
            list = list.filter(p => p.categoryId === categoryFilter);
        }
        return smartSearch(list, debouncedSearch);
    }, [allProducts, categoryFilter, debouncedSearch]);

    const totalPages = Math.ceil(filtered.length / PER_PAGE);
    const pageProducts = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

    // Category helpers
    const macros = categories.filter(c => !c.parentId).sort((a, b) => a.sortOrder - b.sortOrder);
    const getCatName = (p: Product) => {
        if (p.category?.name) return p.category.name;
        const cat = categories.find(c => c.id === p.categoryId);
        return cat?.name || "—";
    };

    // Select / deselect
    const toggleSelect = (id: string) => {
        setSelected(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    };
    const selectAll = () => {
        if (selected.size === pageProducts.length) {
            setSelected(new Set());
        } else {
            setSelected(new Set(pageProducts.map(p => p.id)));
        }
    };

    // Save product edit
    async function handleSave(id: string, draft: Product) {
        const apiBody: Record<string, unknown> = { id };
        apiBody.name = draft.name;
        apiBody.sell_price = draft.sellPrice;
        apiBody.buy_price = draft.buyPrice;
        apiBody.stock = draft.stock;
        apiBody.unit_type = draft.unitType;
        apiBody.unit_value = draft.unitValue;
        apiBody.description = draft.description;
        apiBody.image_url = draft.imageUrl;
        apiBody.is_active = draft.isActive;
        apiBody.barcode = draft.barcode;
        apiBody.category_id = draft.categoryId;

        const res = await fetch("/api/admin/products/update", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(apiBody),
        });
        const data = await res.json();
        if (data.success) {
            // Update category reference
            const newCat = categories.find(c => c.id === draft.categoryId);
            setAllProducts(prev => prev.map(p =>
                p.id === id ? { ...p, ...draft, category: newCat ? { id: newCat.id, name: newCat.name } : p.category } : p
            ));
        }
        setEditingProduct(null);
    }

    // Bulk move
    async function handleBulkMove() {
        if (!moveTarget || selected.size === 0) return;
        setMoving(true); setMoveMsg(null);
        try {
            const res = await fetch("/api/admin/products/bulk-move", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ productIds: Array.from(selected), categoryId: moveTarget }),
            });
            const data = await res.json();
            if (data.success) {
                const cat = categories.find(c => c.id === moveTarget);
                setAllProducts(prev => prev.map(p =>
                    selected.has(p.id) ? { ...p, categoryId: moveTarget, category: cat ? { id: cat.id, name: cat.name } : p.category } : p
                ));
                setMoveMsg(`✅ ${selected.size} productos movidos a "${cat?.name}"`);
                setSelected(new Set());
                setMoveTarget("");
                setTimeout(() => setMoveMsg(null), 3000);
            } else {
                setMoveMsg(`❌ ${data.error}`);
            }
        } catch (e) { setMoveMsg(`❌ ${e}`); }
        finally { setMoving(false); }
    }

    return (
        <div>
            <header className="admin-page-header">
                <div>
                    <h1 className="admin-page-title">Productos</h1>
                    <p className="admin-page-subtitle">Inventario completo de GoRodadero</p>
                </div>
            </header>

            {/* Filters */}
            <div className="prod-filters">
                <select value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); setPage(1); }} className="prod-filter-select">
                    <option value="">Todas las categorías</option>
                    {macros.map(macro => {
                        const subs = categories.filter(s => s.parentId === macro.id).sort((a, b) => a.sortOrder - b.sortOrder);
                        return (
                            <optgroup key={macro.id} label={`${macro.icon || '📦'} ${macro.name}`}>
                                {subs.map(sub => (
                                    <option key={sub.id} value={sub.id}>{sub.name}</option>
                                ))}
                            </optgroup>
                        );
                    })}
                </select>
                <div className="prod-search-wrap">
                    <span className="prod-search-icon">🔍</span>
                    <input
                        className="prod-search"
                        placeholder="Smart Search: nombre, barcode, litro, kilo..."
                        value={search}
                        onChange={e => handleSearch(e.target.value)}
                        inputMode="search"
                        autoComplete="off"
                        autoCorrect="off"
                        spellCheck={false}
                    />
                    {search && <button className="prod-search-clear" onClick={() => { setSearch(""); setDebouncedSearch(""); }}>✕</button>}
                </div>
                <span className="prod-count">
                    {loading ? "Cargando..." : `${filtered.length.toLocaleString()} items`}
                </span>
            </div>

            {/* Multi-select action bar */}
            {selected.size > 0 && (
                <div className="prod-bulk-bar">
                    <span className="prod-bulk-label">📦 {selected.size} seleccionado{selected.size !== 1 ? 's' : ''}</span>
                    <select className="prod-bulk-select" value={moveTarget} onChange={e => setMoveTarget(e.target.value)}>
                        <option value="">Mover a...</option>
                        {macros.map(macro => {
                            const subs = categories.filter(s => s.parentId === macro.id).sort((a, b) => a.sortOrder - b.sortOrder);
                            return (
                                <optgroup key={macro.id} label={`${macro.icon || '📦'} ${macro.name}`}>
                                    {subs.map(sub => (
                                        <option key={sub.id} value={sub.id}>{sub.name}</option>
                                    ))}
                                </optgroup>
                            );
                        })}
                    </select>
                    <button className="prod-bulk-btn" disabled={!moveTarget || moving} onClick={handleBulkMove}>
                        {moving ? 'Moviendo...' : '🚚 Mover'}
                    </button>
                    <button className="prod-bulk-clear" onClick={() => setSelected(new Set())}>✕ Limpiar</button>
                </div>
            )}
            {moveMsg && <div className="prod-toast">{moveMsg}</div>}

            {/* Table */}
            <div className="prod-table-wrap">
                <table className="prod-table">
                    <thead>
                        <tr>
                            <th className="prod-th prod-th-chk">
                                <input type="checkbox" checked={pageProducts.length > 0 && selected.size === pageProducts.length} onChange={selectAll} />
                            </th>
                            <th className="prod-th prod-th-name">Producto</th>
                            <th className="prod-th">Categoría</th>
                            <th className="prod-th prod-th-num">Barcode</th>
                            <th className="prod-th prod-th-num">Compra</th>
                            <th className="prod-th prod-th-num">Venta</th>
                            <th className="prod-th prod-th-num">Stock</th>
                            <th className="prod-th">Unidad</th>
                            <th className="prod-th">Cant.</th>
                            <th className="prod-th">Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && (
                            <tr><td colSpan={10} className="prod-loading">⏳ Cargando catálogo completo...</td></tr>
                        )}
                        {!loading && filtered.length === 0 && (
                            <tr><td colSpan={10} className="prod-empty">No se encontraron productos</td></tr>
                        )}
                        {!loading && pageProducts.map(p => (
                            <tr key={p.id} className={`prod-row ${selected.has(p.id) ? 'prod-row--selected' : ''}`}>
                                <td className="prod-td prod-td-chk" onClick={e => e.stopPropagation()}>
                                    <input type="checkbox" checked={selected.has(p.id)} onChange={() => toggleSelect(p.id)} />
                                </td>
                                <td className="prod-td prod-td-name" onClick={() => setEditingProduct(p)}>
                                    <span className="prod-name">{p.name}</span>
                                </td>
                                <td className="prod-td" onClick={() => setEditingProduct(p)}>
                                    <span className="prod-cat-badge">{getCatName(p)}</span>
                                </td>
                                <td className="prod-td prod-td-num prod-barcode" onClick={() => setEditingProduct(p)}>{p.barcode || "—"}</td>
                                <td className="prod-td prod-td-num" onClick={() => setEditingProduct(p)}>{formatCOP(p.buyPrice)}</td>
                                <td className="prod-td prod-td-num prod-price-sell" onClick={() => setEditingProduct(p)}>{formatCOP(p.sellPrice)}</td>
                                <td className="prod-td prod-td-num" onClick={() => setEditingProduct(p)}>
                                    <span className={`prod-stock ${p.stock <= 0 ? 'prod-stock--out' : p.stock < 5 ? 'prod-stock--low' : ''}`}>{p.stock}</span>
                                </td>
                                <td className="prod-td" onClick={() => setEditingProduct(p)}>{p.unitType || "—"}</td>
                                <td className="prod-td prod-td-num" onClick={() => setEditingProduct(p)}>{p.unitValue ?? "—"}</td>
                                <td className="prod-td" onClick={() => setEditingProduct(p)}>
                                    <span className={`prod-status ${p.isActive ? 'prod-status--on' : 'prod-status--off'}`}>
                                        {p.isActive ? "Activo" : "Inactivo"}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="prod-pagination">
                    <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="prod-page-btn">← Anterior</button>
                    <span className="prod-page-info">Página {page} de {totalPages}</span>
                    <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="prod-page-btn">Siguiente →</button>
                </div>
            )}

            {/* Edit Modal */}
            {editingProduct && (
                <EditModal
                    product={editingProduct}
                    categories={categories}
                    onSave={handleSave}
                    onClose={() => setEditingProduct(null)}
                />
            )}

            <style>{`
                .admin-page-header { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:20px; }
                .admin-page-title { font-family:var(--font-outfit),sans-serif; font-weight:700; font-size:28px; color:#f1f5f9; margin:0 0 4px; }
                .admin-page-subtitle { font-size:14px; color:#64748b; margin:0; }

                .prod-filters { display:flex; gap:10px; margin-bottom:16px; flex-wrap:wrap; align-items:center; }
                .prod-filter-select { padding:8px 12px; border-radius:10px; border:1px solid rgba(255,255,255,0.08); background:rgba(15,23,42,0.6); color:#cbd5e1; font-size:13px; outline:none; cursor:pointer; min-width:200px; }
                .prod-filter-select:focus { border-color:rgba(96,165,250,0.4); }
                .prod-filter-select option, .prod-filter-select optgroup { background:#0f172a; color:#e2e8f0; }
                .prod-search-wrap { position:relative; flex:1; min-width:200px; }
                .prod-search-icon { position:absolute; left:12px; top:50%; transform:translateY(-50%); font-size:14px; pointer-events:none; }
                .prod-search { width:100%; padding:8px 12px 8px 36px; border-radius:10px; border:1px solid rgba(255,255,255,0.08); background:rgba(15,23,42,0.6); color:#e2e8f0; font-size:13px; outline:none; box-sizing:border-box; }
                .prod-search:focus { border-color:rgba(96,165,250,0.4); }
                .prod-search-clear { position:absolute; right:10px; top:50%; transform:translateY(-50%); background:rgba(255,255,255,0.1); border:none; color:#94a3b8; font-size:12px; cursor:pointer; padding:2px 6px; border-radius:6px; }
                .prod-count { font-size:13px; color:#64748b; white-space:nowrap; }

                .prod-bulk-bar { display:flex; gap:10px; align-items:center; margin-bottom:12px; padding:12px 16px; border-radius:12px; background:rgba(59,130,246,0.08); border:1px solid rgba(59,130,246,0.2); flex-wrap:wrap; }
                .prod-bulk-label { font-size:13px; font-weight:600; color:#60a5fa; }
                .prod-bulk-select { padding:8px 12px; border-radius:8px; border:1px solid rgba(255,255,255,0.08); background:rgba(15,23,42,0.6); color:#e2e8f0; font-size:12px; outline:none; cursor:pointer; min-width:160px; }
                .prod-bulk-select option, .prod-bulk-select optgroup { background:#0f172a; color:#e2e8f0; }
                .prod-bulk-btn { padding:8px 16px; border-radius:8px; border:none; background:linear-gradient(135deg,#3b82f6,#6366f1); color:white; font-size:12px; font-weight:600; cursor:pointer; }
                .prod-bulk-btn:disabled { opacity:0.4; cursor:not-allowed; }
                .prod-bulk-clear { padding:6px 12px; border-radius:8px; border:1px solid rgba(255,255,255,0.08); background:rgba(255,255,255,0.06); color:#94a3b8; font-size:12px; cursor:pointer; }
                .prod-toast { padding:10px 16px; border-radius:10px; background:rgba(15,23,42,0.7); border:1px solid rgba(255,255,255,0.08); color:#e2e8f0; font-size:13px; margin-bottom:12px; }

                .prod-table-wrap { overflow-x:auto; border-radius:12px; border:1px solid rgba(255,255,255,0.06); background:rgba(15,23,42,0.4); -webkit-overflow-scrolling:touch; }
                .prod-table { width:100%; border-collapse:collapse; min-width:850px; }
                .prod-th { padding:10px 12px; text-align:left; font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:0.5px; color:#64748b; border-bottom:1px solid rgba(255,255,255,0.06); white-space:nowrap; position:sticky; top:0; background:rgba(15,23,42,0.95); }
                .prod-th-name { min-width:160px; }
                .prod-th-num { text-align:right; }
                .prod-th-chk { width:36px; text-align:center; }

                .prod-row { cursor:pointer; transition:background 0.15s; }
                .prod-row:hover { background:rgba(96,165,250,0.06); }
                .prod-row:active { background:rgba(96,165,250,0.12); }
                .prod-row--selected { background:rgba(59,130,246,0.08) !important; }
                .prod-td { padding:10px 12px; font-size:13px; color:#cbd5e1; border-bottom:1px solid rgba(255,255,255,0.03); white-space:nowrap; vertical-align:middle; }
                .prod-td-name { min-width:160px; max-width:240px; white-space:normal; }
                .prod-td-chk { width:36px; text-align:center; cursor:default; }
                .prod-name { font-weight:500; color:#e2e8f0; }
                .prod-td-num { text-align:right; font-variant-numeric:tabular-nums; }
                .prod-barcode { font-family:monospace; font-size:11px; color:#94a3b8; letter-spacing:0.3px; }
                .prod-price-sell { font-weight:600; color:#22c55e; }
                .prod-cat-badge { font-size:11px; padding:3px 8px; border-radius:6px; background:rgba(139,92,246,0.12); color:#a78bfa; }
                .prod-stock { }
                .prod-stock--out { color:#f87171; font-weight:600; }
                .prod-stock--low { color:#fbbf24; }
                .prod-status { font-size:11px; font-weight:600; padding:3px 8px; border-radius:20px; }
                .prod-status--on { background:rgba(34,197,94,0.12); color:#22c55e; }
                .prod-status--off { background:rgba(248,113,113,0.12); color:#f87171; }

                .prod-loading, .prod-empty { text-align:center; padding:40px; color:#64748b; font-size:14px; }
                .prod-pagination { display:flex; justify-content:center; align-items:center; gap:16px; margin-top:16px; padding:12px 0; }
                .prod-page-btn { padding:8px 16px; border-radius:8px; border:1px solid rgba(255,255,255,0.08); background:rgba(15,23,42,0.6); color:#cbd5e1; font-size:13px; cursor:pointer; }
                .prod-page-btn:disabled { opacity:0.3; cursor:not-allowed; }
                .prod-page-btn:hover:not(:disabled) { background:rgba(96,165,250,0.12); border-color:rgba(96,165,250,0.3); }
                .prod-page-info { font-size:13px; color:#64748b; }

                /* Edit Modal */
                .edit-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.7); backdrop-filter:blur(4px); z-index:1000; display:flex; align-items:center; justify-content:center; padding:16px; }
                .edit-panel { background:linear-gradient(135deg,rgba(15,23,42,0.98),rgba(30,41,59,0.98)); border:1px solid rgba(255,255,255,0.08); border-radius:16px; max-width:480px; width:100%; max-height:90vh; overflow-y:auto; box-shadow:0 25px 50px rgba(0,0,0,0.5); }
                .edit-header { display:flex; justify-content:space-between; align-items:center; padding:16px 20px; border-bottom:1px solid rgba(255,255,255,0.06); }
                .edit-title { font-size:18px; font-weight:700; color:#f1f5f9; margin:0; }
                .edit-close { background:none; border:none; color:#64748b; font-size:20px; cursor:pointer; padding:4px 8px; border-radius:8px; }
                .edit-close:hover { background:rgba(255,255,255,0.06); color:#f1f5f9; }
                .edit-body { padding:16px 20px; display:flex; flex-direction:column; gap:14px; }
                .edt-field { display:flex; flex-direction:column; gap:4px; }
                .edt-label { font-size:12px; font-weight:600; color:#94a3b8; text-transform:uppercase; letter-spacing:0.5px; }
                .edt-input { padding:10px 12px; border-radius:10px; border:1px solid rgba(255,255,255,0.08); background:rgba(15,23,42,0.6); color:#e2e8f0; font-size:14px; outline:none; }
                .edt-input:focus { border-color:rgba(96,165,250,0.5); }
                .edt-textarea { padding:10px 12px; border-radius:10px; border:1px solid rgba(255,255,255,0.08); background:rgba(15,23,42,0.6); color:#e2e8f0; font-size:14px; outline:none; resize:vertical; min-height:60px; }
                .edt-select { padding:10px 12px; border-radius:10px; border:1px solid rgba(255,255,255,0.08); background:rgba(15,23,42,0.6); color:#e2e8f0; font-size:14px; outline:none; cursor:pointer; }
                .edt-select option, .edt-select optgroup { background:#0f172a; color:#e2e8f0; }
                .edt-row { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
                .edt-hint { font-size:11px; color:#64748b; margin-top:2px; }
                .edt-toggle { padding:10px 14px; border-radius:10px; border:1px solid rgba(255,255,255,0.08); background:rgba(15,23,42,0.6); color:#94a3b8; font-size:13px; cursor:pointer; text-align:left; }
                .edt-toggle--on { border-color:rgba(34,197,94,0.3); background:rgba(34,197,94,0.08); color:#22c55e; }
                .edit-footer { display:flex; gap:10px; justify-content:flex-end; padding:16px 20px; border-top:1px solid rgba(255,255,255,0.06); }
                .edit-btn { padding:10px 20px; border-radius:10px; font-size:14px; font-weight:600; cursor:pointer; border:none; }
                .edit-btn--cancel { background:rgba(255,255,255,0.06); color:#94a3b8; }
                .edit-btn--cancel:hover { background:rgba(255,255,255,0.1); }
                .edit-btn--save { background:linear-gradient(135deg,#3b82f6,#6366f1); color:white; }
                .edit-btn--save:hover { opacity:0.9; }
                .edit-btn--save:disabled { opacity:0.4; cursor:not-allowed; }

                @media (max-width:768px) {
                    .admin-page-title { font-size:22px; }
                    .prod-filter-select { min-width:100%; }
                    .prod-table { min-width:750px; }
                    .edit-panel { max-width:100%; border-radius:12px; }
                    .edt-row { grid-template-columns:1fr; }
                    .prod-bulk-bar { flex-direction:column; align-items:stretch; }
                    .prod-bulk-btn { width:100%; }
                }
            `}</style>
        </div>
    );
}

/* ═══════════ EDIT MODAL ═══════════ */
function EditModal({ product, categories, onSave, onClose }: {
    product: Product;
    categories: Category[];
    onSave: (id: string, draft: Product) => Promise<void>;
    onClose: () => void;
}) {
    const [draft, setDraft] = useState({ ...product });
    const [saving, setSaving] = useState(false);

    const currentSub = categories.find(c => c.id === draft.categoryId);
    const currentMacro = currentSub ? categories.find(c => c.id === currentSub.parentId) : null;
    const suggestedPrice = Math.round(draft.buyPrice * 1.45);
    const macros = categories.filter(c => !c.parentId).sort((a, b) => a.sortOrder - b.sortOrder);

    async function handleSave() {
        setSaving(true);
        await onSave(product.id, draft);
        setSaving(false);
    }

    return (
        <div className="edit-overlay" onClick={onClose}>
            <div className="edit-panel" onClick={e => e.stopPropagation()}>
                <div className="edit-header">
                    <h3 className="edit-title">✏️ Editar Producto</h3>
                    <button className="edit-close" onClick={onClose}>✕</button>
                </div>
                <div className="edit-body">
                    <div className="edt-field">
                        <label className="edt-label">Nombre</label>
                        <input className="edt-input" value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })} />
                    </div>
                    <div className="edt-field">
                        <label className="edt-label">Descripción</label>
                        <textarea className="edt-textarea" value={draft.description || ''} onChange={e => setDraft({ ...draft, description: e.target.value })} placeholder="Descripción del producto..." />
                    </div>
                    <div className="edt-row">
                        <div className="edt-field">
                            <label className="edt-label">💰 Precio Compra</label>
                            <input className="edt-input" type="number" value={draft.buyPrice} onChange={e => setDraft({ ...draft, buyPrice: Number(e.target.value) })} />
                        </div>
                        <div className="edt-field">
                            <label className="edt-label">🏷️ Precio Venta</label>
                            <input className="edt-input" type="number" value={draft.sellPrice} onChange={e => setDraft({ ...draft, sellPrice: Number(e.target.value) })} />
                            <span className="edt-hint">Sugerido: {formatCOP(suggestedPrice)}</span>
                        </div>
                    </div>
                    <div className="edt-row">
                        <div className="edt-field">
                            <label className="edt-label">📦 Stock</label>
                            <input className="edt-input" type="number" value={draft.stock} onChange={e => setDraft({ ...draft, stock: Number(e.target.value) })} />
                        </div>
                        <div className="edt-field">
                            <label className="edt-label">📊 Barcode</label>
                            <input className="edt-input" value={draft.barcode || ''} onChange={e => setDraft({ ...draft, barcode: e.target.value || null })} placeholder="7702191163498" />
                        </div>
                    </div>
                    <div className="edt-row">
                        <div className="edt-field">
                            <label className="edt-label">📏 Unidad</label>
                            <select className="edt-select" value={draft.unitType || ''} onChange={e => setDraft({ ...draft, unitType: e.target.value })}>
                                <option value="">— Sin unidad —</option>
                                <option value="g">Gramos (g)</option>
                                <option value="kg">Kilos (kg)</option>
                                <option value="ml">Mililitros (ml)</option>
                                <option value="L">Litros (L)</option>
                                <option value="und">Unidades (und)</option>
                                <option value="paq">Paquete (paq)</option>
                                <option value="caja">Caja</option>
                                <option value="lb">Libras (lb)</option>
                            </select>
                        </div>
                        <div className="edt-field">
                            <label className="edt-label">🔢 Cantidad</label>
                            <input className="edt-input" type="number" value={draft.unitValue ?? ''} onChange={e => setDraft({ ...draft, unitValue: e.target.value ? Number(e.target.value) : null })} placeholder="500" />
                        </div>
                    </div>
                    <div className="edt-field">
                        <label className="edt-label">📂 Categoría</label>
                        <select className="edt-select" value={draft.categoryId || ''} onChange={e => setDraft({ ...draft, categoryId: e.target.value })}>
                            <option value="">— Sin categoría —</option>
                            {macros.map(macro => {
                                const subs = categories.filter(c => c.parentId === macro.id).sort((a, b) => a.sortOrder - b.sortOrder);
                                return (
                                    <optgroup key={macro.id} label={`${macro.icon || '📦'} ${macro.name}`}>
                                        {subs.map(sub => (
                                            <option key={sub.id} value={sub.id}>{sub.name}</option>
                                        ))}
                                    </optgroup>
                                );
                            })}
                        </select>
                        {currentMacro && <span className="edt-hint">Actual: {currentMacro.name} → {currentSub?.name}</span>}
                    </div>
                    <div className="edt-field">
                        <label className="edt-label">Estado</label>
                        <button className={`edt-toggle ${draft.isActive ? 'edt-toggle--on' : ''}`} onClick={() => setDraft({ ...draft, isActive: !draft.isActive })}>
                            {draft.isActive ? '✅ Activo — Visible en tienda' : '⛔ Inactivo — Oculto'}
                        </button>
                    </div>
                    <div className="edt-field">
                        <label className="edt-label">🖼️ URL de Imagen</label>
                        <input className="edt-input" value={draft.imageUrl || ''} onChange={e => setDraft({ ...draft, imageUrl: e.target.value })} placeholder="https://..." />
                    </div>
                </div>
                <div className="edit-footer">
                    <button className="edit-btn edit-btn--cancel" onClick={onClose}>Cancelar</button>
                    <button className="edit-btn edit-btn--save" onClick={handleSave} disabled={saving}>
                        {saving ? 'Guardando...' : '💾 Guardar Cambios'}
                    </button>
                </div>
            </div>
        </div>
    );
}
