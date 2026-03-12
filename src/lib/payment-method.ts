import type { PaymentMethodValue } from "@/lib/client-enums";

export const paymentMethodLabelMap: Record<PaymentMethodValue, string> = {
    BANK_TRANSFER: "Bank transfer",
    CRYPTO: "Crypto",
    CASH: "Cash",
    STRIPE: "Stripe",
    PAYPAL: "PayPal",
    OTHER: "Other",
};

export function getPaymentMethodLabel(paymentMethod: string) {
    return paymentMethodLabelMap[paymentMethod as PaymentMethodValue] ?? paymentMethod.replace(/_/g, " ").toLowerCase();
}
