"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

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

export async function addNote(orderId: string, authorId: string, content: string) {
    const note = await prisma.note.create({
        data: {
            orderId,
            authorId,
            content,
        },
    });

    const activityUserId = await resolveActivityUserId(authorId);
    if (activityUserId) {
        await prisma.activity.create({
            data: {
                type: "NOTE_ADDED",
                description: "Internal note added to case",
                orderId,
                userId: activityUserId,
            },
        });
    }

    revalidatePath(`/dashboard/orders/${orderId}`);
    return note;
}
