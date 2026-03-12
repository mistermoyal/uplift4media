const SUPPORTED = ["USD", "EUR", "CAD", "AED"] as const;

type SupportedCurrency = typeof SUPPORTED[number];

type FxRates = Record<SupportedCurrency, number>;

const FALLBACK_RATES: FxRates = {
    USD: 1,
    EUR: 0.92,
    CAD: 1.35,
    AED: 3.67,
};

export async function getUsdRates(): Promise<FxRates> {
    try {
        const response = await fetch(
            "https://api.frankfurter.app/latest?from=USD&to=EUR,CAD,AED",
            { next: { revalidate: 3600 } }
        );

        if (!response.ok) return FALLBACK_RATES;

        const data = await response.json();
        const rates = data?.rates ?? {};

        return {
            USD: 1,
            EUR: Number(rates.EUR) || FALLBACK_RATES.EUR,
            CAD: Number(rates.CAD) || FALLBACK_RATES.CAD,
            AED: Number(rates.AED) || FALLBACK_RATES.AED,
        };
    } catch {
        return FALLBACK_RATES;
    }
}

export function convertToUsd(amount: number, currency: SupportedCurrency, usdRates: FxRates) {
    const rate = usdRates[currency] || 1;
    return amount / rate;
}

export function convertUsdToEur(amountUsd: number, usdRates: FxRates) {
    return amountUsd * usdRates.EUR;
}
