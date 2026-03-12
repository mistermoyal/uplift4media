"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Platform } from "@prisma/client";
import { z } from "zod";

const serviceSchema = z.object({
    name: z.string().min(1, "Name is required"),
    slug: z.string().min(1, "Slug is required"),
    category: z.string().optional(),
    platform: z.nativeEnum(Platform),
    description: z.string().optional(),
    estimatedDelivery: z.string().optional(),
    isActive: z.boolean().default(true),
    requiresTargetUser: z.boolean().default(false),
    requiresEmail: z.boolean().default(false),
    requiresPhone: z.boolean().default(false),
    requiresCaseNotes: z.boolean().default(false),
});
const updateServiceSchema = serviceSchema.partial();

export async function getServices() {
    return await prisma.service.findMany({
        orderBy: { createdAt: "desc" },
        select: {
            id: true,
            name: true,
            slug: true,
            category: true,
            platform: true,
            description: true,
            estimatedDelivery: true,
            isActive: true,
            requiresTargetUser: true,
            requiresEmail: true,
            requiresPhone: true,
            requiresCaseNotes: true,
            createdAt: true,
            updatedAt: true,
        },
    });
}

export async function createService(data: z.infer<typeof serviceSchema>) {
    const parsedData = serviceSchema.parse(data);
    const service = await prisma.service.create({
        data: {
            ...parsedData,
            slug: parsedData.slug.toLowerCase().replace(/\s+/g, "-"),
        },
    });
    revalidatePath("/dashboard/services");
    return service;
}

export async function updateService(id: string, data: z.infer<typeof updateServiceSchema>) {
    const parsedData = updateServiceSchema.parse(data);
    const service = await prisma.service.update({
        where: { id },
        data: parsedData,
    });
    revalidatePath("/dashboard/services");
    return service;
}

export async function deleteService(id: string) {
    await prisma.service.delete({
        where: { id },
    });
    revalidatePath("/dashboard/services");
}
