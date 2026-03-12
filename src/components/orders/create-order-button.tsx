"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { OrderForm } from "./order-form";

interface CreateOrderButtonProps {
    clients: any[];
    services: any[];
}

export function CreateOrderButton({ clients, services }: CreateOrderButtonProps) {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger
                render={
                    <Button className="bg-white text-black hover:bg-zinc-200">
                        <PlusCircle className="mr-2 h-4 w-4" /> Create Order
                    </Button>
                }
            />
            <DialogContent className="sm:max-w-[700px] bg-zinc-950 border-zinc-800 text-white max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>New Service Order</DialogTitle>
                    <DialogDescription className="text-zinc-500">
                        Link a client to a service and enter case details.
                    </DialogDescription>
                </DialogHeader>
                <OrderForm
                    onSuccess={() => setOpen(false)}
                    clients={clients}
                    services={services}
                />
            </DialogContent>
        </Dialog>
    );
}
