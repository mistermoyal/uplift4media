"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { ServiceForm } from "./service-form";

export function CreateServiceButton() {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger
                render={
                    <Button className="bg-white text-black hover:bg-zinc-200">
                        <Plus className="mr-2 h-4 w-4" /> Add Service
                    </Button>
                }
            />
            <DialogContent className="sm:max-w-[600px] bg-zinc-950 border-zinc-800 text-white">
                <DialogHeader>
                    <DialogTitle>Create New Service</DialogTitle>
                    <DialogDescription className="text-zinc-500">
                        Add a new social media service to your CRM catalog.
                    </DialogDescription>
                </DialogHeader>
                <ServiceForm onSuccess={() => setOpen(false)} />
            </DialogContent>
        </Dialog>
    );
}
