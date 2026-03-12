"use client";

import { useState } from "react";
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
import type { Service } from "@prisma/client";
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ServiceForm } from "@/components/services/service-form";
import { deleteService } from "@/lib/actions/services";
import { toast } from "sonner";
import type { PlatformValue } from "@/lib/client-enums";

interface ServiceTableProps {
    services: Service[];
}

export function ServiceTable({ services }: ServiceTableProps) {
    const router = useRouter();
    const [editingService, setEditingService] = useState<Service | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const platformColors: Record<PlatformValue, string> = {
        INSTAGRAM: "bg-pink-500/10 text-pink-500 border-pink-500/20",
        TIKTOK: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
        FACEBOOK: "bg-blue-500/10 text-blue-500 border-blue-500/20",
        OTHER: "bg-zinc-500/10 text-zinc-500 border-zinc-500/20",
    };

    const handleDelete = async (service: Service) => {
        const confirmed = window.confirm(`Delete service "${service.name}"?`);
        if (!confirmed) return;

        setDeletingId(service.id);
        try {
            await deleteService(service.id);
            toast.success("Service deleted");
            router.refresh();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to delete service");
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <>
            <Table>
                <TableHeader className="border-b border-zinc-800">
                    <TableRow className="hover:bg-transparent">
                        <TableHead className="text-zinc-400">Name</TableHead>
                        <TableHead className="text-zinc-400">Platform</TableHead>
                        <TableHead className="text-zinc-400">Status</TableHead>
                        <TableHead className="text-zinc-400">Requirements</TableHead>
                        <TableHead className="text-zinc-400 text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {services.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="h-24 text-center text-zinc-500">
                                No services found. Create your first service to get started.
                            </TableCell>
                        </TableRow>
                    ) : (
                        services.map((service) => (
                            <TableRow key={service.id} className="border-zinc-800 hover:bg-zinc-900/40 transition-colors">
                                <TableCell className="font-medium">
                                    <div>
                                        <div className="text-white">{service.name}</div>
                                        <div className="text-xs text-zinc-500">{service.category || "No category"}</div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className={platformColors[service.platform]}>
                                        {service.platform}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge className={service.isActive ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"}>
                                        {service.isActive ? "Active" : "Archived"}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-wrap gap-1">
                                        {service.requiresTargetUser && <Badge variant="secondary" className="text-[10px] bg-zinc-800">User</Badge>}
                                        {service.requiresEmail && <Badge variant="secondary" className="text-[10px] bg-zinc-800">Email</Badge>}
                                        {service.requiresPhone && <Badge variant="secondary" className="text-[10px] bg-zinc-800">Phone</Badge>}
                                    </div>
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
                                                    onClick={() => setEditingService(service)}
                                                >
                                                    <Edit className="mr-2 h-4 w-4" /> Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator className="bg-zinc-800" />
                                                <DropdownMenuItem
                                                    className="focus:bg-red-950/20 focus:text-red-400 text-red-400 cursor-pointer"
                                                    disabled={deletingId === service.id}
                                                    onClick={() => handleDelete(service)}
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" /> {deletingId === service.id ? "Deleting..." : "Delete"}
                                                </DropdownMenuItem>
                                            </DropdownMenuGroup>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>

            <Dialog open={!!editingService} onOpenChange={(open) => !open && setEditingService(null)}>
                <DialogContent className="sm:max-w-[700px] bg-zinc-950 border-zinc-800 text-white max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Service</DialogTitle>
                        <DialogDescription className="text-zinc-500">
                            Update service details and requirements.
                        </DialogDescription>
                    </DialogHeader>
                    {editingService && (
                        <ServiceForm
                            initialData={editingService}
                            onSuccess={() => {
                                setEditingService(null);
                                router.refresh();
                            }}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
