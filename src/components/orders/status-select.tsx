"use client";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { updateOrderStatus } from "@/lib/actions/orders";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getOrderStatusMeta } from "@/lib/order-status";
import type { OrderStatusValue } from "@/lib/client-enums";

interface StatusSelectProps {
    orderId: string;
    currentStatus: OrderStatusValue;
    userId: string;
}

const primaryStatusOptions = [
    "PAYMENT_PENDING",
    "READY_TO_START",
    "IN_PROGRESS",
    "COMPLETED",
    "ON_HOLD",
    "CANCELLED",
] as OrderStatusValue[];

export function StatusSelect({ orderId, currentStatus, userId }: StatusSelectProps) {
    const [loading, setLoading] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState<OrderStatusValue>(currentStatus);

    useEffect(() => {
        setSelectedStatus(currentStatus);
    }, [currentStatus]);

    const statusOptions = (primaryStatusOptions.includes(selectedStatus)
        ? primaryStatusOptions
        : [selectedStatus, ...primaryStatusOptions]
    ).filter((status): status is OrderStatusValue => Boolean(status));

    const onStatusChange = async (newStatus: OrderStatusValue, previousStatus: OrderStatusValue) => {
        setLoading(true);
        try {
            await updateOrderStatus(orderId, newStatus as Parameters<typeof updateOrderStatus>[1], userId);
            toast.success("Status updated");
        } catch {
            setSelectedStatus(previousStatus);
            toast.error("Failed to update status");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative">
            <Select
                value={selectedStatus}
                onValueChange={(v) => {
                    const nextStatus = v as OrderStatusValue;
                    const previousStatus = selectedStatus;
                    setSelectedStatus(nextStatus);
                    void onStatusChange(nextStatus, previousStatus);
                }}
                disabled={loading}
            >
                <SelectTrigger
                    className={cn(
                        "w-[180px] border text-white",
                        getOrderStatusMeta(selectedStatus).badgeClassName
                    )}
                >
                    <SelectValue>
                        {getOrderStatusMeta(selectedStatus).label}
                    </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-zinc-950 border-zinc-800 text-white">
                    {statusOptions.map((status) => (
                        <SelectItem key={status} value={status} label={getOrderStatusMeta(status).label}>
                            <span
                                className={cn(
                                    "inline-flex rounded-md border px-2 py-0.5 text-xs",
                                    getOrderStatusMeta(status).badgeClassName
                                )}
                            >
                                {getOrderStatusMeta(status).label}
                            </span>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/50 rounded-md">
                    <Loader2 className="h-4 w-4 animate-spin" />
                </div>
            )}
        </div>
    );
}
