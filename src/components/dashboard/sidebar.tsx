"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    ShoppingCart,
    Users,
    Wrench,
    BarChart3,
    Settings,
    LogOut,
    ChevronRight,
    Menu,
    X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { signOut } from "next-auth/react";

const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Orders", href: "/dashboard/orders", icon: ShoppingCart },
    { name: "Clients", href: "/dashboard/clients", icon: Users },
    { name: "Services", href: "/dashboard/services", icon: Wrench },
    { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <Button
                variant="ghost"
                size="icon"
                className="fixed top-4 left-4 z-50 md:hidden text-white"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <X /> : <Menu />}
            </Button>

            <div
                className={cn(
                    "fixed inset-y-0 left-0 z-40 w-64 bg-[#09090b] border-r border-zinc-800 transition-transform duration-300 md:translate-x-0",
                    isOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="flex flex-col h-full py-6 px-4">
                    <div className="mb-10 px-2">
                        <h2 className="text-xl font-bold tracking-tighter text-white">
                            UPLIFT<span className="text-blue-500">4</span>MEDIA
                        </h2>
                    </div>

                    <nav className="flex-1 space-y-1">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors group",
                                        isActive
                                            ? "bg-white text-black"
                                            : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                                    )}
                                    onClick={() => setIsOpen(false)}
                                >
                                    <item.icon className="h-4 w-4" />
                                    {item.name}
                                    {isActive && <ChevronRight className="ml-auto h-3 w-3" />}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="pt-4 mt-4 border-t border-zinc-800">
                        <Button
                            variant="ghost"
                            className="w-full justify-start gap-3 text-zinc-400 hover:text-red-400 hover:bg-red-950/20 px-3"
                            onClick={() => signOut({ callbackUrl: "/login" })}
                        >
                            <LogOut className="h-4 w-4" />
                            Logout
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}
