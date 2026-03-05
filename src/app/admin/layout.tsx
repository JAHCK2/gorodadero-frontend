// ═══════════════════════════════════════════
// Admin Layout — Dark Glassmorphism Shell
// ═══════════════════════════════════════════

import type { Metadata } from "next";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export const metadata: Metadata = {
    title: "GoRodadero — Panel de Administración",
    robots: { index: false, follow: false },
};

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="admin-shell">
            <AdminSidebar />
            <main className="admin-content">
                {children}
            </main>

            <style>{`
                .admin-shell {
                    display: flex;
                    min-height: 100vh;
                    min-height: 100dvh;
                    background: #0a0f1e;
                    color: #e2e8f0;
                    font-family: var(--font-inter), system-ui, sans-serif;
                }
                .admin-content {
                    flex: 1;
                    padding: 24px 32px;
                    overflow-y: auto;
                    min-width: 0;
                }
                @media (max-width: 768px) {
                    .admin-shell {
                        flex-direction: column;
                    }
                    .admin-content {
                        padding: 16px;
                        padding-bottom: 80px;
                    }
                }
            `}</style>
        </div>
    );
}
