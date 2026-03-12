"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { OrderStatus, PaymentStatus, QuoteStatus, Priority, Platform, Currency, PaymentMethod } from "@prisma/client";

const notedTypeSchema = z.enum(["IP_DNR_COPYRIGHT", "GRO_SPECIALIZED_ENFORCEMENT_IG"]);

const orderSchema = z.object({
    clientId: z.string().min(1, "Client is required"),
    serviceId: z.string().min(1, "Service is required"),
    platform: z.nativeEnum(Platform),
    targetUsername: z.string().optional().or(z.literal("")),
    targetEmail: z.string().optional().or(z.literal("")),
    targetPhone: z.string().optional().or(z.literal("")),
    profileUrl: z.string().optional().or(z.literal("")),
    quoteAmount: z.coerce.number().min(0),
    internalCost: z.coerce.number().min(0),
    currency: z.nativeEnum(Currency).default(Currency.USD),
    paymentMethod: z.nativeEnum(PaymentMethod).default(PaymentMethod.BANK_TRANSFER),
    priority: z.nativeEnum(Priority).default(Priority.NORMAL),
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

const updateOrderSchema = orderSchema.extend({
    orderNumber: z.coerce.number().int().positive().optional(),
});

async function resolveActivityUserId(preferredUserId?: string) {
    if (preferredUserId) {
        const existingPreferredUser = await prisma.user.findUnique({
            where: { id: preferredUserId },
            select: { id: true },
        });
        if (existingPreferredUser) return existingPreferredUser.id;
    }

    const fallbackUser = await prisma.user.findFirst({
        select: { id: true },
        orderBy: { createdAt: "asc" },
    });

    return fallbackUser?.id ?? null;
}

export async function getOrders() {
    return await prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            client: true,
            service: true,
            assignedUser: {
                select: { name: true, email: true },
            },
        },
    });
}

export async function createOrder(data: z.infer<typeof orderSchema>) {
    const parsedData = orderSchema.parse(data);
    const order = await prisma.$transaction(async (tx) => {
        const maxOrder = await tx.order.aggregate({
            _max: { orderNumber: true },
        });
        const nextOrderNumber = (maxOrder._max.orderNumber ?? 0) + 1;

        const createdOrder = await tx.order.create({
            data: {
                platform: parsedData.platform,
                targetUsername: parsedData.targetUsername || null,
                targetEmail: parsedData.targetEmail || null,
                targetPhone: parsedData.targetPhone || null,
                profileUrl: parsedData.profileUrl || null,
                quoteAmount: parsedData.quoteAmount,
                internalCost: parsedData.internalCost,
                currency: parsedData.currency,
                paymentMethod: parsedData.paymentMethod,
                priority: parsedData.priority,
                source: parsedData.source || null,
                intakeNotes: parsedData.intakeNotes || null,
                estimatedDelivery: parsedData.estimatedDelivery || null,
                banReason: parsedData.banReason || null,
                isNoted: parsedData.isNoted,
                notedType: parsedData.isNoted ? parsedData.notedType || null : null,
                client: { connect: { id: parsedData.clientId } },
                service: { connect: { id: parsedData.serviceId } },
                orderNumber: nextOrderNumber,
                status: OrderStatus.NEW_REQUEST,
                quoteStatus: QuoteStatus.DRAFT,
                paymentStatus: PaymentStatus.UNPAID,
            },
        });

        const activityUserId = await resolveActivityUserId();
        if (activityUserId) {
            await tx.activity.create({
                data: {
                    type: "ORDER_CREATED",
                    description: `Order #${createdOrder.orderNumber} created`,
                    orderId: createdOrder.id,
                    userId: activityUserId,
                },
            });
        }

        return createdOrder;
    });

    revalidatePath("/dashboard/orders");
    return { id: order.id, orderNumber: order.orderNumber };
}

export async function updateOrder(id: string, data: z.infer<typeof updateOrderSchema>, userId?: string) {
    const parsedData = updateOrderSchema.parse(data);

    if (parsedData.orderNumber !== undefined) {
        const duplicateOrder = await prisma.order.findFirst({
            where: {
                orderNumber: parsedData.orderNumber,
                NOT: { id },
            },
            select: { id: true },
        });

        if (duplicateOrder) {
            throw new Error(`Order number #${parsedData.orderNumber.toString().padStart(4, "0")} already exists`);
        }
    }

    const [clientExists, serviceExists] = await Promise.all([
        prisma.client.findUnique({ where: { id: parsedData.clientId }, select: { id: true } }),
        prisma.service.findUnique({ where: { id: parsedData.serviceId }, select: { id: true } }),
    ]);

    const order = await prisma.order.update({
        where: { id },
        data: {
            platform: parsedData.platform,
            targetUsername: parsedData.targetUsername || null,
            targetEmail: parsedData.targetEmail || null,
            targetPhone: parsedData.targetPhone || null,
            profileUrl: parsedData.profileUrl || null,
            quoteAmount: parsedData.quoteAmount,
            internalCost: parsedData.internalCost,
            currency: parsedData.currency,
            paymentMethod: parsedData.paymentMethod,
            priority: parsedData.priority,
            source: parsedData.source || null,
            intakeNotes: parsedData.intakeNotes || null,
            estimatedDelivery: parsedData.estimatedDelivery || null,
            banReason: parsedData.banReason || null,
            isNoted: parsedData.isNoted,
            notedType: parsedData.isNoted ? parsedData.notedType || null : null,
            orderNumber: parsedData.orderNumber,
            ...(clientExists ? { client: { connect: { id: parsedData.clientId } } } : {}),
            ...(serviceExists ? { service: { connect: { id: parsedData.serviceId } } } : {}),
        },
    });

    const activityUserId = await resolveActivityUserId(userId);
    if (activityUserId) {
        await prisma.activity.create({
            data: {
                type: "ORDER_UPDATED",
                description: `Order #${order.orderNumber} updated`,
                orderId: id,
                userId: activityUserId,
            },
        });
    }

    revalidatePath("/dashboard/orders");
    revalidatePath(`/dashboard/orders/${id}`);
    return { id: order.id, orderNumber: order.orderNumber };
}

export async function deleteOrder(id: string) {
    await prisma.$transaction(async (tx) => {
        await tx.activity.deleteMany({ where: { orderId: id } });
        await tx.note.deleteMany({ where: { orderId: id } });
        await tx.order.delete({ where: { id } });
    });

    revalidatePath("/dashboard/orders");
}

export async function updateOrderStatus(id: string, status: OrderStatus, userId: string) {
    const oldOrder = await prisma.order.findUnique({ where: { id } });

    const order = await prisma.order.update({
        where: { id },
        data: { status },
    });

    const activityUserId = await resolveActivityUserId(userId);
    if (activityUserId) {
        await prisma.activity.create({
            data: {
                type: "STATUS_CHANGE",
                description: `Status changed from ${oldOrder?.status} to ${status}`,
                orderId: id,
                userId: activityUserId,
            },
        });
    }

    revalidatePath("/dashboard/orders");
    revalidatePath(`/dashboard/orders/${id}`);
    return { id: order.id, status: order.status };
}

export async function getOrderById(id?: string | null) {
    if (!id) return null;

    return await prisma.order.findUnique({
        where: { id },
        include: {
            client: true,
            service: true,
            notes: {
                orderBy: { createdAt: "desc" },
            },
            activities: {
                include: {
                    user: {
                        select: { name: true },
                    },
                },
                orderBy: { createdAt: "desc" },
            },
            assignedUser: true,
        },
    });
}
