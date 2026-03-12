"use client";

import { useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Edit, Trash2, Mail, Phone, Globe } from "lucide-react";
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
import Link from "next/link";
import { ClientForm } from "./client-form";
import { deleteClient } from "@/lib/actions/clients";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface ClientTableProps {
    clients: any[];
}

export function ClientTable({ clients }: ClientTableProps) {
    const [editingClient, setEditingClient] = useState<any>(null);
    const [editOpen, setEditOpen] = useState(false);
    const router = useRouter();

    const handleEdit = (client: any) => {
        setEditingClient(client);
        setEditOpen(true);
    };

    const handleDelete = async (client: any) => {
        if (!confirm(`Are you sure you want to delete "${client.fullName}"? This action cannot be undone.`)) return;
        try {
            await deleteClient(client.id);
            toast.success(`Client "${client.fullName}" deleted`);
            router.refresh();
        } catch {
            toast.error("Failed to delete client");
        }
    };

    return (
        <>
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent className="bg-zinc-950 border-zinc-800 text-white sm:max-w-[550px]">
                    <DialogHeader>
                        <DialogTitle>Edit Client</DialogTitle>
                        <DialogDescription className="text-zinc-500">
                            Update the client record.
                        </DialogDescription>
                    </DialogHeader>
                    {editingClient && (
                        <ClientForm
                            initialData={editingClient}
                            onSuccess={() => {
                                setEditOpen(false);
                                setEditingClient(null);
                                router.refresh();
                            }}
                        />
                    )}
                </DialogContent>
            </Dialog>

            <Table>
                <TableHeader className="border-b border-zinc-800">
                    <TableRow className="hover:bg-transparent">
                        <TableHead className="text-zinc-400">Client</TableHead>
                        <TableHead className="text-zinc-400">Contact</TableHead>
                        <TableHead className="text-zinc-400">Location</TableHead>
                        <TableHead className="text-zinc-400">Socials</TableHead>
                        <TableHead className="text-zinc-400 text-right">Orders</TableHead>
                        <TableHead className="text-zinc-400 text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {clients.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} className="h-24 text-center text-zinc-500">
                                No clients found. Add your first client to start managing orders.
                            </TableCell>
                        </TableRow>
                    ) : (
                        clients.map((client) => (
                            <TableRow key={client.id} className="border-zinc-800 hover:bg-zinc-900/40 transition-colors">
                                <TableCell className="font-medium">
                                    <Link href={`/dashboard/clients/${client.id}`} className="hover:underline">
                                        <div className="text-white">{client.fullName}</div>
                                        <div className="text-xs text-zinc-500">{client.companyName || "Personal Account"}</div>
                                    </Link>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col gap-1 text-xs">
                                        {client.email && (
                                            <div className="flex items-center gap-1.5 text-zinc-400">
                                                <Mail className="h-3 w-3" /> {client.email}
                                            </div>
                                        )}
                                        {client.phone && (
                                            <div className="flex items-center gap-1.5 text-zinc-400">
                                                <Phone className="h-3 w-3" /> {client.phone}
                                            </div>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-1.5 text-zinc-400 text-xs">
                                        <Globe className="h-3 w-3" /> {client.country || "Unknown"}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-wrap gap-1">
                                        {client.instagramUsername && (
                                            <Badge variant="outline" className="text-[10px] bg-pink-500/5 text-pink-500 border-pink-500/20">
                                                IG: @{client.instagramUsername}
                                            </Badge>
                                        )}
                                        {client.tiktokUsername && (
                                            <Badge variant="outline" className="text-[10px] bg-cyan-500/5 text-cyan-500 border-cyan-500/20">
                                                TT: @{client.tiktokUsername}
                                            </Badge>
                                        )}
                                        {client.facebookProfile && (
                                            <Badge variant="outline" className="text-[10px] bg-blue-500/5 text-blue-400 border-blue-500/20">
                                                FB: {String(client.facebookProfile).replace(/^https?:\/\/(www\.)?facebook\.com\//i, "").replace(/\/+$/, "")}
                                            </Badge>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Badge variant="secondary" className="bg-zinc-900 border-zinc-800 text-zinc-400">
                                        {client._count?.orders || 0}
                                    </Badge>
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
                                                    render={<Link href={`/dashboard/clients/${client.id}`}>View Profile</Link>}
                                                />
                                                <DropdownMenuItem className="focus:bg-zinc-900 focus:text-white cursor-pointer" onClick={() => handleEdit(client)}>
                                                    <Edit className="mr-2 h-4 w-4" /> Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator className="bg-zinc-800" />
                                                <DropdownMenuItem className="focus:bg-red-950/20 focus:text-red-400 text-red-400 cursor-pointer" onClick={() => handleDelete(client)}>
                                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
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
        </>
    );
}
