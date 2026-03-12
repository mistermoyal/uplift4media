import { getOrders } from "@/lib/actions/orders";
import { getClients } from "@/lib/actions/clients";
import { getServices } from "@/lib/actions/services";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Users,
    ShoppingCart,
    Wrench,
    TrendingUp,
    Clock,
    CheckCircle2,
    AlertCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { getOrderStatusMeta } from "@/lib/order-status";
import { getProfileDisplay, getProfileUrl } from "@/lib/profile-links";
import { convertToUsd, convertUsdToEur, getUsdRates } from "@/lib/fx";
import { Separator } from "@/components/ui/separator";
import type { CurrencyValue } from "@/lib/client-enums";

type DashboardOrder = {
    id: string;
    quoteAmount: number | string;
    internalCost: number | string;
    currency: CurrencyValue;
    paymentStatus: string;
    status: string;
    priority: string;
    platform: string;
    targetUsername: string | null;
    isNoted: boolean;
    notedType: string | null;
    banReason: string | null;
    createdAt: string | Date;
    client: { fullName: string };
    service: { name: string };
};

type DashboardClient = {
    createdAt: string | Date;
};

type DashboardService = {
    isActive: boolean;
    platform: string;
};

export default async function DashboardPage() {
    const orders = await getOrders() as unknown as DashboardOrder[];
    const clients = await getClients() as unknown as DashboardClient[];
    const services = await getServices() as unknown as DashboardService[];
    const usdRates = await getUsdRates();

    // Simple stats
    const totalClients = clients.length;
    const totalOrders = orders.length;
    const activeServices = services.filter((s) => s.isActive).length;
    const grossRevenueUsd = orders.reduce(
        (acc, order) => acc + convertToUsd(Number(order.quoteAmount), order.currency, usdRates),
        0
    );
    const totalInvoicedUsd = orders
        .filter((order) => order.paymentStatus !== "UNPAID")
        .reduce((acc, order) => acc + convertToUsd(Number(order.quoteAmount), order.currency, usdRates), 0);
    const totalExpenseUsd = orders.reduce(
        (acc, order) => acc + convertToUsd(Number(order.internalCost), order.currency, usdRates),
        0
    );
    const grossRevenueEur = convertUsdToEur(grossRevenueUsd, usdRates);

    const pendingOrders = orders.filter((order) => order.status !== "COMPLETED" && order.status !== "FAILED" && order.status !== "CANCELLED").length;
    const completedOrders = orders.filter((order) => order.status === "COMPLETED").length;

    const recentOrders = orders.slice(0, 5);
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const newClientsThisWeek = clients.filter((client) => new Date(client.createdAt) >= oneWeekAgo).length;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white font-display">General Dashboard</h1>
                <p className="text-zinc-500">Welcome back. Here's what's happening today at UPLIFT4MEDIA.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-zinc-950 border-zinc-800 text-white shadow-lg group hover:border-zinc-700 transition-all">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-500 group-hover:text-zinc-400">Total Clients</CardTitle>
                        <Users className="h-4 w-4 text-zinc-600 group-hover:text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalClients}</div>
                        <p className="text-[10px] text-zinc-600 mt-1 flex items-center gap-1">
                            <TrendingUp className="h-2.5 w-2.5 text-emerald-500" /> {newClientsThisWeek} this week
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-zinc-950 border-zinc-800 text-white shadow-lg group hover:border-zinc-700 transition-all">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-500 group-hover:text-zinc-400">Total Orders</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-zinc-600 group-hover:text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalOrders}</div>
                        <p className="text-[10px] text-zinc-600 mt-1">
                            {completedOrders} completed tasks
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-zinc-950 border-zinc-800 text-white shadow-lg group hover:border-zinc-700 transition-all">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-500 group-hover:text-zinc-400">Active Services</CardTitle>
                        <Wrench className="h-4 w-4 text-zinc-600 group-hover:text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeServices}</div>
                        <p className="text-[10px] text-zinc-600 mt-1">
                            Across {new Set(services.map((service) => service.platform)).size} platforms
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-zinc-950 border-zinc-800 text-white shadow-lg group hover:border-zinc-700 transition-all overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                        <TrendingUp className="h-16 w-16 text-emerald-500" />
                    </div>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-emerald-500/80 group-hover:text-emerald-500">Gross Revenue (USD)</CardTitle>
                        <TrendingUp className="h-4 w-4 text-emerald-500/50 group-hover:text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(grossRevenueUsd)}
                        </div>
                        <p className="text-[10px] text-zinc-600 mt-1">
                            Converted from all order currencies
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-zinc-950 border-zinc-800 text-white shadow-lg">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Total Invoiced (USD)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl font-bold">
                            {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(totalInvoicedUsd)}
                        </div>
                        <p className="text-[10px] text-zinc-600 mt-1">Orders with payment status not unpaid</p>
                    </CardContent>
                </Card>
                <Card className="bg-zinc-950 border-zinc-800 text-white shadow-lg">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Expense (USD)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl font-bold">
                            {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(totalExpenseUsd)}
                        </div>
                        <p className="text-[10px] text-zinc-600 mt-1">Converted from internal costs</p>
                    </CardContent>
                </Card>
                <Card className="bg-zinc-950 border-zinc-800 text-white shadow-lg">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Gross Revenue (EUR)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl font-bold">
                            {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(grossRevenueEur)}
                        </div>
                        <p className="text-[10px] text-zinc-600 mt-1">USD base converted to EUR</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <Card className="bg-zinc-950 border-zinc-800 text-white shadow-xl overflow-hidden">
                        <CardHeader className="border-b border-zinc-800/50 bg-zinc-900/10">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg font-display tracking-tight">Recent Orders</CardTitle>
                                <Link href="/dashboard/orders" className="text-xs text-blue-500 hover:underline">View All</Link>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {recentOrders.length === 0 ? (
                                <div className="p-10 text-center text-zinc-500">No orders recently.</div>
                            ) : (
                                <div className="divide-y divide-zinc-900">
                                    {recentOrders.map((order) => (
                                        <div key={order.id} className="p-4 flex items-center justify-between hover:bg-zinc-900/40 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "h-8 w-8 rounded-lg flex items-center justify-center border border-zinc-800 bg-zinc-950",
                                                    order.status === "COMPLETED" ? "text-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.1)]" : "text-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.1)]"
                                                )}>
                                                    {order.status === "COMPLETED" ? <CheckCircle2 className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">{order.client.fullName}</p>
                                                    <p className="text-[10px] text-zinc-500">{order.service.name} • {order.platform}</p>
                                                    {order.targetUsername && (
                                                        <a
                                                            href={getProfileUrl(order.platform, order.targetUsername) || "#"}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="text-[10px] text-blue-400 hover:underline"
                                                        >
                                                            {getProfileDisplay(order.targetUsername)}
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <Badge
                                                    variant="outline"
                                                    className={cn("text-[10px] capitalize", getOrderStatusMeta(order.status).badgeClassName)}
                                                >
                                                    {getOrderStatusMeta(order.status).label}
                                                </Badge>
                                                {order.isNoted && order.notedType && (
                                                    <Badge variant="outline" className="text-[10px] mt-1 bg-amber-500/10 text-amber-300 border-amber-500/20">
                                                        Noted: {order.notedType}
                                                    </Badge>
                                                )}
                                                {order.banReason && (
                                                    <Badge variant="outline" className="text-[10px] mt-1 bg-orange-500/10 text-orange-300 border-orange-500/20">
                                                        Ban Reason
                                                    </Badge>
                                                )}
                                                <p className="text-[10px] text-zinc-500 mt-1">{format(new Date(order.createdAt), "MMM d")}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="bg-zinc-950 border-zinc-800 text-white shadow-xl">
                        <CardHeader>
                            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-500">System Analytics</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-xs">
                                    <div className="h-2 w-2 rounded-full bg-emerald-500" />
                                    <span>Pending Workflow</span>
                                </div>
                                <span className="text-xs text-zinc-400 font-mono tracking-tighter">{pendingOrders}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-xs">
                                    <div className="h-2 w-2 rounded-full bg-blue-500" />
                                    <span>Services Library</span>
                                </div>
                                <span className="text-xs text-zinc-400 font-mono tracking-tighter">{services.length}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-xs text-zinc-500">
                                    <AlertCircle className="h-3 w-3 text-red-500/50" />
                                    <span>Urgent Cases</span>
                                </div>
                                <span className="text-xs text-zinc-400 font-mono tracking-tighter">{orders.filter((order) => order.priority === "URGENT" || order.priority === "HIGH").length}</span>
                            </div>
                            <Separator className="bg-zinc-800" />
                            <div className="pt-2">
                                <p className="text-[10px] text-zinc-500 leading-relaxed italic">
                                    "Efficiency is doing things right; effectiveness is doing the right things."
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
