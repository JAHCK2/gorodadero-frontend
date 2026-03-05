"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
    LayoutDashboard,
    Package,
    FolderTree,
    ShoppingCart,
} from "lucide-react";

const NAV_ITEMS = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/productos", label: "Productos", icon: Package },
    { href: "/admin/categorias", label: "Categorías", icon: FolderTree },
    { href: "/admin/pedidos", label: "Pedidos", icon: ShoppingCart },
] as const;

export function AdminSidebar() {
    const pathname = usePathname();

    const isActive = (href: string) => {
        if (href === "/admin") return pathname === "/admin";
        return pathname.startsWith(href);
    };

    return (
        <>
            {/* ── Desktop Sidebar ── */}
            <aside className="admin-sidebar">
                {/* Logo */}
                <div className="sidebar-logo">
                    <div className="sidebar-logo-badge">GO</div>
                    <span className="sidebar-logo-text">Admin</span>
                </div>

                {/* Nav */}
                <nav className="sidebar-nav">
                    {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
                        <Link
                            key={href}
                            href={href}
                            className={`sidebar-link ${isActive(href) ? "sidebar-link--active" : ""}`}
                        >
                            <Icon size={18} strokeWidth={isActive(href) ? 2.5 : 1.8} />
                            <span>{label}</span>
                        </Link>
                    ))}
                </nav>

                {/* Footer */}
                <div className="sidebar-footer">
                    <Link href="/" className="sidebar-link sidebar-link--back">
                        ← Tienda
                    </Link>
                </div>
            </aside>

            {/* ── Mobile Bottom Nav ── */}
            <nav className="admin-bottom-nav">
                {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
                    <Link
                        key={href}
                        href={href}
                        className={`bottom-nav-item ${isActive(href) ? "bottom-nav-item--active" : ""}`}
                    >
                        <Icon size={20} strokeWidth={isActive(href) ? 2.5 : 1.5} />
                        <span>{label}</span>
                    </Link>
                ))}
            </nav>

            <style>{`
                /* ── Desktop Sidebar ── */
                .admin-sidebar {
                    width: 240px;
                    min-height: 100vh;
                    min-height: 100dvh;
                    display: flex;
                    flex-direction: column;
                    padding: 20px 12px;
                    background: rgba(15, 23, 42, 0.7);
                    backdrop-filter: blur(24px);
                    -webkit-backdrop-filter: blur(24px);
                    border-right: 1px solid rgba(255,255,255,0.06);
                }

                .sidebar-logo {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 8px 12px 24px;
                }
                .sidebar-logo-badge {
                    width: 36px;
                    height: 36px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 10px;
                    background: linear-gradient(135deg, #06b6d4, #3b82f6);
                    color: white;
                    font-family: var(--font-outfit), sans-serif;
                    font-weight: 800;
                    font-size: 14px;
                    letter-spacing: -0.5px;
                }
                .sidebar-logo-text {
                    font-family: var(--font-outfit), sans-serif;
                    font-weight: 600;
                    font-size: 18px;
                    color: #94a3b8;
                }

                .sidebar-nav {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }

                .sidebar-link {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 10px 12px;
                    border-radius: 10px;
                    font-size: 14px;
                    font-weight: 500;
                    color: #94a3b8;
                    text-decoration: none;
                    transition: all 0.2s ease;
                }
                .sidebar-link:hover {
                    background: rgba(255,255,255,0.05);
                    color: #e2e8f0;
                }
                .sidebar-link--active {
                    background: rgba(59,130,246,0.12);
                    color: #60a5fa;
                    font-weight: 600;
                }

                .sidebar-footer {
                    padding-top: 16px;
                    border-top: 1px solid rgba(255,255,255,0.06);
                }
                .sidebar-link--back {
                    font-size: 13px;
                    color: #64748b;
                }
                .sidebar-link--back:hover {
                    color: #94a3b8;
                }

                /* ── Mobile Bottom Nav ── */
                .admin-bottom-nav {
                    display: none;
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    z-index: 50;
                    height: 64px;
                    padding: 0 8px;
                    background: rgba(10, 15, 30, 0.92);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border-top: 1px solid rgba(255,255,255,0.06);
                    align-items: center;
                    justify-content: space-around;
                }
                .bottom-nav-item {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 2px;
                    padding: 6px 12px;
                    border-radius: 8px;
                    font-size: 10px;
                    font-weight: 500;
                    color: #64748b;
                    text-decoration: none;
                    transition: color 0.2s;
                }
                .bottom-nav-item--active {
                    color: #60a5fa;
                }

                @media (max-width: 768px) {
                    .admin-sidebar { display: none; }
                    .admin-bottom-nav { display: flex; }
                }
            `}</style>
        </>
    );
}
