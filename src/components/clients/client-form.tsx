"use client";

import { useForm, ControllerRenderProps } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { createClient, updateClient } from "@/lib/actions/clients";
import { toast } from "sonner";

type ClientInitialData = {
    id: string;
    fullName?: string | null;
    email?: string | null;
    phone?: string | null;
    country?: string | null;
    companyName?: string | null;
    instagramUsername?: string | null;
    tiktokUsername?: string | null;
    facebookProfile?: string | null;
    notes?: string | null;
} | null;

const clientSchema = z.object({
    fullName: z.string().min(1, "Full name is required"),
    email: z.string().email().optional().or(z.literal("")),
    phone: z.string().optional().or(z.literal("")),
    country: z.string().optional().or(z.literal("")),
    companyName: z.string().optional().or(z.literal("")),
    instagramUsername: z.string().optional().or(z.literal("")),
    tiktokUsername: z.string().optional().or(z.literal("")),
    facebookProfile: z.string().optional().or(z.literal("")),
    notes: z.string().optional().or(z.literal("")),
});

type ClientFormValues = z.infer<typeof clientSchema>;

interface ClientFormProps {
    initialData?: ClientInitialData;
    onSuccess: () => void;
}

export function ClientForm({ initialData, onSuccess }: ClientFormProps) {
    const [loading, setLoading] = useState(false);

    const normalizedDefaults: ClientFormValues = {
        fullName: initialData?.fullName ?? "",
        email: initialData?.email ?? "",
        phone: initialData?.phone ?? "",
        country: initialData?.country ?? "",
        companyName: initialData?.companyName ?? "",
        instagramUsername: initialData?.instagramUsername ?? "",
        tiktokUsername: initialData?.tiktokUsername ?? "",
        facebookProfile: initialData?.facebookProfile ?? "",
        notes: initialData?.notes ?? "",
    };

    const form = useForm<ClientFormValues>({
        resolver: zodResolver(clientSchema),
        defaultValues: normalizedDefaults,
    });

    const onSubmit = async (data: ClientFormValues) => {
        setLoading(true);
        try {
            if (initialData?.id) {
                await updateClient(initialData.id, data);
                toast.success("Client updated successfully");
            } else {
                await createClient(data);
                toast.success("Client created successfully");
            }
            onSuccess();
        } catch {
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }: { field: ControllerRenderProps<ClientFormValues, "fullName"> }) => (
                        <FormItem>
                            <FormLabel className="text-zinc-400">Full Name</FormLabel>
                                <FormControl>
                                    <Input {...field} value={field.value ?? ""} placeholder="John Doe" className="bg-zinc-900 border-zinc-800" />
                                </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }: { field: ControllerRenderProps<ClientFormValues, "email"> }) => (
                            <FormItem>
                                <FormLabel className="text-zinc-400">Email</FormLabel>
                                <FormControl>
                                    <Input {...field} value={field.value ?? ""} type="email" placeholder="john@example.com" className="bg-zinc-900 border-zinc-800" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }: { field: ControllerRenderProps<ClientFormValues, "phone"> }) => (
                            <FormItem>
                                <FormLabel className="text-zinc-400">Phone</FormLabel>
                                <FormControl>
                                    <Input {...field} value={field.value ?? ""} placeholder="+1..." className="bg-zinc-900 border-zinc-800" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="country"
                        render={({ field }: { field: ControllerRenderProps<ClientFormValues, "country"> }) => (
                            <FormItem>
                                <FormLabel className="text-zinc-400">Country</FormLabel>
                                <FormControl>
                                    <Input {...field} value={field.value ?? ""} placeholder="USA" className="bg-zinc-900 border-zinc-800" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="companyName"
                        render={({ field }: { field: ControllerRenderProps<ClientFormValues, "companyName"> }) => (
                            <FormItem>
                                <FormLabel className="text-zinc-400">Company (Optional)</FormLabel>
                                <FormControl>
                                    <Input {...field} value={field.value ?? ""} placeholder="UPLIFT" className="bg-zinc-900 border-zinc-800" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <FormField
                        control={form.control}
                        name="instagramUsername"
                        render={({ field }: { field: ControllerRenderProps<ClientFormValues, "instagramUsername"> }) => (
                            <FormItem>
                                <FormLabel className="text-zinc-400">Instagram</FormLabel>
                                <FormControl>
                                    <Input {...field} value={field.value ?? ""} placeholder="@username" className="bg-zinc-900 border-zinc-800" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="tiktokUsername"
                        render={({ field }: { field: ControllerRenderProps<ClientFormValues, "tiktokUsername"> }) => (
                            <FormItem>
                                <FormLabel className="text-zinc-400">TikTok</FormLabel>
                                <FormControl>
                                    <Input {...field} value={field.value ?? ""} placeholder="@username" className="bg-zinc-900 border-zinc-800" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="facebookProfile"
                        render={({ field }: { field: ControllerRenderProps<ClientFormValues, "facebookProfile"> }) => (
                            <FormItem>
                                <FormLabel className="text-zinc-400">Facebook</FormLabel>
                                <FormControl>
                                    <Input {...field} value={field.value ?? ""} placeholder="URL" className="bg-zinc-900 border-zinc-800" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }: { field: ControllerRenderProps<ClientFormValues, "notes"> }) => (
                        <FormItem>
                            <FormLabel className="text-zinc-400">Source / Notes</FormLabel>
                            <FormControl>
                                <Input {...field} value={field.value ?? ""} placeholder="WhatsApp/Referral" className="bg-zinc-900 border-zinc-800" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" className="w-full bg-white text-black hover:bg-zinc-200" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {initialData?.id ? "Update Client" : "Add Client"}
                </Button>
            </form>
        </Form>
    );
}
