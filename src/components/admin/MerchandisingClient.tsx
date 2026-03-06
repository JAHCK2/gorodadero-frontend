"use client";

// ═══════════════════════════════════════════════════════════════
// MerchandisingClient — Visual Merchandising Manager
// Tab 1: Category Tree Organizer (Drag & Drop)
// Tab 2: Bulk Product Mover (Split View)
// ═══════════════════════════════════════════════════════════════

import { useState, useMemo, useCallback } from "react";
import {
    DndContext,
    closestCenter,
    PointerSensor,
    TouchSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from "@dnd-kit/core";
import {
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
    arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

/* ══════════════════════════════════════
   TYPES
   ══════════════════════════════════════ */

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
    sellPrice: number;
    categoryId: string;
}

interface MerchandisingClientProps {
    categories: Category[];
    products: Product[];
}

/* ══════════════════════════════════════
   SORTABLE MACRO CARD
   ══════════════════════════════════════ */

function SortableMacroCard({
    macro,
    subs,
    productCounts,
    position,
    onReorderSubs,
}: {
    macro: Category;
    subs: Category[];
    productCounts: Map<string, number>;
    position: number;
    onReorderSubs: (macroId: string, newSubs: Category[]) => void;
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
        useSortable({ id: macro.id });

    const [expanded, setExpanded] = useState(false);

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 10 : 1,
    };

    const totalProducts = subs.reduce((sum, s) => sum + (productCounts.get(s.id) || 0), 0)
        + (productCounts.get(macro.id) || 0);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
    );

    function handleSubDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        const oldIdx = subs.findIndex((s) => s.id === active.id);
        const newIdx = subs.findIndex((s) => s.id === over.id);
        if (oldIdx !== -1 && newIdx !== -1) {
            onReorderSubs(macro.id, arrayMove(subs, oldIdx, newIdx));
        }
    }

    return (
        <div ref={setNodeRef} style={style} className="merch-macro-card">
            {/* Drag handle + info */}
            <div className="merch-macro-header">
                <button className="merch-drag-handle" {...attributes} {...listeners}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="9" cy="5" r="1" /><circle cx="15" cy="5" r="1" />
                        <circle cx="9" cy="12" r="1" /><circle cx="15" cy="12" r="1" />
                        <circle cx="9" cy="19" r="1" /><circle cx="15" cy="19" r="1" />
                    </svg>
                </button>
                <span className="merch-macro-position">{position}</span>
                <span className="merch-macro-icon">{macro.icon || "📦"}</span>
                <div className="merch-macro-info">
                    <strong className="merch-macro-name">{macro.name}</strong>
                    <span className="merch-macro-meta">
                        {subs.length} subs · {totalProducts} productos
                    </span>
                </div>
                <button
                    className="merch-expand-btn"
                    onClick={() => setExpanded(!expanded)}
                >
                    {expanded ? "▲" : "▼"}
                </button>
            </div>

            {/* Sub-categories (expandable + sortable) */}
            {expanded && subs.length > 0 && (
                <div className="merch-subs-list">
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleSubDragEnd}>
                        <SortableContext items={subs.map(s => s.id)} strategy={verticalListSortingStrategy}>
                            {subs.map((sub, idx) => (
                                <SortableSubCard
                                    key={sub.id}
                                    sub={sub}
                                    position={idx + 1}
                                    productCount={productCounts.get(sub.id) || 0}
                                />
                            ))}
                        </SortableContext>
                    </DndContext>
                </div>
            )}
        </div>
    );
}

/* ══════════════════════════════════════
   SORTABLE SUB CARD
   ══════════════════════════════════════ */

function SortableSubCard({
    sub,
    position,
    productCount,
}: {
    sub: Category;
    position: number;
    productCount: number;
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
        useSortable({ id: sub.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} className="merch-sub-card">
            <button className="merch-drag-handle merch-drag-handle--small" {...attributes} {...listeners}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="9" cy="5" r="1" /><circle cx="15" cy="5" r="1" />
                    <circle cx="9" cy="12" r="1" /><circle cx="15" cy="12" r="1" />
                    <circle cx="9" cy="19" r="1" /><circle cx="15" cy="19" r="1" />
                </svg>
            </button>
            <span className="merch-sub-position">{position}</span>
            <span className="merch-sub-icon">{sub.icon || "📂"}</span>
            <span className="merch-sub-name">{sub.name}</span>
            <span className="merch-sub-badge">{productCount}</span>
        </div>
    );
}

/* ══════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════ */

export default function MerchandisingClient({ categories, products }: MerchandisingClientProps) {
    const [activeTab, setActiveTab] = useState<"organizar" | "mover">("organizar");

    // ── Category state ──
    const [macros, setMacros] = useState<Category[]>(
        () => categories.filter(c => !c.parentId).sort((a, b) => a.sortOrder - b.sortOrder)
    );
    const [subsMap, setSubsMap] = useState<Map<string, Category[]>>(() => {
        const map = new Map<string, Category[]>();
        const subs = categories.filter(c => c.parentId);
        for (const macro of categories.filter(c => !c.parentId)) {
            map.set(
                macro.id,
                subs.filter(s => s.parentId === macro.id).sort((a, b) => a.sortOrder - b.sortOrder)
            );
        }
        return map;
    });

    const [saving, setSaving] = useState(false);
    const [saveMsg, setSaveMsg] = useState<string | null>(null);
    const [hasChanges, setHasChanges] = useState(false);

    // ── Product Mover state ──
    const [sourceCategory, setSourceCategory] = useState<string>("");
    const [targetCategory, setTargetCategory] = useState<string>("");
    const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
    const [moving, setMoving] = useState(false);
    const [moveMsg, setMoveMsg] = useState<string | null>(null);
    const [localProducts, setLocalProducts] = useState<Product[]>(products);

    // ── Computed ──
    const productCounts = useMemo(() => {
        const map = new Map<string, number>();
        localProducts.forEach(p => {
            map.set(p.categoryId, (map.get(p.categoryId) || 0) + 1);
        });
        return map;
    }, [localProducts]);

    const allSubs = useMemo(() => {
        return categories.filter(c => c.parentId).sort((a, b) => a.sortOrder - b.sortOrder);
    }, [categories]);

    const sourceProducts = useMemo(() => {
        if (!sourceCategory) return [];
        return localProducts.filter(p => p.categoryId === sourceCategory);
    }, [sourceCategory, localProducts]);

    // ── Sensors ──
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
    );

    // ── Handlers: Tab 1 ──
    function handleMacroDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        const oldIdx = macros.findIndex(m => m.id === active.id);
        const newIdx = macros.findIndex(m => m.id === over.id);
        if (oldIdx !== -1 && newIdx !== -1) {
            setMacros(arrayMove(macros, oldIdx, newIdx));
            setHasChanges(true);
        }
    }

    const handleReorderSubs = useCallback((macroId: string, newSubs: Category[]) => {
        setSubsMap(prev => {
            const next = new Map(prev);
            next.set(macroId, newSubs);
            return next;
        });
        setHasChanges(true);
    }, []);

    async function handleSaveOrder() {
        setSaving(true);
        setSaveMsg(null);
        try {
            // Build updates array
            const updates: { id: string; sort_order: number }[] = [];
            macros.forEach((m, idx) => {
                updates.push({ id: m.id, sort_order: idx });
            });
            subsMap.forEach((subs) => {
                subs.forEach((s, idx) => {
                    updates.push({ id: s.id, sort_order: idx });
                });
            });

            const res = await fetch("/api/admin/categories", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ updates }),
            });
            const data = await res.json();
            if (data.success) {
                setSaveMsg(`✅ Orden guardado (${data.updated} categorías)`);
                setHasChanges(false);
            } else {
                setSaveMsg(`❌ Error: ${data.error}`);
            }
        } catch (err) {
            setSaveMsg(`❌ Error de red: ${err}`);
        } finally {
            setSaving(false);
            setTimeout(() => setSaveMsg(null), 4000);
        }
    }

    // ── Handlers: Tab 2 ──
    function toggleProduct(id: string) {
        setSelectedProducts(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }

    function toggleAll() {
        if (selectedProducts.size === sourceProducts.length) {
            setSelectedProducts(new Set());
        } else {
            setSelectedProducts(new Set(sourceProducts.map(p => p.id)));
        }
    }

    async function handleBulkMove() {
        if (!targetCategory || selectedProducts.size === 0) return;
        setMoving(true);
        setMoveMsg(null);
        try {
            const res = await fetch("/api/admin/products/bulk-move", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    productIds: Array.from(selectedProducts),
                    targetCategoryId: targetCategory,
                }),
            });
            const data = await res.json();
            if (data.success) {
                setMoveMsg(`✅ ${data.moved} productos movidos a "${data.targetCategory}"`);
                // Update local state
                setLocalProducts(prev =>
                    prev.map(p =>
                        selectedProducts.has(p.id) ? { ...p, categoryId: targetCategory } : p
                    )
                );
                setSelectedProducts(new Set());
            } else {
                setMoveMsg(`❌ Error: ${data.error}`);
            }
        } catch (err) {
            setMoveMsg(`❌ Error de red: ${err}`);
        } finally {
            setMoving(false);
            setTimeout(() => setMoveMsg(null), 5000);
        }
    }

    const formatCOP = (val: number) =>
        "$" + val.toLocaleString("es-CO", { maximumFractionDigits: 0 });

    // Helper: get category name by id
    const getCatName = (id: string) =>
        categories.find(c => c.id === id)?.name || "—";

    return (
        <div>
            <header className="admin-page-header">
                <h1 className="admin-page-title">🏪 Gestor de Merchandising</h1>
                <p className="admin-page-subtitle">
                    Organiza pasillos y mueve productos visualmente
                </p>
            </header>

            {/* ═══ TAB BAR ═══ */}
            <div className="merch-tabs">
                <button
                    className={`merch-tab ${activeTab === "organizar" ? "merch-tab--active" : ""}`}
                    onClick={() => setActiveTab("organizar")}
                >
                    📋 Organizar Pasillos
                </button>
                <button
                    className={`merch-tab ${activeTab === "mover" ? "merch-tab--active" : ""}`}
                    onClick={() => setActiveTab("mover")}
                >
                    📦 Mover Productos
                </button>
            </div>

            {/* ═══════════════════════════════════════
                TAB 1: CATEGORY TREE ORGANIZER
                ═══════════════════════════════════════ */}
            {activeTab === "organizar" && (
                <div className="merch-section">
                    {/* Save bar */}
                    <div className="merch-action-bar">
                        <span className="merch-action-label">
                            {hasChanges
                                ? "⚠️ Tienes cambios sin guardar"
                                : "Arrastra las tarjetas para reordenar"}
                        </span>
                        <button
                            className={`merch-save-btn ${hasChanges ? "merch-save-btn--active" : ""}`}
                            disabled={!hasChanges || saving}
                            onClick={handleSaveOrder}
                        >
                            {saving ? "Guardando..." : "💾 Guardar Orden"}
                        </button>
                    </div>

                    {saveMsg && <div className="merch-toast">{saveMsg}</div>}

                    {/* Sortable macro list */}
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleMacroDragEnd}>
                        <SortableContext items={macros.map(m => m.id)} strategy={verticalListSortingStrategy}>
                            <div className="merch-macro-list">
                                {macros.map((macro, idx) => (
                                    <SortableMacroCard
                                        key={macro.id}
                                        macro={macro}
                                        subs={subsMap.get(macro.id) || []}
                                        productCounts={productCounts}
                                        position={idx + 1}
                                        onReorderSubs={handleReorderSubs}
                                    />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                </div>
            )}

            {/* ═══════════════════════════════════════
                TAB 2: BULK PRODUCT MOVER
                ═══════════════════════════════════════ */}
            {activeTab === "mover" && (
                <div className="merch-section">
                    <div className="merch-mover-grid">
                        {/* LEFT: Source category + product list */}
                        <div className="merch-mover-panel">
                            <h3 className="merch-panel-title">📂 Categoría Origen</h3>
                            <select
                                className="merch-select"
                                value={sourceCategory}
                                onChange={(e) => {
                                    setSourceCategory(e.target.value);
                                    setSelectedProducts(new Set());
                                }}
                            >
                                <option value="">— Selecciona categoría —</option>
                                {macros.map(m => (
                                    <optgroup key={m.id} label={`👑 ${m.name}`}>
                                        {(subsMap.get(m.id) || []).map(s => (
                                            <option key={s.id} value={s.id}>
                                                {s.name} ({productCounts.get(s.id) || 0})
                                            </option>
                                        ))}
                                    </optgroup>
                                ))}
                            </select>

                            {sourceCategory && sourceProducts.length > 0 && (
                                <>
                                    <div className="merch-select-all">
                                        <label className="merch-checkbox-label">
                                            <input
                                                type="checkbox"
                                                checked={selectedProducts.size === sourceProducts.length}
                                                onChange={toggleAll}
                                                className="merch-checkbox"
                                            />
                                            Seleccionar todos ({sourceProducts.length})
                                        </label>
                                        <span className="merch-selected-badge">
                                            {selectedProducts.size} seleccionados
                                        </span>
                                    </div>
                                    <div className="merch-product-list">
                                        {sourceProducts.map(p => (
                                            <label key={p.id} className="merch-product-row">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedProducts.has(p.id)}
                                                    onChange={() => toggleProduct(p.id)}
                                                    className="merch-checkbox"
                                                />
                                                <span className="merch-product-name">{p.name}</span>
                                                <span className="merch-product-price">
                                                    {formatCOP(p.sellPrice)}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </>
                            )}

                            {sourceCategory && sourceProducts.length === 0 && (
                                <div className="merch-empty">
                                    Esta categoría no tiene productos.
                                </div>
                            )}
                        </div>

                        {/* RIGHT: Target category + Move button */}
                        <div className="merch-mover-panel">
                            <h3 className="merch-panel-title">🎯 Mover a</h3>
                            <select
                                className="merch-select"
                                value={targetCategory}
                                onChange={(e) => setTargetCategory(e.target.value)}
                            >
                                <option value="">— Categoría destino —</option>
                                {macros.map(m => (
                                    <optgroup key={m.id} label={`👑 ${m.name}`}>
                                        {(subsMap.get(m.id) || []).map(s => (
                                            <option key={s.id} value={s.id} disabled={s.id === sourceCategory}>
                                                {s.name}
                                            </option>
                                        ))}
                                    </optgroup>
                                ))}
                            </select>

                            {targetCategory && (
                                <div className="merch-target-preview">
                                    <span className="merch-target-label">Destino:</span>
                                    <strong className="merch-target-name">{getCatName(targetCategory)}</strong>
                                    <span className="merch-target-count">
                                        ({productCounts.get(targetCategory) || 0} productos actuales)
                                    </span>
                                </div>
                            )}

                            <button
                                className={`merch-move-btn ${(selectedProducts.size > 0 && targetCategory) ? "merch-move-btn--ready" : ""}`}
                                disabled={selectedProducts.size === 0 || !targetCategory || moving}
                                onClick={handleBulkMove}
                            >
                                {moving
                                    ? "Moviendo..."
                                    : `📦 Mover ${selectedProducts.size} producto${selectedProducts.size !== 1 ? "s" : ""}`}
                            </button>

                            {moveMsg && <div className="merch-toast">{moveMsg}</div>}
                        </div>
                    </div>
                </div>
            )}

            {/* ═══════════════════════════════════════
                STYLES — Dark Glassmorphism
                ═══════════════════════════════════════ */}
            <style>{`
                /* ── TABS ── */
                .merch-tabs {
                    display: flex;
                    gap: 4px;
                    padding: 4px;
                    border-radius: 14px;
                    background: rgba(15, 23, 42, 0.6);
                    backdrop-filter: blur(12px);
                    margin-bottom: 24px;
                    border: 1px solid rgba(255,255,255,0.06);
                }
                .merch-tab {
                    flex: 1;
                    padding: 12px 16px;
                    border: none;
                    border-radius: 10px;
                    background: transparent;
                    color: #94a3b8;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .merch-tab:hover { color: #e2e8f0; }
                .merch-tab--active {
                    background: rgba(59, 130, 246, 0.15);
                    color: #60a5fa;
                    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.15);
                }

                /* ── SECTION ── */
                .merch-section { animation: fadeIn 0.3s ease; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

                /* ── ACTION BAR ── */
                .merch-action-bar {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 12px;
                    padding: 14px 18px;
                    border-radius: 14px;
                    background: rgba(15, 23, 42, 0.5);
                    backdrop-filter: blur(12px);
                    border: 1px solid rgba(255,255,255,0.06);
                    margin-bottom: 16px;
                }
                .merch-action-label {
                    font-size: 13px;
                    color: #94a3b8;
                }
                .merch-save-btn {
                    padding: 10px 20px;
                    border: none;
                    border-radius: 10px;
                    background: rgba(100, 116, 139, 0.3);
                    color: #94a3b8;
                    font-size: 13px;
                    font-weight: 600;
                    cursor: not-allowed;
                    transition: all 0.2s;
                }
                .merch-save-btn--active {
                    background: linear-gradient(135deg, #22c55e, #16a34a);
                    color: white;
                    cursor: pointer;
                    box-shadow: 0 4px 16px rgba(34, 197, 94, 0.3);
                }
                .merch-save-btn--active:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 6px 20px rgba(34, 197, 94, 0.4);
                }

                /* ── TOAST ── */
                .merch-toast {
                    padding: 12px 18px;
                    border-radius: 10px;
                    background: rgba(15, 23, 42, 0.7);
                    backdrop-filter: blur(12px);
                    border: 1px solid rgba(255,255,255,0.08);
                    color: #e2e8f0;
                    font-size: 13px;
                    font-weight: 500;
                    margin: 12px 0;
                    animation: fadeIn 0.3s ease;
                }

                /* ── MACRO LIST ── */
                .merch-macro-list {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                /* ── MACRO CARD ── */
                .merch-macro-card {
                    border-radius: 16px;
                    background: rgba(15, 23, 42, 0.5);
                    backdrop-filter: blur(12px);
                    border: 1px solid rgba(255,255,255,0.06);
                    transition: border-color 0.2s, transform 0.2s;
                    overflow: hidden;
                }
                .merch-macro-card:hover {
                    border-color: rgba(255,255,255,0.12);
                }
                .merch-macro-header {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 16px 18px;
                }
                .merch-drag-handle {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(255,255,255,0.08);
                    color: #64748b;
                    cursor: grab;
                    flex-shrink: 0;
                    transition: all 0.2s;
                }
                .merch-drag-handle:hover {
                    background: rgba(255,255,255,0.1);
                    color: #94a3b8;
                }
                .merch-drag-handle:active { cursor: grabbing; }
                .merch-drag-handle--small { width: 24px; height: 24px; }

                .merch-macro-position {
                    width: 28px;
                    height: 28px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 8px;
                    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
                    color: white;
                    font-size: 12px;
                    font-weight: 700;
                    flex-shrink: 0;
                }
                .merch-macro-icon {
                    font-size: 24px;
                    flex-shrink: 0;
                }
                .merch-macro-info {
                    flex: 1;
                    min-width: 0;
                }
                .merch-macro-name {
                    display: block;
                    font-size: 15px;
                    font-weight: 700;
                    color: #f1f5f9;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .merch-macro-meta {
                    font-size: 12px;
                    color: #64748b;
                }
                .merch-expand-btn {
                    width: 32px;
                    height: 32px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: none;
                    border-radius: 8px;
                    background: rgba(255,255,255,0.05);
                    color: #64748b;
                    font-size: 12px;
                    cursor: pointer;
                    transition: all 0.2s;
                    flex-shrink: 0;
                }
                .merch-expand-btn:hover {
                    background: rgba(255,255,255,0.1);
                    color: #94a3b8;
                }

                /* ── SUBS LIST ── */
                .merch-subs-list {
                    padding: 0 18px 16px;
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }
                .merch-sub-card {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 10px 14px;
                    border-radius: 10px;
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.04);
                    transition: background 0.2s;
                }
                .merch-sub-card:hover { background: rgba(255,255,255,0.06); }
                .merch-sub-position {
                    width: 22px;
                    height: 22px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 6px;
                    background: rgba(100, 116, 139, 0.3);
                    color: #94a3b8;
                    font-size: 10px;
                    font-weight: 700;
                    flex-shrink: 0;
                }
                .merch-sub-icon { font-size: 16px; flex-shrink: 0; }
                .merch-sub-name {
                    flex: 1;
                    font-size: 13px;
                    color: #cbd5e1;
                    font-weight: 500;
                }
                .merch-sub-badge {
                    padding: 2px 8px;
                    border-radius: 6px;
                    background: rgba(59, 130, 246, 0.15);
                    color: #60a5fa;
                    font-size: 11px;
                    font-weight: 600;
                }

                /* ═══ TAB 2: MOVER ═══ */
                .merch-mover-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 16px;
                }
                .merch-mover-panel {
                    padding: 20px;
                    border-radius: 16px;
                    background: rgba(15, 23, 42, 0.5);
                    backdrop-filter: blur(12px);
                    border: 1px solid rgba(255,255,255,0.06);
                    display: flex;
                    flex-direction: column;
                    gap: 14px;
                }
                .merch-panel-title {
                    font-size: 16px;
                    font-weight: 700;
                    color: #f1f5f9;
                    margin: 0;
                }

                .merch-select {
                    width: 100%;
                    padding: 12px 14px;
                    border-radius: 10px;
                    background: rgba(15, 23, 42, 0.8);
                    border: 1px solid rgba(255,255,255,0.1);
                    color: #e2e8f0;
                    font-size: 13px;
                    font-weight: 500;
                    outline: none;
                    cursor: pointer;
                    transition: border-color 0.2s;
                }
                .merch-select:focus { border-color: rgba(59, 130, 246, 0.5); }
                .merch-select option { background: #0f172a; color: #e2e8f0; }
                .merch-select optgroup { font-weight: 700; color: #94a3b8; }

                /* ── Select All ── */
                .merch-select-all {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 8px 0;
                    border-bottom: 1px solid rgba(255,255,255,0.06);
                }
                .merch-checkbox-label {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 13px;
                    color: #94a3b8;
                    cursor: pointer;
                    font-weight: 500;
                }
                .merch-checkbox {
                    width: 16px;
                    height: 16px;
                    accent-color: #3b82f6;
                    cursor: pointer;
                }
                .merch-selected-badge {
                    padding: 3px 10px;
                    border-radius: 8px;
                    background: rgba(59, 130, 246, 0.15);
                    color: #60a5fa;
                    font-size: 11px;
                    font-weight: 700;
                }

                /* ── Product list ── */
                .merch-product-list {
                    max-height: 400px;
                    overflow-y: auto;
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                    scrollbar-width: thin;
                    scrollbar-color: rgba(255,255,255,0.1) transparent;
                }
                .merch-product-row {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 10px 12px;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: background 0.15s;
                }
                .merch-product-row:hover { background: rgba(255,255,255,0.05); }
                .merch-product-name {
                    flex: 1;
                    font-size: 13px;
                    color: #cbd5e1;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .merch-product-price {
                    font-size: 12px;
                    color: #22c55e;
                    font-weight: 600;
                    flex-shrink: 0;
                }

                /* ── Target preview ── */
                .merch-target-preview {
                    padding: 14px;
                    border-radius: 10px;
                    background: rgba(59, 130, 246, 0.08);
                    border: 1px solid rgba(59, 130, 246, 0.15);
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }
                .merch-target-label { font-size: 11px; color: #64748b; }
                .merch-target-name { font-size: 16px; color: #60a5fa; }
                .merch-target-count { font-size: 12px; color: #94a3b8; }

                /* ── Move button ── */
                .merch-move-btn {
                    width: 100%;
                    padding: 14px;
                    border: none;
                    border-radius: 12px;
                    background: rgba(100, 116, 139, 0.25);
                    color: #64748b;
                    font-size: 15px;
                    font-weight: 700;
                    cursor: not-allowed;
                    transition: all 0.25s;
                    margin-top: auto;
                }
                .merch-move-btn--ready {
                    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
                    color: white;
                    cursor: pointer;
                    box-shadow: 0 4px 20px rgba(59, 130, 246, 0.3);
                }
                .merch-move-btn--ready:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 24px rgba(59, 130, 246, 0.4);
                }

                .merch-empty {
                    padding: 32px;
                    text-align: center;
                    color: #64748b;
                    font-size: 13px;
                }

                /* ── Responsive ── */
                @media (max-width: 768px) {
                    .merch-tabs { flex-direction: column; }
                    .merch-mover-grid { grid-template-columns: 1fr; }
                    .merch-action-bar { flex-direction: column; text-align: center; gap: 8px; }
                    .merch-macro-header { padding: 12px 14px; }
                }

                /* ── Reuse from dashboard ── */
                .admin-page-header { margin-bottom: 24px; }
                .admin-page-title {
                    font-family: var(--font-outfit), sans-serif;
                    font-weight: 700; font-size: 28px; color: #f1f5f9; margin: 0 0 4px;
                }
                .admin-page-subtitle { font-size: 14px; color: #64748b; margin: 0; }
                @media (max-width: 768px) {
                    .admin-page-title { font-size: 22px; }
                }
            `}</style>
        </div>
    );
}
