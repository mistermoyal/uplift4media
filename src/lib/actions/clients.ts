"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const clientSchema = z.object({
    fullName: z.string().min(1, "Full name is required"),
    email: z.string().email().optional().or(z.literal("")),
    phone: z.string().optional(),
    country: z.string().optional(),
    companyName: z.string().optional(),
    instagramUsername: z.string().optional(),
    tiktokUsername: z.string().optional(),
    facebookProfile: z.string().optional(),
    preferredLanguage: z.string().optional(),
    notes: z.string().optional(),
});

export async function getClients() {
    return await prisma.client.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            _count: {
                select: { orders: true },
            },
        },
    });
}

export async function createClient(data: z.infer<typeof clientSchema>) {
    const client = await prisma.client.create({
        data: {
            ...data,
            email: data.email || null,
        },
    });
    revalidatePath("/dashboard/clients");
    return client;
}

export async function updateClient(id: string, data: Partial<z.infer<typeof clientSchema>>) {
    const client = await prisma.client.update({
        where: { id },
        data: {
            ...data,
            email: data.email || null,
        },
    });
    revalidatePath("/dashboard/clients");
    revalidatePath(`/dashboard/clients/${id}`);
    return client;
}

export async function deleteClient(id: string) {
    await prisma.client.delete({
        where: { id },
    });
    revalidatePath("/dashboard/clients");
}

export async function getClientById(id: string) {
    return await prisma.client.findUnique({
        where: { id },
        include: {
            orders: {
                include: {
                    service: true,
                },
                orderBy: { createdAt: "desc" },
            },
        },
    });
}
