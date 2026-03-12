import type { OrderStatusValue } from "@/lib/client-enums";

type StatusMeta = {
    label: string;
    badgeClassName: string;
    dotClassName: string;
};

const STATUS_META: Record<string, StatusMeta> = {
    NEW_REQUEST: {
        label: "New Request",
        badgeClassName: "bg-blue-500/10 text-blue-400 border-blue-500/20",
        dotClassName: "bg-blue-500",
    },
    QUALIFYING: {
        label: "Qualifying",
        badgeClassName: "bg-purple-500/10 text-purple-400 border-purple-500/20",
        dotClassName: "bg-purple-500",
    },
    WAITING_QUOTE_APPROVAL: {
        label: "Waiting Quote Approval",
        badgeClassName: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
        dotClassName: "bg-yellow-500",
    },
    QUOTE_ACCEPTED: {
        label: "Quote Accepted",
        badgeClassName: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        dotClassName: "bg-emerald-500",
    },
    PAYMENT_PENDING: {
        label: "Payment Sent",
        badgeClassName: "bg-orange-500/10 text-orange-400 border-orange-500/20",
        dotClassName: "bg-orange-500",
    },
    PAYMENT_SENT_WAITING_RECEIPT: {
        label: "Payment Sent",
        badgeClassName: "bg-orange-500/10 text-orange-400 border-orange-500/20",
        dotClassName: "bg-orange-500",
    },
    READY_TO_START: {
        label: "Ready",
        badgeClassName: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
        dotClassName: "bg-cyan-500",
    },
    IN_PROGRESS: {
        label: "In Progress",
        badgeClassName: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
        dotClassName: "bg-indigo-500",
    },
    WAITING_PROVIDER: {
        label: "Waiting Provider",
        badgeClassName: "bg-zinc-500/10 text-zinc-300 border-zinc-500/20",
        dotClassName: "bg-zinc-400",
    },
    WAITING_CLIENT: {
        label: "Waiting Client",
        badgeClassName: "bg-rose-500/10 text-rose-400 border-rose-500/20",
        dotClassName: "bg-rose-500",
    },
    ON_HOLD: {
        label: "On Hold",
        badgeClassName: "bg-zinc-800 text-zinc-300 border-zinc-700",
        dotClassName: "bg-zinc-500",
    },
    COMPLETED: {
        label: "Completed",
        badgeClassName: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
        dotClassName: "bg-emerald-500",
    },
    FAILED: {
        label: "Failed",
        badgeClassName: "bg-red-500/20 text-red-300 border-red-500/30",
        dotClassName: "bg-red-500",
    },
    CANCELLED: {
        label: "Cancelled",
        badgeClassName: "bg-zinc-900 text-zinc-400 border-zinc-800",
        dotClassName: "bg-zinc-500",
    },
};

function fallbackStatusLabel(status: string) {
    return status
        .toLowerCase()
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

export function getOrderStatusMeta(status: string | OrderStatusValue) {
    const value = String(status);
    return (
        STATUS_META[value] ?? {
            label: fallbackStatusLabel(value),
            badgeClassName: "bg-zinc-900 text-zinc-300 border-zinc-800",
            dotClassName: "bg-zinc-500",
        }
    );
}
