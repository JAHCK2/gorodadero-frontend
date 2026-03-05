// ═══════════════════════════════════════════
// Admin Dashboard — Panel principal con resumen
// Usa Supabase JS (conexión directa, sin Prisma)
// ═══════════════════════════════════════════

import { createClient } from "@supabase/supabase-js";
import { formatCOP } from "@/lib/money";

export const dynamic = "force-dynamic";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface StatCard {
    label: string;
    value: string;
    icon: string;
    gradient: string;
}

export default async function AdminDashboardPage() {
    // Fetch all stats via Supabase JS
    const [productsRes, activeRes, categoriesRes] = await Promise.all([
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("products").select("id", { count: "exact", head: true }).eq("is_active", true),
        supabase.from("categories").select("id", { count: "exact", head: true }),
    ]);

    const totalProducts = productsRes.count || 0;
    const activeProducts = activeRes.count || 0;
    const totalCategories = categoriesRes.count || 0;

    // Inventory value — sum sell_price of active products
    const { data: priceData } = await supabase
        .from("products")
        .select("sell_price")
        .eq("is_active", true);

    const inventoryValue = (priceData || []).reduce(
        (sum, p) => sum + (Number(p.sell_price) || 0), 0
    );

    const stats: StatCard[] = [
        {
            label: "Total Productos",
            value: totalProducts.toLocaleString(),
            icon: "📦",
            gradient: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
        },
        {
            label: "Productos Activos",
            value: activeProducts.toLocaleString(),
            icon: "✅",
            gradient: "linear-gradient(135deg, #22c55e, #16a34a)",
        },
        {
            label: "Categorías",
            value: totalCategories.toLocaleString(),
            icon: "🗂️",
            gradient: "linear-gradient(135deg, #a855f7, #7c3aed)",
        },
        {
            label: "Valor Inventario",
            value: formatCOP(inventoryValue),
            icon: "💰",
            gradient: "linear-gradient(135deg, #f59e0b, #d97706)",
        },
    ];

    return (
        <div>
            <header className="admin-page-header">
                <h1 className="admin-page-title">Dashboard</h1>
                <p className="admin-page-subtitle">Resumen en tiempo real de GoRodadero</p>
            </header>

            {/* Stats Grid */}
            <div className="stats-grid">
                {stats.map((stat) => (
                    <div key={stat.label} className="stat-card">
                        <div className="stat-icon" style={{ background: stat.gradient }}>
                            {stat.icon}
                        </div>
                        <div className="stat-info">
                            <span className="stat-value">{stat.value}</span>
                            <span className="stat-label">{stat.label}</span>
                        </div>
                    </div>
                ))}
            </div>

            <style>{`
                .admin-page-header {
                    margin-bottom: 32px;
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

                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
                    gap: 16px;
                    margin-bottom: 32px;
                }
                .stat-card {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    padding: 20px;
                    border-radius: 16px;
                    background: rgba(15, 23, 42, 0.5);
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                    border: 1px solid rgba(255,255,255,0.06);
                    transition: transform 0.2s, border-color 0.2s;
                }
                .stat-card:hover {
                    transform: translateY(-2px);
                    border-color: rgba(255,255,255,0.12);
                }
                .stat-icon {
                    width: 48px;
                    height: 48px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 12px;
                    font-size: 22px;
                    flex-shrink: 0;
                }
                .stat-info {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }
                .stat-value {
                    font-family: var(--font-outfit), sans-serif;
                    font-weight: 700;
                    font-size: 22px;
                    color: #f1f5f9;
                    line-height: 1.2;
                }
                .stat-label {
                    font-size: 12px;
                    color: #64748b;
                    font-weight: 500;
                }

                @media (max-width: 768px) {
                    .admin-page-title { font-size: 22px; }
                    .stats-grid { grid-template-columns: 1fr 1fr; gap: 10px; }
                    .stat-card { padding: 14px; }
                    .stat-icon { width: 40px; height: 40px; font-size: 18px; }
                    .stat-value { font-size: 18px; }
                }
            `}</style>
        </div>
    );
}
