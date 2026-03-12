import { Sidebar } from "@/components/dashboard/sidebar";
import { UserNav } from "@/components/dashboard/user-nav";

export const dynamic = "force-dynamic";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-[#09090b] text-white flex">
            <Sidebar />
            <main className="flex-1 md:pl-64 flex flex-col min-h-screen relative">
                <header className="h-16 border-b border-zinc-800 flex items-center justify-between px-6 sticky top-0 bg-[#09090b]/80 backdrop-blur-md z-30">
                    <div className="flex items-center gap-4">
                        {/* Breadcrumbs can go here */}
                    </div>
                    <div className="flex items-center gap-4">
                        <UserNav />
                    </div>
                </header>
                <div className="p-6 md:p-8 flex-1">
                    {children}
                </div>
            </main>
        </div>
    );
}
