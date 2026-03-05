"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Search, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import type { DataTableColumn, PaginatedResponse } from "@/types/product";

// ═══════════════════════════════════════════
// DataTable<T> — Componente Genérico Premium
// TypeScript Titanium: cero "any"
// ═══════════════════════════════════════════

interface DataTableProps<T> {
    columns: DataTableColumn<T>[];
    fetchUrl: string;
    searchPlaceholder?: string;
    extraParams?: Record<string, string>;
    emptyMessage?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function DataTable<T extends Record<string, any>>({
    columns,
    fetchUrl,
    searchPlaceholder = "Buscar...",
    extraParams = {},
    emptyMessage = "No se encontraron resultados",
}: DataTableProps<T>) {
    const [data, setData] = useState<T[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

    const fetchData = useCallback(async (searchQuery: string, pageNum: number) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: String(pageNum),
                pageSize: "25",
                ...(searchQuery ? { search: searchQuery } : {}),
                ...extraParams,
            });

            const res = await fetch(`${fetchUrl}?${params}`);
            const json: PaginatedResponse<T> = await res.json();

            setData(json.data);
            setTotalPages(json.pagination.totalPages);
            setTotal(json.pagination.total);
        } catch (err) {
            console.error("DataTable fetch error:", err);
            setData([]);
        } finally {
            setLoading(false);
        }
    }, [fetchUrl, extraParams]);

    // Initial load + refetch on page change
    useEffect(() => {
        fetchData(search, page);
    }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

    // Debounced search
    const handleSearchChange = (value: string) => {
        setSearch(value);
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            setPage(1);
            fetchData(value, 1);
        }, 350);
    };

    return (
        <div className="dt-container">
            {/* ── Search Bar ── */}
            <div className="dt-toolbar">
                <div className="dt-search-wrap">
                    <Search size={16} className="dt-search-icon" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        placeholder={searchPlaceholder}
                        className="dt-search-input"
                    />
                </div>
                <span className="dt-total-badge">
                    {total.toLocaleString()} items
                </span>
            </div>

            {/* ── Table ── */}
            <div className="dt-scroll">
                <table className="dt-table">
                    <thead>
                        <tr>
                            {columns.map((col) => (
                                <th
                                    key={col.key}
                                    style={col.width ? { width: col.width } : undefined}
                                >
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            // Skeleton rows
                            Array.from({ length: 8 }).map((_, i) => (
                                <tr key={`skel-${i}`} className="dt-skeleton-row">
                                    {columns.map((col) => (
                                        <td key={col.key}>
                                            <div className="dt-skeleton" />
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : data.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length} className="dt-empty">
                                    {emptyMessage}
                                </td>
                            </tr>
                        ) : (
                            data.map((item) => (
                                <tr key={String(item.id)} className="dt-row">
                                    {columns.map((col) => (
                                        <td key={col.key}>
                                            {col.render
                                                ? col.render(item)
                                                : String(item[col.key as keyof T] ?? "—")}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* ── Pagination ── */}
            {totalPages > 1 && (
                <div className="dt-pagination">
                    <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page <= 1}
                        className="dt-page-btn"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <span className="dt-page-info">
                        {page} / {totalPages}
                    </span>
                    <button
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page >= totalPages}
                        className="dt-page-btn"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            )}

            {/* Loading overlay */}
            {loading && data.length > 0 && (
                <div className="dt-loading-overlay">
                    <Loader2 size={24} className="dt-spinner" />
                </div>
            )}

            <style>{`
                .dt-container {
                    position: relative;
                    background: rgba(15, 23, 42, 0.5);
                    backdrop-filter: blur(16px);
                    -webkit-backdrop-filter: blur(16px);
                    border: 1px solid rgba(255,255,255,0.06);
                    border-radius: 16px;
                    overflow: hidden;
                }

                /* Toolbar */
                .dt-toolbar {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 16px 20px;
                    border-bottom: 1px solid rgba(255,255,255,0.06);
                }
                .dt-search-wrap {
                    flex: 1;
                    position: relative;
                    max-width: 400px;
                }
                .dt-search-icon {
                    position: absolute;
                    left: 12px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #64748b;
                    pointer-events: none;
                }
                .dt-search-input {
                    width: 100%;
                    padding: 8px 12px 8px 36px;
                    border-radius: 10px;
                    border: 1px solid rgba(255,255,255,0.08);
                    background: rgba(255,255,255,0.04);
                    color: #e2e8f0;
                    font-size: 14px;
                    outline: none;
                    transition: border-color 0.2s;
                }
                .dt-search-input::placeholder { color: #475569; }
                .dt-search-input:focus {
                    border-color: rgba(96,165,250,0.4);
                    background: rgba(255,255,255,0.06);
                }
                .dt-total-badge {
                    font-size: 12px;
                    color: #64748b;
                    white-space: nowrap;
                    padding: 4px 10px;
                    border-radius: 20px;
                    background: rgba(255,255,255,0.04);
                }

                /* Table */
                .dt-scroll {
                    overflow-x: auto;
                }
                .dt-table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 13px;
                }
                .dt-table thead th {
                    padding: 10px 16px;
                    text-align: left;
                    font-size: 11px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    color: #64748b;
                    background: rgba(0,0,0,0.15);
                    white-space: nowrap;
                    border-bottom: 1px solid rgba(255,255,255,0.04);
                }
                .dt-row td {
                    padding: 10px 16px;
                    border-bottom: 1px solid rgba(255,255,255,0.03);
                    color: #cbd5e1;
                    vertical-align: middle;
                }
                .dt-row:hover td {
                    background: rgba(255,255,255,0.02);
                }
                .dt-row:last-child td {
                    border-bottom: none;
                }
                .dt-empty {
                    padding: 48px 16px;
                    text-align: center;
                    color: #475569;
                    font-size: 14px;
                }

                /* Skeleton */
                .dt-skeleton-row td {
                    padding: 10px 16px;
                    border-bottom: 1px solid rgba(255,255,255,0.03);
                }
                .dt-skeleton {
                    height: 16px;
                    border-radius: 6px;
                    background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%);
                    background-size: 200% 100%;
                    animation: dt-shimmer 1.5s infinite;
                }
                @keyframes dt-shimmer {
                    0% { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }

                /* Pagination */
                .dt-pagination {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                    padding: 12px 20px;
                    border-top: 1px solid rgba(255,255,255,0.06);
                }
                .dt-page-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    border: 1px solid rgba(255,255,255,0.08);
                    background: rgba(255,255,255,0.04);
                    color: #94a3b8;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .dt-page-btn:hover:not(:disabled) {
                    background: rgba(255,255,255,0.08);
                    color: #e2e8f0;
                }
                .dt-page-btn:disabled {
                    opacity: 0.3;
                    cursor: not-allowed;
                }
                .dt-page-info {
                    font-size: 13px;
                    color: #64748b;
                    font-variant-numeric: tabular-nums;
                }

                /* Loading overlay */
                .dt-loading-overlay {
                    position: absolute;
                    inset: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: rgba(10, 15, 30, 0.5);
                    backdrop-filter: blur(2px);
                    z-index: 10;
                }
                .dt-spinner {
                    color: #60a5fa;
                    animation: dt-spin 1s linear infinite;
                }
                @keyframes dt-spin {
                    to { transform: rotate(360deg); }
                }

                @media (max-width: 768px) {
                    .dt-toolbar {
                        flex-direction: column;
                        align-items: stretch;
                    }
                    .dt-search-wrap { max-width: none; }
                    .dt-total-badge { text-align: center; }
                }
            `}</style>
        </div>
    );
}
