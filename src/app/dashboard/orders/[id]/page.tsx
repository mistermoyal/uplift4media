import { getOrderById } from "@/lib/actions/orders";
import { getClients } from "@/lib/actions/clients";
import { getServices } from "@/lib/actions/services";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Clock,
    User,
    MapPin,
    Phone,
    Mail,
    AtSign,
    History,
    FileText
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { NoteForm } from "@/components/orders/note-form";
import { StatusSelect } from "@/components/orders/status-select";
import { OrderActions } from "@/components/orders/order-actions";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getOrderStatusMeta } from "@/lib/order-status";
import { getProfileDisplay, getProfileUrl } from "@/lib/profile-links";
import { getPaymentMethodLabel } from "@/lib/payment-method";

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
    const resolvedParams = await params;
    const orderId = resolvedParams?.id;

    if (!orderId) {
        notFound();
    }

    const session = await getServerSession(authOptions);
    const order = await getOrderById(orderId);

    if (!order) {
        notFound();
    }

    const clients = await getClients();
    const services = await getServices();

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <h1 className="text-3xl font-bold tracking-tight text-white">
                            Case ORD-{order.orderNumber.toString().padStart(4, '0')}
                        </h1>
                        <Badge variant="outline" className="bg-zinc-900 border-zinc-800 text-zinc-400 capitalize">
                            {order.priority.toLowerCase()} Priority
                        </Badge>
                    </div>
                    <p className="text-zinc-500">
                        Created on {format(new Date(order.createdAt), "MMMM d, yyyy 'at' h:mm a")}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <OrderActions
                        order={JSON.parse(JSON.stringify(order))}
                        clients={JSON.parse(JSON.stringify(clients))}
                        services={JSON.parse(JSON.stringify(services))}
                    />
                    <StatusSelect orderId={order.id} currentStatus={order.status} userId={session?.user?.id || "system"} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card className="bg-zinc-950 border-zinc-800 text-white">
                        <CardHeader className="border-b border-zinc-800/50">
                            <CardTitle className="text-lg">Case Overview</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Service Details</h4>
                                        <div className="p-3 rounded-lg bg-zinc-900/50 border border-zinc-800">
                                            <p className="text-sm font-medium">{order.service.name}</p>
                                            <p className="text-xs text-zinc-500">{order.platform} Platform</p>
                                            <div className="mt-2 flex items-center gap-2 text-xs text-zinc-400">
                                                <Clock className="h-3 w-3" /> Est: {order.estimatedDelivery || "Varies"}
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Case Targets</h4>
                                        <div className="space-y-2">
                                            {order.targetUsername && (
                                                <div className="flex items-center gap-2 text-sm">
                                                    <AtSign className="h-4 w-4 text-zinc-500" />
                                                    <a
                                                        href={getProfileUrl(order.platform, order.targetUsername) || "#"}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="text-blue-400 hover:underline"
                                                    >
                                                        {getProfileDisplay(order.targetUsername)}
                                                    </a>
                                                </div>
                                            )}
                                            {order.targetEmail && (
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Mail className="h-4 w-4 text-zinc-500" />
                                                    <span>{order.targetEmail}</span>
                                                </div>
                                            )}
                                            {order.banReason && (
                                                <div className="text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded px-2 py-1 w-fit">
                                                    Ban Reason: {order.banReason}
                                                </div>
                                            )}
                                            {order.isNoted && order.notedType && (
                                                <div className="flex items-center gap-2 text-xs">
                                                    <span className="rounded border border-amber-500/20 bg-amber-500/10 px-2 py-1 text-amber-300">
                                                        Noted: {order.notedType}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Client Information</h4>
                                        <div className="p-3 rounded-lg bg-zinc-900/50 border border-zinc-800">
                                            <p className="text-sm font-medium">{order.client.fullName}</p>
                                            <div className="space-y-1.5 mt-2">
                                                {order.client.email && (
                                                    <div className="flex items-center gap-2 text-xs text-zinc-400">
                                                        <Mail className="h-3 w-3" /> {order.client.email}
                                                    </div>
                                                )}
                                                {order.client.phone && (
                                                    <div className="flex items-center gap-2 text-xs text-zinc-400">
                                                        <Phone className="h-3 w-3" /> {order.client.phone}
                                                    </div>
                                                )}
                                                {order.client.country && (
                                                    <div className="flex items-center gap-2 text-xs text-zinc-400">
                                                        <MapPin className="h-3 w-3" /> {order.client.country}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Financials</h4>
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-end gap-1">
                                                <span className="text-2xl font-bold font-geist">{new Intl.NumberFormat('en-US', { style: 'currency', currency: order.currency }).format(Number(order.quoteAmount))}</span>
                                                <span className="text-xs text-zinc-500 mb-1">Total Quote</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-zinc-400 bg-zinc-900/50 w-fit px-2 py-1 rounded border border-zinc-800">
                                                Payment via: <span className="font-semibold text-white">{getPaymentMethodLabel(order.paymentMethod)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {order.intakeNotes && (
                                <div className="mt-8">
                                    <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Intake Notes</h4>
                                    <div className="p-4 rounded-lg bg-zinc-900/30 border border-zinc-800/50 text-sm italic text-zinc-400">
                                        "{order.intakeNotes}"
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Tabs defaultValue="timeline" className="w-full">
                        <TabsList className="bg-zinc-900 border-zinc-800 p-0 h-10">
                            <TabsTrigger value="timeline" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white gap-2 px-4">
                                <History className="h-3.5 w-3.5" /> Activity Log
                            </TabsTrigger>
                            <TabsTrigger value="notes" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white gap-2 px-4">
                                <FileText className="h-3.5 w-3.5" /> Internal Notes
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value="timeline" className="pt-4 mt-0">
                            <div className="space-y-4">
                                {order.activities.length === 0 ? (
                                    <div className="text-center py-10 text-zinc-500 border border-dashed border-zinc-800 rounded-xl">
                                        No activity logged yet.
                                    </div>
                                ) : (
                                    order.activities.map((activity: any, idx: number) => (
                                        <div key={activity.id} className="relative pl-6 pb-6 last:pb-0">
                                            {idx !== order.activities.length - 1 && (
                                                <div className="absolute left-2 top-3 bottom-0 w-0.5 bg-zinc-800" />
                                            )}
                                            <div className="absolute left-0 top-1.5 h-4 w-4 rounded-full border-2 border-zinc-800 bg-zinc-950 flex items-center justify-center">
                                                <div className="h-1.5 w-1.5 rounded-full bg-zinc-500" />
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-sm font-medium text-white">{activity.description}</p>
                                                    <span className="text-xs text-zinc-500">{format(new Date(activity.createdAt), "MMM d, h:mm a")}</span>
                                                </div>
                                                <p className="text-xs text-zinc-500 flex items-center gap-1">
                                                    <User className="h-2.5 w-2.5" /> {activity.user?.name || "System"}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </TabsContent>
                        <TabsContent value="notes" className="pt-4 mt-0">
                            <div className="space-y-6">
                                <NoteForm orderId={order.id} authorId={session?.user?.id || "system"} />
                                <Separator className="bg-zinc-800" />
                                <div className="space-y-4">
                                    {order.notes.length === 0 ? (
                                        <p className="text-center py-6 text-zinc-500 text-sm italic">No internal notes yet.</p>
                                    ) : (
                                        order.notes.map((note: any) => (
                                            <div key={note.id} className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800 flex flex-col gap-2 shadow-sm">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-semibold text-white">Administrator</span>
                                                    <span className="text-[10px] text-zinc-500">{format(new Date(note.createdAt), "MMM d, yyyy 'at' h:mm a")}</span>
                                                </div>
                                                <p className="text-sm text-zinc-400 whitespace-pre-wrap">{note.content}</p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>

                <div className="space-y-6">
                    <Card className="bg-zinc-950 border-zinc-800 text-white shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Quick Status</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 gap-2">
                                <div className="flex items-center gap-2 p-3 rounded-lg bg-zinc-900/50 border border-zinc-800">
                                    <div className={`h-2 w-2 rounded-full ${getOrderStatusMeta(order.status).dotClassName}`} />
                                    <span
                                        className={`text-xs px-2 py-1 rounded-md border ${getOrderStatusMeta(order.status).badgeClassName}`}
                                    >
                                        {getOrderStatusMeta(order.status).label}
                                    </span>
                                </div>
                            </div>
                            <p className="text-[10px] text-zinc-500 text-center italic">
                                Use the dropdown in the header to update status.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
