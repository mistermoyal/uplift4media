import { PaymentMethod } from "@prisma/client";

export const paymentMethodLabelMap: Record<PaymentMethod, string> = {
    BANK_TRANSFER: "Bank transfer",
    CRYPTO: "Crypto",
    CASH: "Cash",
    STRIPE: "Stripe",
    PAYPAL: "PayPal",
    OTHER: "Other",
};

export function getPaymentMethodLabel(paymentMethod: string) {
    return paymentMethodLabelMap[paymentMethod as PaymentMethod] ?? paymentMethod.replace(/_/g, " ").toLowerCase();
}
