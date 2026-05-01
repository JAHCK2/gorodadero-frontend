export const metadata = {
    title: "Admin | GoRodadero",
    description: "Panel de control administrativo",
    icons: {
        icon: "/favicon.ico",
    }
};

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-[#0d0d0d] text-white">
            {children}
        </div>
    );
}
