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
import { useState, useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import { createOrder, updateOrder } from "@/lib/actions/orders";
import { toast } from "sonner";
import { paymentMethodLabelMap } from "@/lib/payment-method";
import {
    platformValues,
    priorityValues,
    currencyValues,
    paymentMethodValues,
    type PlatformValue,
    type PriorityValue,
} from "@/lib/client-enums";

const notedTypeSchema = z.enum(["IP_DNR_COPYRIGHT", "GRO_SPECIALIZED_ENFORCEMENT_IG"]);

const platformLabelMap: Record<PlatformValue, string> = {
    INSTAGRAM: "Instagram",
    TIKTOK: "TikTok",
    FACEBOOK: "Facebook",
    OTHER: "Other",
};

const priorityLabelMap: Record<PriorityValue, string> = {
    LOW: "Low",
    NORMAL: "Normal",
    HIGH: "High",
    URGENT: "Urgent",
};

const estimatedDeliveryOptions = [
    "0-7 days",
    "0-14 days",
    "0-21 days",
    "0-30 days",
    "+1 month",
];

const orderSchema = z.object({
    orderNumber: z.coerce.number().int().positive().optional(),
    clientId: z.string().min(1, "Client is required"),
    serviceId: z.string().min(1, "Service is required"),
    platform: z.enum(platformValues),
    targetUsername: z.string().optional().or(z.literal("")),
    targetEmail: z.string().optional().or(z.literal("")),
    targetPhone: z.string().optional().or(z.literal("")),
    profileUrl: z.string().optional().or(z.literal("")),
    quoteAmount: z.coerce.number().min(0),
    internalCost: z.coerce.number().min(0),
    currency: z.enum(currencyValues).default("USD"),
    paymentMethod: z.enum(paymentMethodValues).default("BANK_TRANSFER"),
    priority: z.enum(priorityValues).default("NORMAL"),
    source: z.string().optional().or(z.literal("")),
    intakeNotes: z.string().optional().or(z.literal("")),
    estimatedDelivery: z.string().optional().or(z.literal("")),
    banReason: z.string().optional().or(z.literal("")),
    isNoted: z.coerce.boolean().default(false),
    notedType: notedTypeSchema.optional().or(z.literal("")),
}).superRefine((data, ctx) => {
    if (data.isNoted && !data.notedType) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["notedType"],
            message: "Noted type is required when Noted is Yes",
        });
    }
});

type OrderFormValues = z.infer<typeof orderSchema>;

interface OrderFormProps {
    clients: any[];
    services: any[];
    mode?: "create" | "edit";
    orderId?: string;
    initialValues?: Partial<OrderFormValues>;
    onSuccess: () => void;
}

export function OrderForm({ clients, services, mode = "create", orderId, initialValues, onSuccess }: OrderFormProps) {
    const [loading, setLoading] = useState(false);
    const [selectedService, setSelectedService] = useState<any>(null);
    const previousServiceIdRef = useRef(initialValues?.serviceId ?? "");

    const form = useForm<OrderFormValues>({
        resolver: zodResolver(orderSchema) as any,
        defaultValues: {
            orderNumber: initialValues?.orderNumber,
            clientId: initialValues?.clientId ?? "",
            serviceId: initialValues?.serviceId ?? "",
            platform: initialValues?.platform ?? "INSTAGRAM",
            targetUsername: initialValues?.targetUsername ?? "",
            targetEmail: initialValues?.targetEmail ?? "",
            targetPhone: initialValues?.targetPhone ?? "",
            profileUrl: initialValues?.profileUrl ?? "",
            quoteAmount: initialValues?.quoteAmount ?? 0,
            internalCost: initialValues?.internalCost ?? 0,
            currency: initialValues?.currency ?? "USD",
            paymentMethod: initialValues?.paymentMethod ?? "BANK_TRANSFER",
            priority: initialValues?.priority ?? "NORMAL",
            source: initialValues?.source ?? "WhatsApp",
            intakeNotes: initialValues?.intakeNotes ?? "",
            estimatedDelivery: initialValues?.estimatedDelivery ?? "",
            banReason: initialValues?.banReason ?? "",
            isNoted: initialValues?.isNoted ?? false,
            notedType: initialValues?.notedType ?? "",
        },
    });

    // Watch service selection to update defaults
    const serviceId = form.watch("serviceId");
    const isNoted = form.watch("isNoted");
    useEffect(() => {
        if (serviceId) {
            const service = services.find((s) => s.id === serviceId);
            if (service) {
                setSelectedService(service);
                const serviceChanged = previousServiceIdRef.current !== serviceId;
                if (mode === "create" || serviceChanged) {
                    form.setValue("platform", service.platform);
                    form.setValue("estimatedDelivery", service.estimatedDelivery || "");
                }
                previousServiceIdRef.current = serviceId;
            }
        }
    }, [serviceId, services, form, mode]);

    const isInstagramUnbanCase = !!selectedService
        && selectedService.platform === "INSTAGRAM";

    useEffect(() => {
        if (selectedService && !isInstagramUnbanCase) {
            form.setValue("isNoted", false);
            form.setValue("notedType", "");
        }
    }, [isInstagramUnbanCase, form, selectedService]);

    useEffect(() => {
        if (!isNoted) {
            form.setValue("notedType", "");
        }
    }, [isNoted, form]);

    const onSubmit = async (data: OrderFormValues) => {
        setLoading(true);
        try {
            if (mode === "edit" && orderId) {
                await updateOrder(orderId, data);
                toast.success("Order updated successfully");
            } else {
                await createOrder(data);
                toast.success("Order created successfully");
            }
            onSuccess();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                    {mode === "edit" && (
                        <FormField
                            control={form.control}
                            name="orderNumber"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-zinc-400">Order #</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            min={1}
                                            step={1}
                                            value={field.value ?? ""}
                                            onChange={field.onChange}
                                            className="bg-zinc-900 border-zinc-800"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}
                    <FormField
                        control={form.control}
                        name="clientId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-zinc-400">Client</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger className="bg-zinc-900 border-zinc-800">
                                            <SelectValue placeholder="Select client">
                                                {field.value ? clients.find(c => c.id === field.value)?.fullName : undefined}
                                            </SelectValue>
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="bg-zinc-950 border-zinc-800 text-white">
                                        {clients.map((client) => (
                                            <SelectItem key={client.id} value={client.id} label={client.fullName}>
                                                {client.fullName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="serviceId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-zinc-400">Service</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger className="bg-zinc-900 border-zinc-800">
                                            <SelectValue placeholder="Select service">
                                                {field.value ? services.find(s => s.id === field.value)?.name : undefined}
                                            </SelectValue>
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="bg-zinc-950 border-zinc-800 text-white">
                                        {services.map((service) => (
                                            <SelectItem key={service.id} value={service.id} label={service.name}>
                                                {service.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="currency"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-zinc-400">Currency</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger className="bg-zinc-900 border-zinc-800">
                                            <SelectValue placeholder="Currency" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="bg-zinc-950 border-zinc-800 text-white">
                                        <SelectItem value="USD">USD ($)</SelectItem>
                                        <SelectItem value="EUR">EUR (€)</SelectItem>
                                        <SelectItem value="CAD">CAD (C$)</SelectItem>
                                        <SelectItem value="AED">AED (د.إ)</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="paymentMethod"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-zinc-400">Payment Method</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger className="bg-zinc-900 border-zinc-800">
                                            <SelectValue placeholder="Payment Method">
                                                {paymentMethodLabelMap[field.value]}
                                            </SelectValue>
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="bg-zinc-950 border-zinc-800 text-white">
                                        <SelectItem value="BANK_TRANSFER" label="Bank transfer">Bank transfer</SelectItem>
                                        <SelectItem value="CRYPTO" label="Crypto">Crypto</SelectItem>
                                        <SelectItem value="CASH" label="Cash">Cash</SelectItem>
                                        <SelectItem value="STRIPE" label="Stripe">Stripe</SelectItem>
                                        <SelectItem value="PAYPAL" label="PayPal">PayPal</SelectItem>
                                        <SelectItem value="OTHER" label="Other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="estimatedDelivery"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-zinc-400">Estimated Delivery</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value ?? ""}>
                                <FormControl>
                                    <SelectTrigger className="bg-zinc-900 border-zinc-800">
                                        <SelectValue placeholder="Select estimate" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent className="bg-zinc-950 border-zinc-800 text-white">
                                    {estimatedDeliveryOptions.map((option) => (
                                        <SelectItem key={option} value={option} label={option}>
                                            {option}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-3 gap-4">
                    <FormField
                        control={form.control}
                        name="platform"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-zinc-400">Platform</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger className="bg-zinc-900 border-zinc-800">
                                            <SelectValue placeholder="Platform">
                                                {platformLabelMap[field.value]}
                                            </SelectValue>
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="bg-zinc-950 border-zinc-800 text-white">
                                        <SelectItem value="INSTAGRAM" label="Instagram">Instagram</SelectItem>
                                        <SelectItem value="TIKTOK" label="TikTok">TikTok</SelectItem>
                                        <SelectItem value="FACEBOOK" label="Facebook">Facebook</SelectItem>
                                        <SelectItem value="OTHER" label="Other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="priority"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-zinc-400">Priority</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger className="bg-zinc-900 border-zinc-800">
                                            <SelectValue placeholder="Priority">
                                                {priorityLabelMap[field.value]}
                                            </SelectValue>
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="bg-zinc-950 border-zinc-800 text-white">
                                        <SelectItem value="LOW" label="Low">Low</SelectItem>
                                        <SelectItem value="NORMAL" label="Normal">Normal</SelectItem>
                                        <SelectItem value="HIGH" label="High">High</SelectItem>
                                        <SelectItem value="URGENT" label="Urgent">Urgent</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="source"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-zinc-400">Leads Source</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="WhatsApp" className="bg-zinc-900 border-zinc-800" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="quoteAmount"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-zinc-400">Quote Amount</FormLabel>
                                <FormControl>
                                    <Input {...field} type="number" step="0.01" className="bg-zinc-900 border-zinc-800" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="internalCost"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-zinc-400">Internal Cost</FormLabel>
                                <FormControl>
                                    <Input {...field} type="number" step="0.01" className="bg-zinc-900 border-zinc-800" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {selectedService && (
                    <div className="p-4 rounded-lg bg-zinc-900/50 border border-zinc-800 space-y-4">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Case Requirements</h4>
                        <div className="grid grid-cols-1 gap-4">
                            {selectedService.requiresTargetUser && (
                                <FormField
                                    control={form.control}
                                    name="targetUsername"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-zinc-400 text-xs">Target Username</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="@username" className="bg-zinc-950 border-zinc-800 text-xs" />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            )}
                            {selectedService.requiresEmail && (
                                <FormField
                                    control={form.control}
                                    name="targetEmail"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-zinc-400 text-xs">Target Email</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="email@target.com" className="bg-zinc-950 border-zinc-800 text-xs" />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            )}
                        </div>
                        <FormField
                            control={form.control}
                            name="banReason"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-zinc-400 text-xs">Ban Reason</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="Describe ban reason..." className="bg-zinc-950 border-zinc-800 text-xs" />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        {isInstagramUnbanCase && (
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="isNoted"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-zinc-400 text-xs">Noted?</FormLabel>
                                            <Select
                                                onValueChange={(value) => field.onChange(value === "yes")}
                                                value={field.value ? "yes" : "no"}
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="bg-zinc-950 border-zinc-800 text-xs">
                                                        <SelectValue placeholder="Select option" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent className="bg-zinc-950 border-zinc-800 text-white">
                                                    <SelectItem value="no">No</SelectItem>
                                                    <SelectItem value="yes">Yes</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                {isNoted && (
                                    <FormField
                                        control={form.control}
                                        name="notedType"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-zinc-400 text-xs">Noted Type</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value ?? ""}>
                                                    <FormControl>
                                                        <SelectTrigger className="bg-zinc-950 border-zinc-800 text-xs">
                                                            <SelectValue placeholder="Select type" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent className="bg-zinc-950 border-zinc-800 text-white">
                                                        <SelectItem value="IP_DNR_COPYRIGHT">IP_DNR_COPYRIGHT</SelectItem>
                                                        <SelectItem value="GRO_SPECIALIZED_ENFORCEMENT_IG">GRO_SPECIALIZED_ENFORCEMENT_IG</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}
                            </div>
                        )}
                    </div>
                )}

                <FormField
                    control={form.control}
                    name="intakeNotes"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-zinc-400">Intake Notes</FormLabel>
                            <FormControl>
                                <Input {...field} placeholder="Brief summary of the case..." className="bg-zinc-900 border-zinc-800" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" className="w-full bg-white text-black hover:bg-zinc-200" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {mode === "edit" ? "Save Changes" : "Create Order"}
                </Button>
            </form>
        </Form>
    );
}
