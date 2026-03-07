"use client";

// ═══════════════════════════════════════════════════════════════
// MerchandisingClient — Visual Merchandising Manager
// Tab 1: Category Tree Organizer (Drag & Drop sort_order)
// Tab 2: Product Tree Manager (Browse, Drag-Move, Inline Edit)
// ═══════════════════════════════════════════════════════════════

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
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
}

interface MerchandisingClientProps {
    categories: Category[];
    products: Product[];
}

/* ═══════════════════════════════ TAB 1 COMPONENTS ═══════════════════════════════ */

function SortableMacroCard({
    macro, subs, productCounts, position, onReorderSubs,
}: {
    macro: Category; subs: Category[]; productCounts: Map<string, number>;
    position: number; onReorderSubs: (macroId: string, newSubs: Category[]) => void;
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: macro.id });
    const [expanded, setExpanded] = useState(false);
    const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1, zIndex: isDragging ? 10 : 1 };
    const totalProducts = subs.reduce((sum, s) => sum + (productCounts.get(s.id) || 0), 0) + (productCounts.get(macro.id) || 0);
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
    );
    function handleSubDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        const oldIdx = subs.findIndex(s => s.id === active.id);
        const newIdx = subs.findIndex(s => s.id === over.id);
        if (oldIdx !== -1 && newIdx !== -1) onReorderSubs(macro.id, arrayMove(subs, oldIdx, newIdx));
    }
    return (
        <div ref={setNodeRef} style={style} className="merch-macro-card">
            <div className="merch-macro-header">
                <button className="merch-drag-handle" {...attributes} {...listeners}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="9" cy="5" r="1" /><circle cx="15" cy="5" r="1" /><circle cx="9" cy="12" r="1" /><circle cx="15" cy="12" r="1" /><circle cx="9" cy="19" r="1" /><circle cx="15" cy="19" r="1" />
                    </svg>
                </button>
                <span className="merch-macro-position">{position}</span>
                <span className="merch-macro-icon">{macro.icon || "📦"}</span>
                <div className="merch-macro-info">
                    <strong className="merch-macro-name">{macro.name}</strong>
                    <span className="merch-macro-meta">{subs.length} subs · {totalProducts} productos</span>
                </div>
                <button className="merch-expand-btn" onClick={() => setExpanded(!expanded)}>{expanded ? "▲" : "▼"}</button>
            </div>
            {expanded && subs.length > 0 && (
                <div className="merch-subs-list">
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleSubDragEnd}>
                        <SortableContext items={subs.map(s => s.id)} strategy={verticalListSortingStrategy}>
                            {subs.map((sub, idx) => (
                                <SortableSubCard key={sub.id} sub={sub} position={idx + 1} productCount={productCounts.get(sub.id) || 0} />
                            ))}
                        </SortableContext>
                    </DndContext>
                </div>
            )}
        </div>
    );
}

function SortableSubCard({ sub, position, productCount }: { sub: Category; position: number; productCount: number }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: sub.id });
    const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
    return (
        <div ref={setNodeRef} style={style} className="merch-sub-card">
            <button className="merch-drag-handle merch-drag-handle--small" {...attributes} {...listeners}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="9" cy="5" r="1" /><circle cx="15" cy="5" r="1" /><circle cx="9" cy="12" r="1" /><circle cx="15" cy="12" r="1" /><circle cx="9" cy="19" r="1" /><circle cx="15" cy="19" r="1" />
                </svg>
            </button>
            <span className="merch-sub-position">{position}</span>
            <span className="merch-sub-icon">{sub.icon || "📂"}</span>
            <span className="merch-sub-name">{sub.name}</span>
            <span className="merch-sub-badge">{productCount}</span>
        </div>
    );
}

/* ═══════════════════════════════════ COLUMN CONFIG ═══════════════════════════════════ */

const ALL_COLUMNS = [
    { key: "name", label: "Nombre", width: "flex:1;min-width:140px", defaultOn: true },
    { key: "barcode", label: "Barcode", width: "width:110px", defaultOn: true },
    { key: "buyPrice", label: "Compra", width: "width:75px", defaultOn: true },
    { key: "sellPrice", label: "Venta", width: "width:75px", defaultOn: true },
    { key: "stock", label: "Stock", width: "width:50px", defaultOn: true },
    { key: "unitType", label: "Unidad", width: "width:65px", defaultOn: true },
    { key: "isActive", label: "Estado", width: "width:35px", defaultOn: true },
    { key: "category", label: "Categoría", width: "width:120px", defaultOn: true },
    { key: "description", label: "Descripción", width: "width:150px", defaultOn: false },
    { key: "imageUrl", label: "Imagen", width: "width:50px", defaultOn: false },
    { key: "createdAt", label: "Creado", width: "width:85px", defaultOn: false },
    { key: "updatedAt", label: "Actualizado", width: "width:85px", defaultOn: false },
] as const;

type ColumnKey = typeof ALL_COLUMNS[number]["key"];

const DEFAULT_VISIBLE = new Set<string>(ALL_COLUMNS.filter(c => c.defaultOn).map(c => c.key));

/* ═══════════════════════════════ TAB 2: PRODUCT ROW + EDIT MODAL ═══════════════════════════════ */

function ProductRow({
    product, isSelected, onToggle, onEdit, visibleCols, categories,
}: {
    product: Product; isSelected: boolean; onToggle: () => void;
    onEdit: () => void; visibleCols: Set<string>; categories: Category[];
}) {
    const formatCOP = (v: number) => "$" + v.toLocaleString("es-CO", { maximumFractionDigits: 0 });
    const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: '2-digit' }) : '—';
    return (
        <div className="tree-product-row">
            <input type="checkbox" checked={isSelected} onChange={onToggle} className="merch-checkbox" />
            {visibleCols.has("name") && <span className="tree-p-name" title={product.name}>{product.name}</span>}
            {visibleCols.has("barcode") && <span className="tree-p-barcode" title={product.barcode || ''}>{product.barcode || '—'}</span>}
            {visibleCols.has("buyPrice") && <span className="tree-p-buy">{formatCOP(product.buyPrice)}</span>}
            {visibleCols.has("sellPrice") && <span className="tree-p-sell">{formatCOP(product.sellPrice)}</span>}
            {visibleCols.has("stock") && <span className={`tree-p-stock ${product.stock <= 0 ? 'tree-p-stock--out' : product.stock < 5 ? 'tree-p-stock--low' : ''}`}>{product.stock}</span>}
            {visibleCols.has("unitType") && <span className="tree-p-unit">{product.unitType}{product.unitValue ? ` ${product.unitValue}` : ''}</span>}
            {visibleCols.has("isActive") && <span className={`tree-p-status ${product.isActive ? 'tree-p-status--on' : 'tree-p-status--off'}`}>{product.isActive ? '●' : '○'}</span>}
            {visibleCols.has("category") && <span className="tree-p-category" title={categories.find(c => c.id === product.categoryId)?.name || ''}>{categories.find(c => c.id === product.categoryId)?.name || '—'}</span>}
            {visibleCols.has("description") && <span className="tree-p-desc" title={product.description}>{product.description || '—'}</span>}
            {visibleCols.has("imageUrl") && <span className="tree-p-img">{product.imageUrl ? '🖼️' : '—'}</span>}
            {visibleCols.has("createdAt") && <span className="tree-p-date">{formatDate(product.createdAt)}</span>}
            {visibleCols.has("updatedAt") && <span className="tree-p-date">{formatDate(product.updatedAt)}</span>}
            <button className="tree-p-edit-btn" onClick={onEdit} title="Editar">✏️</button>
        </div>
    );
}

function EditProductModal({
    product, categories, onSave, onClose,
}: {
    product: Product; categories: Category[];
    onSave: (id: string, updates: Partial<Product>) => Promise<void>;
    onClose: () => void;
}) {
    const [draft, setDraft] = useState({ ...product });
    const [saving, setSaving] = useState(false);

    async function handleSave() {
        setSaving(true);
        await onSave(product.id, draft);
        setSaving(false);
        onClose();
    }

    const formatCOP = (v: number) => "$" + v.toLocaleString("es-CO", { maximumFractionDigits: 0 });
    const suggestedPrice = Math.round(draft.buyPrice * 1.45); // ~45% margin

    // Find current category path
    const currentSub = categories.find(c => c.id === draft.categoryId);
    const currentMacro = currentSub ? categories.find(c => c.id === currentSub.parentId) : null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="edit-modal" onClick={e => e.stopPropagation()}>
                <div className="edit-modal-header">
                    <h3 className="edit-modal-title">✏️ Editar Producto</h3>
                    <button className="edit-modal-close" onClick={onClose}>✕</button>
                </div>

                <div className="edit-modal-body">
                    {/* Nombre */}
                    <div className="edit-field">
                        <label className="edit-label">Nombre</label>
                        <input className="edit-input" value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })} />
                    </div>

                    {/* Descripción */}
                    <div className="edit-field">
                        <label className="edit-label">Descripción</label>
                        <textarea className="edit-textarea" value={draft.description} onChange={e => setDraft({ ...draft, description: e.target.value })} rows={2} placeholder="Descripción del producto..." />
                    </div>

                    {/* Precios */}
                    <div className="edit-row">
                        <div className="edit-field">
                            <label className="edit-label">💰 Valor de Compra</label>
                            <input className="edit-input edit-input--price" type="number" value={draft.buyPrice} onChange={e => setDraft({ ...draft, buyPrice: Number(e.target.value) })} />
                        </div>
                        <div className="edit-field">
                            <label className="edit-label">🏷️ Valor de Venta</label>
                            <input className="edit-input edit-input--price-sell" type="number" value={draft.sellPrice} onChange={e => setDraft({ ...draft, sellPrice: Number(e.target.value) })} />
                            <span className="edit-hint">Sugerido: {formatCOP(suggestedPrice)}</span>
                        </div>
                    </div>

                    {/* Stock */}
                    <div className="edit-field">
                        <label className="edit-label">📦 Stock</label>
                        <input className="edit-input edit-input--stock" type="number" value={draft.stock} onChange={e => setDraft({ ...draft, stock: Number(e.target.value) })} />
                    </div>

                    {/* Unidad */}
                    <div className="edit-row">
                        <div className="edit-field">
                            <label className="edit-label">📏 Unidad</label>
                            <select className="edit-select" value={draft.unitType} onChange={e => setDraft({ ...draft, unitType: e.target.value })}>
                                <option value="">— Sin unidad —</option>
                                <option value="g">Gramos (g)</option>
                                <option value="kg">Kilos (kg)</option>
                                <option value="ml">Mililitros (ml)</option>
                                <option value="L">Litros (L)</option>
                                <option value="und">Unidades (und)</option>
                                <option value="paq">Paquete (paq)</option>
                                <option value="caja">Caja</option>
                                <option value="docena">Docena</option>
                                <option value="lb">Libras (lb)</option>
                            </select>
                        </div>
                        <div className="edit-field">
                            <label className="edit-label">🔢 Cantidad</label>
                            <input className="edit-input" type="number" value={draft.unitValue ?? ''} onChange={e => setDraft({ ...draft, unitValue: e.target.value ? Number(e.target.value) : null })} placeholder="Ej: 500" />
                        </div>
                    </div>

                    {/* Barcode */}
                    <div className="edit-field">
                        <label className="edit-label">📊 Código de Barras</label>
                        <input className="edit-input" value={draft.barcode || ''} onChange={e => setDraft({ ...draft, barcode: e.target.value || null })} placeholder="Ej: 7702191163498" />
                    </div>

                    {/* Categoría (dropdown selector) */}
                    <div className="edit-field">
                        <label className="edit-label">📂 Categoría</label>
                        <select
                            className="edit-select edit-select--category"
                            value={draft.categoryId || ''}
                            onChange={e => setDraft({ ...draft, categoryId: e.target.value })}
                        >
                            <option value="">— Sin categoría —</option>
                            {categories
                                .filter(c => !c.parentId)
                                .sort((a, b) => a.sortOrder - b.sortOrder)
                                .map(macro => {
                                    const subs = categories
                                        .filter(c => c.parentId === macro.id)
                                        .sort((a, b) => a.sortOrder - b.sortOrder);
                                    return (
                                        <optgroup key={macro.id} label={`${macro.icon || '📦'} ${macro.name}`}>
                                            {subs.map(sub => (
                                                <option key={sub.id} value={sub.id}>
                                                    {sub.name}
                                                </option>
                                            ))}
                                        </optgroup>
                                    );
                                })}
                        </select>
                        {currentMacro && (
                            <span className="edit-hint">Actual: {currentMacro.name} → {currentSub?.name}</span>
                        )}
                    </div>

                    {/* Estado */}
                    <div className="edit-field">
                        <label className="edit-label">Estado</label>
                        <div className="edit-toggle-row">
                            <button className={`edit-toggle ${draft.isActive ? 'edit-toggle--on' : ''}`} onClick={() => setDraft({ ...draft, isActive: !draft.isActive })}>
                                {draft.isActive ? '✅ Activo — Visible en tienda' : '⛔ Inactivo — Oculto'}
                            </button>
                        </div>
                    </div>

                    {/* Imagen URL */}
                    <div className="edit-field">
                        <label className="edit-label">🖼️ URL de Imagen</label>
                        <input className="edit-input" value={draft.imageUrl} onChange={e => setDraft({ ...draft, imageUrl: e.target.value })} placeholder="https://..." />
                        {draft.imageUrl && <img src={draft.imageUrl} alt="" className="edit-img-preview" />}
                    </div>

                    {/* Timestamps (read-only) */}
                    <div className="edit-row edit-timestamps">
                        <span>Creado: {draft.createdAt ? new Date(draft.createdAt).toLocaleDateString('es-CO') : '—'}</span>
                        <span>Actualizado: {draft.updatedAt ? new Date(draft.updatedAt).toLocaleDateString('es-CO') : '—'}</span>
                    </div>
                </div>

                <div className="edit-modal-footer">
                    <button className="modal-btn modal-btn--cancel" onClick={onClose}>Cancelar</button>
                    <button className="modal-btn modal-btn--confirm" onClick={handleSave} disabled={saving}>
                        {saving ? 'Guardando...' : '💾 Guardar Cambios'}
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ═══════════════════════════════ MAIN COMPONENT ═══════════════════════════════ */

// Undo/Redo operation type
interface UndoOp {
    type: "move";
    label: string;
    productIds: string[];
    fromCategoryId: string;
    toCategoryId: string;
}
interface Snapshot {
    filename: string;
    label: string;
    createdAt: string;
    productCount: number;
}

export default function MerchandisingClient({ categories, products }: MerchandisingClientProps) {
    const [activeTab, setActiveTab] = useState<"organizar" | "mover" | "backup">("organizar");

    // ── Tab 1 state ──
    const [macros, setMacros] = useState<Category[]>(() =>
        categories.filter(c => !c.parentId).sort((a, b) => a.sortOrder - b.sortOrder)
    );
    const [subsMap, setSubsMap] = useState<Map<string, Category[]>>(() => {
        const map = new Map<string, Category[]>();
        for (const macro of categories.filter(c => !c.parentId)) {
            map.set(macro.id, categories.filter(c => c.parentId === macro.id).sort((a, b) => a.sortOrder - b.sortOrder));
        }
        return map;
    });
    const [saving, setSaving] = useState(false);
    const [saveMsg, setSaveMsg] = useState<string | null>(null);
    const [hasChanges, setHasChanges] = useState(false);

    // ── Tab 2 state ──
    const [localProducts, setLocalProducts] = useState<Product[]>(products);
    const [expandedMacros, setExpandedMacros] = useState<Set<string>>(new Set());
    const [expandedSubs, setExpandedSubs] = useState<Set<string>>(new Set());
    const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
    const [moving, setMoving] = useState(false);
    const [moveMsg, setMoveMsg] = useState<string | null>(null);
    const [searchFilter, setSearchFilter] = useState("");
    const [visibleCols, setVisibleCols] = useState<Set<string>>(() => new Set(DEFAULT_VISIBLE));
    const [showColPicker, setShowColPicker] = useState(false);
    const [confirmModal, setConfirmModal] = useState<{ targetSubId: string; targetSubName: string; targetMacroName: string } | null>(null);
    const dropTargetRef = useRef<string | null>(null);

    // ── Undo/Redo stack (max 10 levels) ──
    const [undoStack, setUndoStack] = useState<UndoOp[]>([]);
    const [redoStack, setRedoStack] = useState<UndoOp[]>([]);
    const MAX_UNDO = 10;

    // ── Backup state ──
    const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
    const [backupLoading, setBackupLoading] = useState(false);
    const [backupMsg, setBackupMsg] = useState<string | null>(null);
    const [restoreConfirm, setRestoreConfirm] = useState<Snapshot | null>(null);

    // ── Edit modal state ──
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    // Load snapshots on backup tab
    useEffect(() => {
        if (activeTab === "backup") loadSnapshots();
    }, [activeTab]);
    async function loadSnapshots() {
        try {
            const res = await fetch("/api/admin/products/snapshot");
            const data = await res.json();
            setSnapshots(data.snapshots || []);
        } catch { setSnapshots([]); }
    }

    // ── Computed ──
    const productCounts = useMemo(() => {
        const map = new Map<string, number>();
        localProducts.forEach(p => map.set(p.categoryId, (map.get(p.categoryId) || 0) + 1));
        return map;
    }, [localProducts]);

    const filteredProducts = useMemo(() => {
        if (!searchFilter.trim()) return localProducts;
        const q = searchFilter.toLowerCase();
        return localProducts.filter(p => p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q) || p.barcode?.includes(q));
    }, [localProducts, searchFilter]);

    // ── Sensors ──
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
    );

    // ── Tab 1 handlers ──
    function handleMacroDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        const oldIdx = macros.findIndex(m => m.id === active.id);
        const newIdx = macros.findIndex(m => m.id === over.id);
        if (oldIdx !== -1 && newIdx !== -1) { setMacros(arrayMove(macros, oldIdx, newIdx)); setHasChanges(true); }
    }
    const handleReorderSubs = useCallback((macroId: string, newSubs: Category[]) => {
        setSubsMap(prev => { const next = new Map(prev); next.set(macroId, newSubs); return next; });
        setHasChanges(true);
    }, []);
    async function handleSaveOrder() {
        setSaving(true); setSaveMsg(null);
        try {
            const updates: { id: string; sort_order: number }[] = [];
            macros.forEach((m, idx) => updates.push({ id: m.id, sort_order: idx }));
            subsMap.forEach(subs => subs.forEach((s, idx) => updates.push({ id: s.id, sort_order: idx })));
            const res = await fetch("/api/admin/categories", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ updates }) });
            const data = await res.json();
            setSaveMsg(data.success ? `✅ Orden guardado (${data.updated} categorías)` : `❌ Error: ${data.error}`);
            if (data.success) setHasChanges(false);
        } catch (err) { setSaveMsg(`❌ Error de red: ${err}`); }
        finally { setSaving(false); setTimeout(() => setSaveMsg(null), 4000); }
    }

    // ── Tab 2 handlers ──
    function toggleMacro(id: string) {
        setExpandedMacros(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
    }
    function toggleSub(id: string) {
        setExpandedSubs(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
    }
    function toggleProduct(id: string) {
        setSelectedProducts(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
    }
    function toggleAllInSub(subId: string) {
        const productsInSub = filteredProducts.filter(p => p.categoryId === subId);
        const allSelected = productsInSub.every(p => selectedProducts.has(p.id));
        setSelectedProducts(prev => {
            const n = new Set(prev);
            productsInSub.forEach(p => allSelected ? n.delete(p.id) : n.add(p.id));
            return n;
        });
    }

    // Move selected products to target sub via confirmation modal
    function requestMove(targetSubId: string) {
        if (selectedProducts.size === 0) return;
        const targetSub = categories.find(c => c.id === targetSubId);
        const targetMacro = targetSub ? categories.find(c => c.id === targetSub.parentId) : null;
        setConfirmModal({
            targetSubId,
            targetSubName: targetSub?.name || "",
            targetMacroName: targetMacro?.name || "",
        });
    }

    async function confirmMove() {
        if (!confirmModal) return;
        setMoving(true); setMoveMsg(null);
        try {
            const ids = Array.from(selectedProducts);
            // Record original category for undo (group by source category)
            const firstProduct = localProducts.find(p => ids.includes(p.id));
            const fromCategoryId = firstProduct?.categoryId || "";

            const res = await fetch("/api/admin/products/bulk-move", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ productIds: ids, targetCategoryId: confirmModal.targetSubId }),
            });
            const data = await res.json();
            if (data.success) {
                // Push to undo stack
                const op: UndoOp = { type: "move", label: `${ids.length} → ${confirmModal.targetSubName}`, productIds: ids, fromCategoryId, toCategoryId: confirmModal.targetSubId };
                setUndoStack(prev => [...prev.slice(-(MAX_UNDO - 1)), op]);
                setRedoStack([]);
                setMoveMsg(`✅ ${data.moved} productos movidos a "${data.targetCategory}"`);
                setLocalProducts(prev => prev.map(p => selectedProducts.has(p.id) ? { ...p, categoryId: confirmModal.targetSubId } : p));
                setSelectedProducts(new Set());
            } else { setMoveMsg(`❌ Error: ${data.error}`); }
        } catch (err) { setMoveMsg(`❌ Error: ${err}`); }
        finally { setMoving(false); setConfirmModal(null); setTimeout(() => setMoveMsg(null), 5000); }
    }

    // ── Undo/Redo handlers ──
    async function handleUndo() {
        if (undoStack.length === 0) return;
        const op = undoStack[undoStack.length - 1];
        setMoving(true);
        try {
            const res = await fetch("/api/admin/products/bulk-move", {
                method: "PATCH", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ productIds: op.productIds, targetCategoryId: op.fromCategoryId }),
            });
            const data = await res.json();
            if (data.success) {
                setLocalProducts(prev => prev.map(p => op.productIds.includes(p.id) ? { ...p, categoryId: op.fromCategoryId } : p));
                setUndoStack(prev => prev.slice(0, -1));
                setRedoStack(prev => [...prev, op]);
                setMoveMsg(`↩️ Deshacer: ${op.label}`);
                setTimeout(() => setMoveMsg(null), 3000);
            }
        } catch { } finally { setMoving(false); }
    }
    async function handleRedo() {
        if (redoStack.length === 0) return;
        const op = redoStack[redoStack.length - 1];
        setMoving(true);
        try {
            const res = await fetch("/api/admin/products/bulk-move", {
                method: "PATCH", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ productIds: op.productIds, targetCategoryId: op.toCategoryId }),
            });
            const data = await res.json();
            if (data.success) {
                setLocalProducts(prev => prev.map(p => op.productIds.includes(p.id) ? { ...p, categoryId: op.toCategoryId } : p));
                setRedoStack(prev => prev.slice(0, -1));
                setUndoStack(prev => [...prev, op]);
                setMoveMsg(`↪️ Rehacer: ${op.label}`);
                setTimeout(() => setMoveMsg(null), 3000);
            }
        } catch { } finally { setMoving(false); }
    }

    // ── Backup handlers ──
    async function handleCreateBackup() {
        setBackupLoading(true); setBackupMsg(null);
        try {
            const res = await fetch("/api/admin/products/snapshot", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ label: `Backup manual — ${new Date().toLocaleString("es-CO")}` }) });
            const data = await res.json();
            if (data.success) { setBackupMsg(`✅ Backup guardado (${data.products} productos)`); await loadSnapshots(); }
            else setBackupMsg(`❌ ${data.error}`);
        } catch (e) { setBackupMsg(`❌ ${e}`); }
        finally { setBackupLoading(false); setTimeout(() => setBackupMsg(null), 4000); }
    }
    async function handleRestore(snap: Snapshot) {
        setBackupLoading(true); setBackupMsg(null);
        try {
            const res = await fetch("/api/admin/products/snapshot/restore", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ filename: snap.filename }) });
            const data = await res.json();
            if (data.success) { setBackupMsg(`✅ Restaurado: ${data.restored}/${data.total} productos`); window.location.reload(); }
            else setBackupMsg(`❌ ${data.error}`);
        } catch (e) { setBackupMsg(`❌ ${e}`); }
        finally { setBackupLoading(false); setRestoreConfirm(null); }
    }

    // Inline product edit
    async function handleProductSave(id: string, updatedProduct: Partial<Product>) {
        try {
            const apiBody: Record<string, unknown> = { id };
            if (updatedProduct.name !== undefined) apiBody.name = updatedProduct.name;
            if (updatedProduct.sellPrice !== undefined) apiBody.sell_price = updatedProduct.sellPrice;
            if (updatedProduct.buyPrice !== undefined) apiBody.buy_price = updatedProduct.buyPrice;
            if (updatedProduct.stock !== undefined) apiBody.stock = updatedProduct.stock;
            if (updatedProduct.unitType !== undefined) apiBody.unit_type = updatedProduct.unitType;
            if (updatedProduct.unitValue !== undefined) apiBody.unit_value = updatedProduct.unitValue;
            if (updatedProduct.description !== undefined) apiBody.description = updatedProduct.description;
            if (updatedProduct.imageUrl !== undefined) apiBody.image_url = updatedProduct.imageUrl;
            if (updatedProduct.isActive !== undefined) apiBody.is_active = updatedProduct.isActive;
            if (updatedProduct.barcode !== undefined) apiBody.barcode = updatedProduct.barcode;
            if (updatedProduct.categoryId !== undefined) apiBody.category_id = updatedProduct.categoryId;
            const res = await fetch("/api/admin/products/update", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(apiBody) });
            const data = await res.json();
            if (data.success) {
                setLocalProducts(prev => prev.map(p => p.id === id ? { ...p, ...updatedProduct } : p));
            }
        } catch { /* silently fail */ }
    }

    function expandAll() {
        setExpandedMacros(new Set(macros.map(m => m.id)));
        const allSubIds: string[] = [];
        subsMap.forEach(subs => subs.forEach(s => allSubIds.push(s.id)));
        setExpandedSubs(new Set(allSubIds));
    }
    function collapseAll() { setExpandedMacros(new Set()); setExpandedSubs(new Set()); }

    return (
        <div>
            <header className="admin-page-header">
                <h1 className="admin-page-title">🏪 Gestor de Merchandising</h1>
                <p className="admin-page-subtitle">Organiza pasillos, mueve y edita productos visualmente</p>
            </header>

            {/* ═══ TAB BAR ═══ */}
            <div className="merch-tabs">
                <button className={`merch-tab ${activeTab === "organizar" ? "merch-tab--active" : ""}`} onClick={() => setActiveTab("organizar")}>📋 Organizar Pasillos</button>
                <button className={`merch-tab ${activeTab === "mover" ? "merch-tab--active" : ""}`} onClick={() => setActiveTab("mover")}>📦 Gestión de Productos</button>
                <button className={`merch-tab ${activeTab === "backup" ? "merch-tab--active" : ""}`} onClick={() => setActiveTab("backup")}>💾 Copias de Seguridad</button>
            </div>

            {/* ═══ TAB 1: CATEGORY TREE ORGANIZER ═══ */}
            {activeTab === "organizar" && (
                <div className="merch-section">
                    <div className="merch-action-bar">
                        <span className="merch-action-label">{hasChanges ? "⚠️ Tienes cambios sin guardar" : "Arrastra las tarjetas para reordenar"}</span>
                        <button className={`merch-save-btn ${hasChanges ? "merch-save-btn--active" : ""}`} disabled={!hasChanges || saving} onClick={handleSaveOrder}>
                            {saving ? "Guardando..." : "💾 Guardar Orden"}
                        </button>
                    </div>
                    {saveMsg && <div className="merch-toast">{saveMsg}</div>}
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleMacroDragEnd}>
                        <SortableContext items={macros.map(m => m.id)} strategy={verticalListSortingStrategy}>
                            <div className="merch-macro-list">
                                {macros.map((macro, idx) => (
                                    <SortableMacroCard key={macro.id} macro={macro} subs={subsMap.get(macro.id) || []} productCounts={productCounts} position={idx + 1} onReorderSubs={handleReorderSubs} />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                </div>
            )}

            {/* ═══ TAB 2: PRODUCT TREE MANAGER ═══ */}
            {activeTab === "mover" && (
                <div className="merch-section">
                    {/* Toolbar */}
                    <div className="merch-action-bar">
                        <div className="tree-toolbar-left">
                            <input className="tree-search" placeholder="🔍 Buscar producto o barcode..." value={searchFilter} onChange={e => setSearchFilter(e.target.value)} />
                            <button className="tree-expand-btn" onClick={expandAll}>📂 Expandir</button>
                            <button className="tree-expand-btn" onClick={collapseAll}>📁 Colapsar</button>
                            <button className="tree-expand-btn col-picker-trigger" onClick={() => setShowColPicker(!showColPicker)}>⚙️ Columnas</button>
                            {showColPicker && (
                                <div className="col-picker-dropdown">
                                    <div className="col-picker-title">Columnas visibles</div>
                                    {ALL_COLUMNS.map(col => (
                                        <label key={col.key} className="col-picker-item">
                                            <input type="checkbox" checked={visibleCols.has(col.key)} onChange={() => {
                                                const next = new Set(visibleCols);
                                                if (next.has(col.key)) next.delete(col.key); else next.add(col.key);
                                                setVisibleCols(next);
                                            }} />
                                            {col.label}
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="tree-toolbar-right">
                            <button className={`undo-btn ${undoStack.length > 0 ? 'undo-btn--active' : ''}`} disabled={undoStack.length === 0 || moving} onClick={handleUndo} title="Deshacer">
                                ↩️ Deshacer {undoStack.length > 0 && <span className="undo-badge">{undoStack.length}</span>}
                            </button>
                            <button className={`undo-btn ${redoStack.length > 0 ? 'undo-btn--active' : ''}`} disabled={redoStack.length === 0 || moving} onClick={handleRedo} title="Rehacer">
                                ↪️ Rehacer {redoStack.length > 0 && <span className="undo-badge">{redoStack.length}</span>}
                            </button>
                            <span className="merch-selected-badge">{selectedProducts.size} seleccionados</span>
                        </div>
                    </div>

                    {moveMsg && <div className="merch-toast">{moveMsg}</div>}

                    {/* Tree */}
                    <div className="tree-container">
                        {macros.map(macro => {
                            const subs = subsMap.get(macro.id) || [];
                            const macroExpanded = expandedMacros.has(macro.id);
                            const macroProductCount = subs.reduce((sum, s) => sum + (productCounts.get(s.id) || 0), 0) + (productCounts.get(macro.id) || 0);

                            return (
                                <div key={macro.id} className="tree-macro">
                                    <button className="tree-macro-header" onClick={() => toggleMacro(macro.id)}>
                                        <span className="tree-chevron">{macroExpanded ? "▼" : "▶"}</span>
                                        <span className="tree-macro-icon">{macro.icon || "📦"}</span>
                                        <strong className="tree-macro-name">{macro.name}</strong>
                                        <span className="tree-macro-badge">{macroProductCount} products</span>
                                    </button>

                                    {macroExpanded && subs.map(sub => {
                                        const subExpanded = expandedSubs.has(sub.id);
                                        const subProducts = filteredProducts.filter(p => p.categoryId === sub.id);
                                        const allChecked = subProducts.length > 0 && subProducts.every(p => selectedProducts.has(p.id));
                                        const isDropTarget = dropTargetRef.current === sub.id;

                                        return (
                                            <div key={sub.id} className={`tree-sub ${isDropTarget ? "tree-sub--droptarget" : ""}`}>
                                                <div className="tree-sub-header">
                                                    <button className="tree-sub-toggle" onClick={() => toggleSub(sub.id)}>
                                                        <span className="tree-chevron tree-chevron--sub">{subExpanded ? "▼" : "▶"}</span>
                                                        <span className="tree-sub-icon">{sub.icon || "📂"}</span>
                                                        <span className="tree-sub-name">{sub.name}</span>
                                                        <span className="tree-sub-badge">{productCounts.get(sub.id) || 0}</span>
                                                    </button>
                                                    {/* Drop zone: move selected here */}
                                                    {selectedProducts.size > 0 && (
                                                        <button className="tree-drop-btn" onClick={() => requestMove(sub.id)} title={`Mover ${selectedProducts.size} productos aquí`}>
                                                            📥 Mover aquí
                                                        </button>
                                                    )}
                                                </div>

                                                {subExpanded && (
                                                    <div className="tree-products">
                                                        {subProducts.length > 0 && (
                                                            <>
                                                                <div className="tree-selectall">
                                                                    <label className="merch-checkbox-label">
                                                                        <input type="checkbox" checked={allChecked} onChange={() => toggleAllInSub(sub.id)} className="merch-checkbox" />
                                                                        Seleccionar todos ({subProducts.length})
                                                                    </label>
                                                                </div>
                                                                <div className="tree-products-scroll">
                                                                    <div className="tree-col-headers">
                                                                        <span className="tree-col-check"></span>
                                                                        {ALL_COLUMNS.filter(c => visibleCols.has(c.key)).map(col => (
                                                                            <span key={col.key} className={`tree-col-${col.key}`} style={{ ...(col.key === 'name' ? { flex: 1, minWidth: 140 } : {}) }}>{col.label}</span>
                                                                        ))}
                                                                        <span className="tree-col-edit"></span>
                                                                    </div>
                                                                    {subProducts.map(p => (
                                                                        <ProductRow
                                                                            key={p.id}
                                                                            product={p}
                                                                            isSelected={selectedProducts.has(p.id)}
                                                                            onToggle={() => toggleProduct(p.id)}
                                                                            onEdit={() => setEditingProduct(p)}
                                                                            visibleCols={visibleCols}
                                                                            categories={categories}
                                                                        />
                                                                    ))}
                                                                </div>
                                                            </>
                                                        )}
                                                        {subProducts.length === 0 && <div className="tree-empty">Sin productos</div>}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}

                                    {/* Products directly assigned to macro (no sub-category) */}
                                    {macroExpanded && (productCounts.get(macro.id) || 0) > 0 && (() => {
                                        const directProducts = filteredProducts.filter(p => p.categoryId === macro.id);
                                        const directExpanded = expandedSubs.has(`direct-${macro.id}`);
                                        const allChecked = directProducts.length > 0 && directProducts.every(p => selectedProducts.has(p.id));
                                        return (
                                            <div className="tree-sub">
                                                <div className="tree-sub-header">
                                                    <button className="tree-sub-toggle" onClick={() => toggleSub(`direct-${macro.id}`)}>
                                                        <span className="tree-chevron tree-chevron--sub">{directExpanded ? "▼" : "▶"}</span>
                                                        <span className="tree-sub-icon">📋</span>
                                                        <span className="tree-sub-name">Sin subcategoría</span>
                                                        <span className="tree-sub-badge">{directProducts.length}</span>
                                                    </button>
                                                    {selectedProducts.size > 0 && (
                                                        <button className="tree-drop-btn" onClick={() => requestMove(macro.id)} title={`Mover ${selectedProducts.size} productos aquí`}>
                                                            📥 Mover aquí
                                                        </button>
                                                    )}
                                                </div>
                                                {directExpanded && (
                                                    <div className="tree-products">
                                                        {directProducts.length > 0 && (
                                                            <>
                                                                <div className="tree-selectall">
                                                                    <label className="merch-checkbox-label">
                                                                        <input type="checkbox" checked={allChecked} onChange={() => {
                                                                            const ids = directProducts.map(p => p.id);
                                                                            setSelectedProducts(prev => {
                                                                                const next = new Set(prev);
                                                                                if (allChecked) ids.forEach(id => next.delete(id));
                                                                                else ids.forEach(id => next.add(id));
                                                                                return next;
                                                                            });
                                                                        }} className="merch-checkbox" />
                                                                        Seleccionar todos ({directProducts.length})
                                                                    </label>
                                                                </div>
                                                                <div className="tree-products-scroll">
                                                                    <div className="tree-col-headers">
                                                                        <span className="tree-col-check"></span>
                                                                        {ALL_COLUMNS.filter(c => visibleCols.has(c.key)).map(col => (
                                                                            <span key={col.key} className={`tree-col-${col.key}`} style={{ ...(col.key === 'name' ? { flex: 1, minWidth: 140 } : {}) }}>{col.label}</span>
                                                                        ))}
                                                                        <span className="tree-col-edit"></span>
                                                                    </div>
                                                                    {directProducts.map(p => (
                                                                        <ProductRow
                                                                            key={p.id}
                                                                            product={p}
                                                                            isSelected={selectedProducts.has(p.id)}
                                                                            onToggle={() => toggleProduct(p.id)}
                                                                            onEdit={() => setEditingProduct(p)}
                                                                            visibleCols={visibleCols}
                                                                            categories={categories}
                                                                        />
                                                                    ))}
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })()}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ═══ TAB 3: BACKUPS ═══ */}
            {activeTab === "backup" && (
                <div className="merch-section">
                    <div className="merch-action-bar">
                        <span className="merch-action-label">💾 Guarda copias antes de reorganizar la tienda</span>
                        <button className="merch-save-btn merch-save-btn--active" disabled={backupLoading} onClick={handleCreateBackup}>
                            {backupLoading ? "Guardando..." : "📸 Crear Backup Ahora"}
                        </button>
                    </div>
                    {backupMsg && <div className="merch-toast">{backupMsg}</div>}
                    <div className="backup-list">
                        {snapshots.length === 0 && <div className="tree-empty">No hay copias de seguridad todavía. Crea una antes de reorganizar.</div>}
                        {snapshots.map(snap => (
                            <div key={snap.filename} className="backup-card">
                                <div className="backup-info">
                                    <strong className="backup-label">{snap.label}</strong>
                                    <span className="backup-meta">{new Date(snap.createdAt).toLocaleString("es-CO")} · {snap.productCount} productos</span>
                                </div>
                                <button className="backup-restore-btn" onClick={() => setRestoreConfirm(snap)}>🔄 Restaurar</button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ═══ RESTORE CONFIRMATION MODAL ═══ */}
            {restoreConfirm && (
                <div className="modal-overlay" onClick={() => setRestoreConfirm(null)}>
                    <div className="modal-card" onClick={e => e.stopPropagation()}>
                        <h3 className="modal-title">⚠️ Restaurar Backup</h3>
                        <p className="modal-body">¿Estás seguro de restaurar <strong>{restoreConfirm.label}</strong>? Esto revertirá todos los productos a su estado guardado.</p>
                        <div className="modal-route">
                            <span className="modal-route-sub">{restoreConfirm.productCount} productos serán restaurados</span>
                        </div>
                        <div className="modal-actions">
                            <button className="modal-btn modal-btn--cancel" onClick={() => setRestoreConfirm(null)}>Cancelar</button>
                            <button className="modal-btn modal-btn--confirm" onClick={() => handleRestore(restoreConfirm)} disabled={backupLoading}>
                                {backupLoading ? "Restaurando..." : "✅ Restaurar"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══ EDIT PRODUCT MODAL ═══ */}
            {editingProduct && (
                <EditProductModal
                    product={editingProduct}
                    categories={categories}
                    onSave={handleProductSave}
                    onClose={() => setEditingProduct(null)}
                />
            )}

            {/* ═══ CONFIRMATION MODAL ═══ */}
            {confirmModal && (
                <div className="modal-overlay" onClick={() => setConfirmModal(null)}>
                    <div className="modal-card" onClick={e => e.stopPropagation()}>
                        <h3 className="modal-title">📦 Confirmar Traslado</h3>
                        <p className="modal-body">
                            ¿Mover <strong>{selectedProducts.size}</strong> producto{selectedProducts.size !== 1 ? "s" : ""} a:
                        </p>
                        <div className="modal-route">
                            <span className="modal-route-macro">{confirmModal.targetMacroName}</span>
                            <span className="modal-route-arrow">→</span>
                            <span className="modal-route-sub">{confirmModal.targetSubName}</span>
                        </div>
                        <div className="modal-preview">
                            {Array.from(selectedProducts).slice(0, 5).map(id => {
                                const p = localProducts.find(x => x.id === id);
                                return p ? <div key={id} className="modal-preview-item">• {p.name}</div> : null;
                            })}
                            {selectedProducts.size > 5 && <div className="modal-preview-item modal-preview-more">...y {selectedProducts.size - 5} más</div>}
                        </div>
                        <div className="modal-actions">
                            <button className="modal-btn modal-btn--cancel" onClick={() => setConfirmModal(null)}>Cancelar</button>
                            <button className="modal-btn modal-btn--confirm" onClick={confirmMove} disabled={moving}>
                                {moving ? "Moviendo..." : `✅ Confirmar (${selectedProducts.size})`}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══ STYLES ═══ */}
            <style>{`
                /* ── TABS ── */
                .merch-tabs { display: flex; gap: 4px; padding: 4px; border-radius: 14px; background: rgba(15,23,42,0.6); backdrop-filter: blur(12px); margin-bottom: 24px; border: 1px solid rgba(255,255,255,0.06); }
                .merch-tab { flex: 1; padding: 12px 16px; border: none; border-radius: 10px; background: transparent; color: #94a3b8; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
                .merch-tab:hover { color: #e2e8f0; }
                .merch-tab--active { background: rgba(59,130,246,0.15); color: #60a5fa; box-shadow: 0 2px 8px rgba(59,130,246,0.15); }
                .merch-section { animation: fadeIn 0.3s ease; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

                /* ── ACTION BAR ── */
                .merch-action-bar { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 14px 18px; border-radius: 14px; background: rgba(15,23,42,0.5); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.06); margin-bottom: 16px; flex-wrap: wrap; }
                .merch-action-label { font-size: 13px; color: #94a3b8; }
                .merch-save-btn { padding: 10px 20px; border: none; border-radius: 10px; background: rgba(100,116,139,0.3); color: #94a3b8; font-size: 13px; font-weight: 600; cursor: not-allowed; transition: all 0.2s; }
                .merch-save-btn--active { background: linear-gradient(135deg,#22c55e,#16a34a); color: white; cursor: pointer; box-shadow: 0 4px 16px rgba(34,197,94,0.3); }
                .merch-save-btn--active:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(34,197,94,0.4); }
                .merch-toast { padding: 12px 18px; border-radius: 10px; background: rgba(15,23,42,0.7); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.08); color: #e2e8f0; font-size: 13px; font-weight: 500; margin: 12px 0; animation: fadeIn 0.3s; }
                .merch-selected-badge { padding: 3px 10px; border-radius: 8px; background: rgba(59,130,246,0.15); color: #60a5fa; font-size: 11px; font-weight: 700; }

                /* ── TAB 1 CARDS ── */
                .merch-macro-list { display: flex; flex-direction: column; gap: 8px; }
                .merch-macro-card { border-radius: 16px; background: rgba(15,23,42,0.5); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.06); transition: border-color 0.2s; overflow: hidden; }
                .merch-macro-card:hover { border-color: rgba(255,255,255,0.12); }
                .merch-macro-header { display: flex; align-items: center; gap: 12px; padding: 16px 18px; }
                .merch-drag-handle { display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 8px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); color: #64748b; cursor: grab; flex-shrink: 0; transition: all 0.2s; }
                .merch-drag-handle:hover { background: rgba(255,255,255,0.1); color: #94a3b8; }
                .merch-drag-handle:active { cursor: grabbing; }
                .merch-drag-handle--small { width: 24px; height: 24px; }
                .merch-macro-position { width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; border-radius: 8px; background: linear-gradient(135deg,#3b82f6,#1d4ed8); color: white; font-size: 12px; font-weight: 700; flex-shrink: 0; }
                .merch-macro-icon { font-size: 24px; flex-shrink: 0; }
                .merch-macro-info { flex: 1; min-width: 0; }
                .merch-macro-name { display: block; font-size: 15px; font-weight: 700; color: #f1f5f9; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                .merch-macro-meta { font-size: 12px; color: #64748b; }
                .merch-expand-btn { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border: none; border-radius: 8px; background: rgba(255,255,255,0.05); color: #64748b; font-size: 12px; cursor: pointer; transition: all 0.2s; flex-shrink: 0; }
                .merch-expand-btn:hover { background: rgba(255,255,255,0.1); color: #94a3b8; }
                .merch-subs-list { padding: 0 18px 16px; display: flex; flex-direction: column; gap: 4px; }
                .merch-sub-card { display: flex; align-items: center; gap: 10px; padding: 10px 14px; border-radius: 10px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.04); transition: background 0.2s; }
                .merch-sub-card:hover { background: rgba(255,255,255,0.06); }
                .merch-sub-position { width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; border-radius: 6px; background: rgba(100,116,139,0.3); color: #94a3b8; font-size: 10px; font-weight: 700; flex-shrink: 0; }
                .merch-sub-icon { font-size: 16px; flex-shrink: 0; }
                .merch-sub-name { flex: 1; font-size: 13px; color: #cbd5e1; font-weight: 500; }
                .merch-sub-badge { padding: 2px 8px; border-radius: 6px; background: rgba(59,130,246,0.15); color: #60a5fa; font-size: 11px; font-weight: 600; }

                /* ═══ TAB 2: TREE MANAGER ═══ */
                .tree-toolbar-left { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
                .tree-search { padding: 10px 14px; border-radius: 10px; background: rgba(15,23,42,0.8); border: 1px solid rgba(255,255,255,0.1); color: #e2e8f0; font-size: 13px; width: 240px; outline: none; transition: border-color 0.2s; }
                .tree-search:focus { border-color: rgba(59,130,246,0.5); }
                .tree-expand-btn { padding: 8px 14px; border: none; border-radius: 8px; background: rgba(255,255,255,0.05); color: #94a3b8; font-size: 12px; font-weight: 500; cursor: pointer; transition: all 0.2s; }
                .tree-expand-btn:hover { background: rgba(255,255,255,0.1); color: #e2e8f0; }
                .tree-toolbar-left { position: relative; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
                .col-picker-trigger { position: relative; }
                .col-picker-dropdown { position: absolute; top: 100%; left: 0; z-index: 50; margin-top: 6px; padding: 10px; border-radius: 12px; background: rgba(15,23,42,0.95); border: 1px solid rgba(255,255,255,0.1); backdrop-filter: blur(12px); min-width: 180px; box-shadow: 0 8px 20px rgba(0,0,0,0.4); }
                .col-picker-title { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; padding-bottom: 6px; border-bottom: 1px solid rgba(255,255,255,0.06); }
                .col-picker-item { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #cbd5e1; padding: 4px 2px; cursor: pointer; border-radius: 4px; }
                .col-picker-item:hover { background: rgba(255,255,255,0.05); }
                .col-picker-item input { accent-color: #3b82f6; width: 14px; height: 14px; }
                .tree-container { display: flex; flex-direction: column; gap: 6px; }

                /* Macro folder */
                .tree-macro { border-radius: 14px; background: rgba(15,23,42,0.4); border: 1px solid rgba(255,255,255,0.05); overflow: hidden; }
                .tree-macro-header { display: flex; align-items: center; gap: 10px; padding: 14px 16px; width: 100%; border: none; background: transparent; color: #f1f5f9; cursor: pointer; transition: background 0.15s; text-align: left; }
                .tree-macro-header:hover { background: rgba(255,255,255,0.03); }
                .tree-chevron { font-size: 10px; color: #64748b; width: 16px; flex-shrink: 0; }
                .tree-chevron--sub { font-size: 9px; }
                .tree-macro-icon { font-size: 20px; flex-shrink: 0; }
                .tree-macro-name { flex: 1; font-size: 15px; font-weight: 700; }
                .tree-macro-badge { padding: 2px 8px; border-radius: 6px; background: rgba(139,92,246,0.15); color: #a78bfa; font-size: 11px; font-weight: 600; }

                /* Sub folder */
                .tree-sub { margin: 0 12px 4px 28px; border-radius: 10px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.04); overflow: hidden; transition: border-color 0.2s; }
                .tree-sub--droptarget { border-color: rgba(59,130,246,0.5); background: rgba(59,130,246,0.05); }
                .tree-sub-header { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
                .tree-sub-toggle { display: flex; align-items: center; gap: 8px; padding: 10px 14px; flex: 1; border: none; background: transparent; color: #cbd5e1; cursor: pointer; text-align: left; transition: background 0.15s; }
                .tree-sub-toggle:hover { background: rgba(255,255,255,0.03); }
                .tree-sub-icon { font-size: 14px; }
                .tree-sub-name { flex: 1; font-size: 13px; font-weight: 600; }
                .tree-sub-badge { padding: 2px 8px; border-radius: 6px; background: rgba(59,130,246,0.12); color: #60a5fa; font-size: 10px; font-weight: 600; }
                .tree-drop-btn { margin-right: 8px; padding: 6px 12px; border: 1px dashed rgba(59,130,246,0.4); border-radius: 8px; background: rgba(59,130,246,0.08); color: #60a5fa; font-size: 11px; font-weight: 600; cursor: pointer; transition: all 0.2s; flex-shrink: 0; white-space: nowrap; }
                .tree-drop-btn:hover { background: rgba(59,130,246,0.2); border-color: rgba(59,130,246,0.6); }

                /* Product rows */
                .tree-products { padding: 4px 8px 8px 36px; }
                .tree-products-scroll { overflow-x: auto; -webkit-overflow-scrolling: touch; }
                .tree-col-headers { display: flex; align-items: center; gap: 8px; padding: 4px 10px; font-size: 10px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid rgba(255,255,255,0.04); min-width: 720px; }
                .tree-col-check { width: 16px; flex-shrink: 0; }
                .tree-col-name { flex: 1; min-width: 140px; }
                .tree-col-buy { width: 70px; text-align: right; flex-shrink: 0; }
                .tree-col-sell { width: 70px; text-align: right; flex-shrink: 0; }
                .tree-col-stock { width: 45px; text-align: right; flex-shrink: 0; }
                .tree-col-unit { width: 65px; flex-shrink: 0; }
                .tree-col-status { width: 35px; text-align: center; flex-shrink: 0; }
                .tree-col-barcode { width: 110px; flex-shrink: 0; }
                .tree-col-description { width: 150px; flex-shrink: 0; }
                .tree-col-imageUrl { width: 50px; flex-shrink: 0; text-align: center; }
                .tree-col-createdAt { width: 85px; flex-shrink: 0; }
                .tree-col-updatedAt { width: 85px; flex-shrink: 0; }
                .tree-col-category { width: 120px; flex-shrink: 0; }
                .tree-col-edit { width: 30px; flex-shrink: 0; }
                .tree-selectall { padding: 6px 8px; margin-bottom: 4px; }
                .merch-checkbox-label { display: flex; align-items: center; gap: 8px; font-size: 12px; color: #94a3b8; cursor: pointer; font-weight: 500; }
                .merch-checkbox { width: 16px; height: 16px; accent-color: #3b82f6; cursor: pointer; }
                .tree-product-row { display: flex; align-items: center; gap: 8px; padding: 7px 10px; border-radius: 8px; transition: background 0.15s; font-size: 13px; min-width: 720px; }
                .tree-product-row:hover { background: rgba(255,255,255,0.04); }
                .tree-p-name { flex: 1; color: #cbd5e1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 140px; }
                .tree-p-buy { color: #f59e0b; font-weight: 500; font-size: 12px; width: 70px; text-align: right; flex-shrink: 0; }
                .tree-p-sell { color: #22c55e; font-weight: 600; font-size: 12px; width: 70px; text-align: right; flex-shrink: 0; }
                .tree-p-stock { color: #94a3b8; font-size: 12px; width: 45px; text-align: right; flex-shrink: 0; font-weight: 600; }
                .tree-p-stock--low { color: #f59e0b; }
                .tree-p-stock--out { color: #ef4444; }
                .tree-p-unit { color: #64748b; font-size: 11px; width: 65px; flex-shrink: 0; }
                .tree-p-status { width: 30px; text-align: center; font-size: 14px; flex-shrink: 0; }
                .tree-p-status--on { color: #22c55e; }
                .tree-p-status--off { color: #64748b; }
                .tree-p-edit-btn { border: none; background: transparent; cursor: pointer; font-size: 14px; padding: 2px 4px; opacity: 0.4; transition: opacity 0.2s; width: 30px; flex-shrink: 0; }
                .tree-p-edit-btn:hover { opacity: 1; }
                .tree-p-barcode { color: #64748b; font-size: 11px; font-family: 'Courier New', monospace; width: 110px; flex-shrink: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                .tree-p-desc { color: #475569; font-size: 11px; width: 150px; flex-shrink: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                .tree-p-img { width: 50px; flex-shrink: 0; text-align: center; font-size: 14px; }
                .tree-p-date { color: #475569; font-size: 10px; width: 85px; flex-shrink: 0; font-family: monospace; }
                .tree-p-category { color: #a78bfa; font-size: 11px; width: 120px; flex-shrink: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-weight: 500; }
                .tree-empty { padding: 12px; text-align: center; color: #475569; font-size: 12px; }

                /* ═══ EDIT PRODUCT MODAL ═══ */
                .edit-modal { width: 92%; max-width: 520px; max-height: 90vh; overflow-y: auto; border-radius: 24px; background: rgba(15,23,42,0.97); backdrop-filter: blur(24px); border: 1px solid rgba(255,255,255,0.08); box-shadow: 0 24px 80px rgba(0,0,0,0.5); animation: fadeIn 0.25s; }
                .edit-modal-header { display: flex; align-items: center; justify-content: space-between; padding: 24px 28px 0; }
                .edit-modal-title { font-size: 20px; font-weight: 700; color: #f1f5f9; margin: 0; }
                .edit-modal-close { border: none; background: rgba(255,255,255,0.06); color: #94a3b8; width: 32px; height: 32px; border-radius: 8px; font-size: 16px; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; }
                .edit-modal-close:hover { background: rgba(255,255,255,0.12); color: #e2e8f0; }
                .edit-modal-body { padding: 20px 28px; display: flex; flex-direction: column; gap: 16px; }
                .edit-field { display: flex; flex-direction: column; gap: 6px; }
                .edit-label { font-size: 12px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; }
                .edit-input { padding: 12px 16px; border-radius: 12px; background: rgba(30,41,59,0.8); border: 1px solid rgba(255,255,255,0.1); color: #e2e8f0; font-size: 15px; font-weight: 500; outline: none; transition: border-color 0.2s; }
                .edit-input:focus { border-color: rgba(59,130,246,0.5); }
                .edit-input--price { border-left: 3px solid #f59e0b; }
                .edit-input--price-sell { border-left: 3px solid #22c55e; }
                .edit-input--stock { border-left: 3px solid #3b82f6; max-width: 180px; }
                .edit-textarea { padding: 12px 16px; border-radius: 12px; background: rgba(30,41,59,0.8); border: 1px solid rgba(255,255,255,0.1); color: #e2e8f0; font-size: 14px; outline: none; resize: vertical; font-family: inherit; transition: border-color 0.2s; }
                .edit-textarea:focus { border-color: rgba(59,130,246,0.5); }
                .edit-select { padding: 12px 16px; border-radius: 12px; background: rgba(30,41,59,0.8); border: 1px solid rgba(255,255,255,0.1); color: #e2e8f0; font-size: 14px; outline: none; cursor: pointer; }
                .edit-hint { font-size: 11px; color: #64748b; margin-top: 2px; }
                .edit-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
                .edit-category-badge { padding: 10px 14px; border-radius: 10px; background: rgba(139,92,246,0.1); border: 1px solid rgba(139,92,246,0.2); color: #a78bfa; font-size: 13px; font-weight: 600; }
                .edit-toggle-row { display: flex; }
                .edit-toggle { flex: 1; padding: 10px 16px; border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; background: rgba(255,255,255,0.03); color: #94a3b8; font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.2s; }
                .edit-toggle--on { background: rgba(34,197,94,0.1); border-color: rgba(34,197,94,0.3); color: #22c55e; }
                .edit-img-preview { width: 80px; height: 80px; object-fit: cover; border-radius: 10px; margin-top: 8px; border: 1px solid rgba(255,255,255,0.08); }
                .edit-timestamps { display: flex; gap: 20px; font-size: 11px; color: #475569; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.04); }
                .edit-modal-footer { display: flex; gap: 10px; justify-content: flex-end; padding: 0 28px 24px; }

                /* ═══ MODAL ═══ */
                .modal-overlay { position: fixed; inset: 0; z-index: 100; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; animation: fadeIn 0.2s; }
                .modal-card { width: 90%; max-width: 440px; padding: 28px; border-radius: 20px; background: rgba(15,23,42,0.95); backdrop-filter: blur(24px); border: 1px solid rgba(255,255,255,0.08); box-shadow: 0 16px 64px rgba(0,0,0,0.4); }
                .modal-title { font-size: 18px; font-weight: 700; color: #f1f5f9; margin: 0 0 12px; }
                .modal-body { font-size: 14px; color: #94a3b8; margin: 0 0 16px; }
                .modal-route { display: flex; align-items: center; gap: 12px; padding: 14px; border-radius: 12px; background: rgba(59,130,246,0.08); border: 1px solid rgba(59,130,246,0.15); margin-bottom: 16px; }
                .modal-route-macro { font-size: 14px; font-weight: 700; color: #a78bfa; }
                .modal-route-arrow { font-size: 16px; color: #64748b; }
                .modal-route-sub { font-size: 14px; font-weight: 700; color: #60a5fa; }
                .modal-preview { max-height: 120px; overflow-y: auto; margin-bottom: 20px; }
                .modal-preview-item { font-size: 12px; color: #94a3b8; padding: 3px 0; }
                .modal-preview-more { color: #64748b; font-style: italic; }
                .modal-actions { display: flex; gap: 10px; justify-content: flex-end; }
                .modal-btn { padding: 10px 20px; border: none; border-radius: 10px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
                .modal-btn--cancel { background: rgba(255,255,255,0.06); color: #94a3b8; }
                .modal-btn--cancel:hover { background: rgba(255,255,255,0.1); }
                .modal-btn--confirm { background: linear-gradient(135deg,#3b82f6,#1d4ed8); color: white; box-shadow: 0 4px 16px rgba(59,130,246,0.25); }
                .modal-btn--confirm:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(59,130,246,0.35); }

                /* ═══ UNDO/REDO ═══ */
                .tree-toolbar-right { display: flex; gap: 6px; align-items: center; flex-wrap: wrap; }
                .undo-btn { padding: 7px 14px; border: none; border-radius: 8px; background: rgba(100,116,139,0.2); color: #64748b; font-size: 12px; font-weight: 600; cursor: not-allowed; transition: all 0.2s; display: flex; align-items: center; gap: 4px; }
                .undo-btn--active { background: rgba(59,130,246,0.12); color: #60a5fa; cursor: pointer; }
                .undo-btn--active:hover { background: rgba(59,130,246,0.2); }
                .undo-badge { display: inline-flex; align-items: center; justify-content: center; width: 18px; height: 18px; border-radius: 50%; background: rgba(59,130,246,0.3); font-size: 10px; font-weight: 700; }

                /* ═══ BACKUPS ═══ */
                .backup-list { display: flex; flex-direction: column; gap: 8px; }
                .backup-card { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 16px 18px; border-radius: 14px; background: rgba(15,23,42,0.5); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.06); transition: border-color 0.2s; }
                .backup-card:hover { border-color: rgba(255,255,255,0.12); }
                .backup-info { display: flex; flex-direction: column; gap: 4px; flex: 1; min-width: 0; }
                .backup-label { font-size: 14px; font-weight: 600; color: #e2e8f0; }
                .backup-meta { font-size: 12px; color: #64748b; }
                .backup-restore-btn { padding: 8px 16px; border: 1px solid rgba(245,158,11,0.3); border-radius: 8px; background: rgba(245,158,11,0.1); color: #fbbf24; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s; flex-shrink: 0; white-space: nowrap; }
                .backup-restore-btn:hover { background: rgba(245,158,11,0.2); border-color: rgba(245,158,11,0.5); }

                /* ── REUSABLE ── */
                .admin-page-header { margin-bottom: 24px; }
                .admin-page-title { font-family: var(--font-outfit), sans-serif; font-weight: 700; font-size: 28px; color: #f1f5f9; margin: 0 0 4px; }
                .admin-page-subtitle { font-size: 14px; color: #64748b; margin: 0; }
                @media (max-width: 768px) {
                    .admin-page-title { font-size: 22px; }
                    .merch-tabs { flex-direction: column; }
                    .merch-action-bar { flex-direction: column; text-align: center; gap: 8px; }
                    .tree-search { width: 100%; }
                    .tree-toolbar-left { width: 100%; }
                    .tree-sub { margin-left: 12px; margin-right: 4px; }
                    .tree-products { padding-left: 12px; }
                    .tree-product-row { font-size: 11px; }
                    .tree-input--name { min-width: 100px; }
                    .modal-card { width: 95%; padding: 20px; }
                }
            `}</style>
        </div>
    );
}
