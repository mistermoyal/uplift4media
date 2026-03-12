export const platformValues = ["INSTAGRAM", "TIKTOK", "FACEBOOK", "OTHER"] as const;
export type PlatformValue = (typeof platformValues)[number];

export const priorityValues = ["LOW", "NORMAL", "HIGH", "URGENT"] as const;
export type PriorityValue = (typeof priorityValues)[number];

export const currencyValues = ["USD", "EUR", "CAD", "AED"] as const;
export type CurrencyValue = (typeof currencyValues)[number];

export const paymentMethodValues = ["BANK_TRANSFER", "CRYPTO", "CASH", "STRIPE", "PAYPAL", "OTHER"] as const;
export type PaymentMethodValue = (typeof paymentMethodValues)[number];

export const orderStatusValues = [
    "NEW_REQUEST",
    "QUALIFYING",
    "WAITING_QUOTE_APPROVAL",
    "QUOTE_ACCEPTED",
    "PAYMENT_PENDING",
    "PAYMENT_SENT_WAITING_RECEIPT",
    "READY_TO_START",
    "IN_PROGRESS",
    "WAITING_PROVIDER",
    "WAITING_CLIENT",
    "ON_HOLD",
    "COMPLETED",
    "FAILED",
    "CANCELLED",
] as const;
export type OrderStatusValue = (typeof orderStatusValues)[number];
