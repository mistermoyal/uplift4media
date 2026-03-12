"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { OrderForm } from "@/components/orders/order-form";
import { deleteOrder } from "@/lib/actions/orders";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";

interface OrderActionsProps {
    order: any;
    clients: any[];
    services: any[];
}

export function OrderActions({ order, clients, services }: OrderActionsProps) {
    const router = useRouter();
    const [editOpen, setEditOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const handleDelete = async () => {
        const confirmed = window.confirm(`Delete order ORD-${order.orderNumber.toString().padStart(4, "0")}? This cannot be undone.`);
        if (!confirmed) return;

        setDeleting(true);
        try {
            await deleteOrder(order.id);
            toast.success("Order deleted");
            router.push("/dashboard/orders");
            router.refresh();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to delete order");
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="flex items-center gap-2">
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogTrigger
                    render={
                        <Button variant="outline" className="border-zinc-800 bg-zinc-900 text-white hover:bg-zinc-800 gap-2">
                            <Pencil className="h-4 w-4" /> Edit Order
                        </Button>
                    }
                />
                <DialogContent className="sm:max-w-[700px] bg-zinc-950 border-zinc-800 text-white max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Order</DialogTitle>
                        <DialogDescription className="text-zinc-500">
                            Update order details and order number.
                        </DialogDescription>
                    </DialogHeader>
                    <OrderForm
                        mode="edit"
                        orderId={order.id}
                        initialValues={{
                            orderNumber: Number(order.orderNumber),
                            clientId: order.clientId,
                            serviceId: order.serviceId,
                            platform: order.platform,
                            targetUsername: order.targetUsername ?? "",
                            targetEmail: order.targetEmail ?? "",
                            targetPhone: order.targetPhone ?? "",
                            profileUrl: order.profileUrl ?? "",
                            quoteAmount: Number(order.quoteAmount),
                            internalCost: Number(order.internalCost),
                            currency: order.currency,
                            paymentMethod: order.paymentMethod,
                            priority: order.priority,
                            source: order.source ?? "",
                            intakeNotes: order.intakeNotes ?? "",
                            estimatedDelivery: order.estimatedDelivery ?? "",
                            banReason: order.banReason ?? "",
                            isNoted: !!order.isNoted,
                            notedType: order.notedType ?? "",
                        }}
                        clients={clients}
                        services={services}
                        onSuccess={() => {
                            setEditOpen(false);
                            router.refresh();
                        }}
                    />
                </DialogContent>
            </Dialog>

            <Button
                type="button"
                variant="destructive"
                className="gap-2"
                onClick={handleDelete}
                disabled={deleting}
            >
                <Trash2 className="h-4 w-4" />
                {deleting ? "Deleting..." : "Delete"}
            </Button>
        </div>
    );
}
