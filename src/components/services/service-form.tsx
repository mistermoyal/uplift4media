"use client";

import { useForm } from "react-hook-form";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { createService, updateService } from "@/lib/actions/services";
import { toast } from "sonner";
import { platformValues, type PlatformValue } from "@/lib/client-enums";

type ServiceInitialData = {
    id: string;
    name?: string | null;
    slug?: string | null;
    category?: string | null;
    platform?: PlatformValue | null;
    description?: string | null;
    isActive?: boolean | null;
    requiresTargetUser?: boolean | null;
    requiresEmail?: boolean | null;
    requiresPhone?: boolean | null;
    requiresCaseNotes?: boolean | null;
} | null;

const serviceSchema = z.object({
    name: z.string().min(1, "Name is required"),
    slug: z.string().min(1, "Slug is required"),
    category: z.string().optional().or(z.literal("")),
    platform: z.enum(platformValues),
    description: z.string().optional().or(z.literal("")),
    isActive: z.boolean().default(true),
    requiresTargetUser: z.boolean().default(false),
    requiresEmail: z.boolean().default(false),
    requiresPhone: z.boolean().default(false),
    requiresCaseNotes: z.boolean().default(false),
});

type ServiceFormValues = z.infer<typeof serviceSchema>;

interface ServiceFormProps {
    initialData?: ServiceInitialData;
    onSuccess: () => void;
}

export function ServiceForm({ initialData, onSuccess }: ServiceFormProps) {
    const [loading, setLoading] = useState(false);

    const form = useForm<ServiceFormValues>({
        resolver: zodResolver(serviceSchema) as any,
        defaultValues: initialData ? {
            name: initialData.name ?? "",
            slug: initialData.slug ?? "",
            category: initialData.category ?? "",
            platform: (initialData.platform as PlatformValue) ?? "INSTAGRAM",
            description: initialData.description ?? "",
            isActive: initialData.isActive ?? true,
            requiresTargetUser: initialData.requiresTargetUser ?? false,
            requiresEmail: initialData.requiresEmail ?? false,
            requiresPhone: initialData.requiresPhone ?? false,
            requiresCaseNotes: initialData.requiresCaseNotes ?? false,
        } : {
            name: "",
            slug: "",
            category: "",
            platform: "INSTAGRAM",
            description: "",
            isActive: true,
            requiresTargetUser: false,
            requiresEmail: false,
            requiresPhone: false,
            requiresCaseNotes: false,
        },
    });

    const onSubmit = async (data: ServiceFormValues) => {
        setLoading(true);
        try {
            if (initialData?.id) {
                await updateService(initialData.id, data);
                toast.success("Service updated successfully");
            } else {
                await createService(data);
                toast.success("Service created successfully");
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
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-zinc-400">Name</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="Instagram Recovery" className="bg-zinc-900 border-zinc-800" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="slug"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-zinc-400">Slug</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="instagram-recovery" className="bg-zinc-900 border-zinc-800" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="platform"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-zinc-400">Platform</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger className="bg-zinc-900 border-zinc-800">
                                            <SelectValue placeholder="Select platform" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="bg-zinc-950 border-zinc-800 text-white">
                                        <SelectItem value="INSTAGRAM">Instagram</SelectItem>
                                        <SelectItem value="TIKTOK">TikTok</SelectItem>
                                        <SelectItem value="FACEBOOK">Facebook</SelectItem>
                                        <SelectItem value="OTHER">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-zinc-400">Category</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="Recovery" className="bg-zinc-900 border-zinc-800" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-zinc-400">Description</FormLabel>
                            <FormControl>
                                <Input {...field} placeholder="Short description of the service" className="bg-zinc-900 border-zinc-800" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-2 gap-y-4 gap-x-8 pt-2">
                    <FormField
                        control={form.control}
                        name="requiresTargetUser"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} className="data-[state=checked]:bg-white data-[state=checked]:text-black" />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                    <FormLabel className="text-sm font-medium text-zinc-300">Requires Username</FormLabel>
                                </div>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="requiresEmail"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} className="data-[state=checked]:bg-white data-[state=checked]:text-black" />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                    <FormLabel className="text-sm font-medium text-zinc-300">Requires Email</FormLabel>
                                </div>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="requiresPhone"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} className="data-[state=checked]:bg-white data-[state=checked]:text-black" />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                    <FormLabel className="text-sm font-medium text-zinc-300">Requires Phone</FormLabel>
                                </div>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="requiresCaseNotes"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} className="data-[state=checked]:bg-white data-[state=checked]:text-black" />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                    <FormLabel className="text-sm font-medium text-zinc-300">Requires Case Notes</FormLabel>
                                </div>
                            </FormItem>
                        )}
                    />
                </div>

                <Button type="submit" className="w-full bg-white text-black hover:bg-zinc-200" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {initialData?.id ? "Update Service" : "Create Service"}
                </Button>
            </form>
        </Form>
    );
}
