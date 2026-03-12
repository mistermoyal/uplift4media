"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { ClientForm } from "./client-form";

export function CreateClientButton() {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger
                render={
                    <Button className="bg-white text-black hover:bg-zinc-200">
                        <UserPlus className="mr-2 h-4 w-4" /> Add Client
                    </Button>
                }
            />
            <DialogContent className="sm:max-w-[600px] bg-zinc-950 border-zinc-800 text-white">
                <DialogHeader>
                    <DialogTitle>Add New Client</DialogTitle>
                    <DialogDescription className="text-zinc-500">
                        Create a new client record in your CRM.
                    </DialogDescription>
                </DialogHeader>
                <ClientForm onSuccess={() => setOpen(false)} />
            </DialogContent>
        </Dialog>
    );
}
