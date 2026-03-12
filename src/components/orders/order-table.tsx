"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
    MoreHorizontal,
    Eye,
    Clock,
    AlertCircle,
    CheckCircle2,
    XCircle,
    type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { format } from "date-fns";
import { OrderStatus } from "@prisma/client";
import { cn } from "@/lib/utils";
import { deleteOrder } from "@/lib/actions/orders";
import { toast } from "sonner";
import { getProfileDisplay, getProfileUrl } from "@/lib/profile-links";
import { getPaymentMethodLabel } from "@/lib/payment-method";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface OrderTableProps {
    orders: OrderTableRow[];
}

interface OrderTableRow {
    id: string;
    orderNumber: number;
    status: OrderStatus;
    priority: string;
    quoteAmount: number | string;
    currency: string;
    paymentMethod: string;
    createdAt: string | Date;
    platform: string;
    isNoted: boolean;
    notedType: string | null;
    banReason: string | null;
    targetUsername: string | null;
    client: { fullName: string };
    service: { name: string };
}

const statusMap: Record<OrderStatus, { label: string; className: string; icon: LucideIcon }> = {
    NEW_REQUEST: { label: "New", className: "bg-blue-500/10 text-blue-500 border-blue-500/20", icon: AlertCircle },
    QUALIFYING: { label: "Qualifying", className: "bg-purple-500/10 text-purple-500 border-purple-500/20", icon: Clock },
    WAITING_QUOTE_APPROVAL: { label: "Pending Approval", className: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20", icon: Clock },
    QUOTE_ACCEPTED: { label: "Quote Accepted", className: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", icon: CheckCircle2 },
    PAYMENT_PENDING: { label: "Payment Sent", className: "bg-orange-500/10 text-orange-500 border-orange-500/20", icon: Clock },
    PAYMENT_SENT_WAITING_RECEIPT: { label: "Payment Sent", className: "bg-amber-500/10 text-amber-400 border-amber-500/20", icon: Clock },
    READY_TO_START: { label: "Ready", className: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20", icon: CheckCircle2 },
    IN_PROGRESS: { label: "In Progress", className: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20", icon: Clock },
    WAITING_PROVIDER: { label: "With Provider", className: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20", icon: Clock },
    WAITING_CLIENT: { label: "With Client", className: "bg-rose-500/10 text-rose-400 border-rose-500/20", icon: Clock },
    ON_HOLD: { label: "On Hold", className: "bg-zinc-800 text-zinc-400 border-zinc-700", icon: Clock },
    COMPLETED: { label: "Completed", className: "bg-emerald-500 text-white border-transparent", icon: CheckCircle2 },
    FAILED: { label: "Failed", className: "bg-red-500 text-white border-transparent", icon: AlertCircle },
    CANCELLED: { label: "Cancelled", className: "bg-zinc-900 text-zinc-500 border-zinc-800", icon: XCircle },
};

export function OrderTable({ orders }: OrderTableProps) {
    const router = useRouter();
    const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null);
    const [notedFilter, setNotedFilter] = useState<"all" | "yes" | "no">("all");
    const [banReasonFilter, setBanReasonFilter] = useState<string>("all");

    const banReasons = useMemo(
        () => Array.from(new Set(orders.map((order) => order.banReason).filter((reason): reason is string => Boolean(reason)))),
        [orders]
    );

    const filteredOrders = useMemo(() => {
        return orders.filter((order) => {
            if (notedFilter === "yes" && !order.isNoted) return false;
            if (notedFilter === "no" && order.isNoted) return false;
            if (banReasonFilter !== "all" && order.banReason !== banReasonFilter) return false;
            return true;
        });
    }, [orders, notedFilter, banReasonFilter]);

    const handleDeleteOrder = async (orderId: string, orderNumber: number) => {
        const confirmed = window.confirm(`Delete order ORD-${orderNumber.toString().padStart(4, "0")}? This cannot be undone.`);
        if (!confirmed) return;

        setDeletingOrderId(orderId);
        try {
            await deleteOrder(orderId);
            toast.success("Order deleted");
            router.refresh();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to delete order");
        } finally {
            setDeletingOrderId(null);
        }
    };

    return (
        <div className="space-y-4 p-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="w-full sm:w-[200px] space-y-1">
                    <p className="text-xs font-medium text-zinc-400">Noted</p>
                    <Select value={notedFilter} onValueChange={(value) => setNotedFilter(value as "all" | "yes" | "no")}>
                        <SelectTrigger className="bg-zinc-900 border-zinc-800 text-white">
                            <SelectValue placeholder="Noted" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-950 border-zinc-800 text-white">
                            <SelectItem value="all">All orders</SelectItem>
                            <SelectItem value="yes">Noted only</SelectItem>
                            <SelectItem value="no">Not noted</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="w-full sm:w-[320px] space-y-1">
                    <p className="text-xs font-medium text-zinc-400">Ban reason</p>
                    <Select value={banReasonFilter} onValueChange={setBanReasonFilter}>
                        <SelectTrigger className="bg-zinc-900 border-zinc-800 text-white">
                            <SelectValue placeholder="Ban reason" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-950 border-zinc-800 text-white">
                            <SelectItem value="all">All ban reasons</SelectItem>
                            {banReasons.map((reason) => (
                                <SelectItem key={reason} value={reason}>
                                    {reason}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <Table>
            <TableHeader className="border-b border-zinc-800">
                <TableRow className="hover:bg-transparent">
                    <TableHead className="text-zinc-400 w-[100px]">Order #</TableHead>
                    <TableHead className="text-zinc-400">Client / Service</TableHead>
                    <TableHead className="text-zinc-400">Status</TableHead>
                    <TableHead className="text-zinc-400">Priority</TableHead>
                    <TableHead className="text-zinc-400">Amount</TableHead>
                    <TableHead className="text-zinc-400">Created</TableHead>
                    <TableHead className="text-zinc-400 text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {filteredOrders.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center text-zinc-500">
                            No orders found for the selected filters.
                        </TableCell>
                    </TableRow>
                ) : (
                    filteredOrders.map((order) => {
                        const status = statusMap[order.status as OrderStatus] || statusMap.NEW_REQUEST;
                        const StatusIcon = status.icon;

                        return (
                            <TableRow key={order.id} className="border-zinc-800 hover:bg-zinc-900/40 transition-colors">
                                <TableCell className="font-mono text-xs text-zinc-500">
                                    ORD-{order.orderNumber.toString().padStart(4, '0')}
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium text-white">{order.client.fullName}</span>
                                        <span className="text-xs text-zinc-500">{order.service.name} ({order.platform})</span>
                                        {order.targetUsername && (
                                            <a
                                                href={getProfileUrl(order.platform, order.targetUsername) || "#"}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-xs text-blue-400 hover:underline w-fit"
                                            >
                                                {getProfileDisplay(order.targetUsername)}
                                            </a>
                                        )}
                                        {order.isNoted && order.notedType && (
                                            <span className="text-[10px] text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded px-2 py-0.5 mt-1 w-fit">
                                                Noted: {order.notedType}
                                            </span>
                                        )}
                                        {order.banReason && (
                                            <span className="text-[10px] text-orange-300 bg-orange-500/10 border border-orange-500/20 rounded px-2 py-0.5 mt-1 w-fit">
                                                Ban Reason: {order.banReason}
                                            </span>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className={cn("text-[10px] font-semibold gap-1 px-2 py-0.5", status.className)}>
                                        <StatusIcon className="h-2.5 w-2.5" />
                                        {status.label}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-1.5">
                                        <div className={cn(
                                            "h-2 w-2 rounded-full",
                                            order.priority === "URGENT" ? "bg-red-500 animate-pulse" :
                                                order.priority === "HIGH" ? "bg-orange-500" :
                                                    order.priority === "NORMAL" ? "bg-blue-500" : "bg-zinc-600"
                                        )} />
                                        <span className="text-xs text-zinc-400 capitalize">{order.priority.toLowerCase()}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium text-white">
                                            {new Intl.NumberFormat('en-US', {
                                                style: 'currency',
                                                currency: order.currency
                                            }).format(Number(order.quoteAmount))}
                                        </span>
                                        <span className="text-[10px] text-zinc-500 tracking-tight italic">
                                            via {getPaymentMethodLabel(order.paymentMethod)}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-xs text-zinc-500">
                                    {format(new Date(order.createdAt), "MMM d, yyyy")}
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger
                                            render={
                                                <Button variant="ghost" className="h-8 w-8 p-0 text-zinc-400 hover:text-white hover:bg-zinc-800">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            }
                                        />
                                        <DropdownMenuContent align="end" className="bg-zinc-950 border-zinc-800 text-white">
                                            <DropdownMenuGroup>
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem
                                                    className="focus:bg-zinc-900 focus:text-white cursor-pointer"
                                                    render={
                                                        <Link href={`/dashboard/orders/${order.id}`}>
                                                            <Eye className="mr-2 h-4 w-4" /> View Details
                                                        </Link>
                                                    }
                                                />
                                                <DropdownMenuSeparator className="bg-zinc-800" />
                                                <DropdownMenuItem
                                                    className="focus:bg-zinc-900 focus:text-white cursor-pointer"
                                                    render={<Link href={`/dashboard/orders/${order.id}`}>Edit Order</Link>}
                                                />
                                                <DropdownMenuItem
                                                    className="focus:bg-red-950/20 focus:text-red-400 text-red-400 cursor-pointer"
                                                    disabled={deletingOrderId === order.id}
                                                    onClick={() => handleDeleteOrder(order.id, Number(order.orderNumber))}
                                                >
                                                    {deletingOrderId === order.id ? "Deleting..." : "Delete Order"}
                                                </DropdownMenuItem>
                                            </DropdownMenuGroup>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        );
                    })
                )}
            </TableBody>
            </Table>
        </div>
    );
}
