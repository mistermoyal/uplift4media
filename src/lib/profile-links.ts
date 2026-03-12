const platformBaseUrlMap: Record<string, string> = {
    INSTAGRAM: "https://www.instagram.com/",
    FACEBOOK: "https://www.facebook.com/",
    TIKTOK: "https://www.tiktok.com/@",
};

function toValidHttpUrl(value: string) {
    try {
        const parsed = new URL(value);
        if (parsed.protocol === "http:" || parsed.protocol === "https:") return parsed.toString();
        return null;
    } catch {
        return null;
    }
}

function extractHandle(value: string) {
    return value
        .trim()
        .replace(/^@+/, "")
        .replace(/^https?:\/\/(www\.)?(instagram|facebook|tiktok)\.com\/?/i, "")
        .replace(/^www\.(instagram|facebook|tiktok)\.com\/?/i, "")
        .split(/[/?#]/)[0]
        .trim();
}

export function getProfileUrl(platform?: string | null, target?: string | null) {
    if (!target) return null;

    const raw = target.trim();
    if (!raw) return null;

    const directUrl = toValidHttpUrl(raw);
    if (directUrl) return directUrl;

    const withHttps = toValidHttpUrl(`https://${raw}`);
    if (withHttps && /(instagram|facebook|tiktok)\.com/i.test(withHttps)) return withHttps;

    const handle = extractHandle(raw);
    if (!handle) return null;

    const baseUrl = platformBaseUrlMap[platform ?? ""] ?? platformBaseUrlMap.INSTAGRAM;
    return `${baseUrl}${encodeURIComponent(handle)}`;
}

export function getProfileDisplay(target?: string | null) {
    if (!target) return "";
    const handle = extractHandle(target);
    if (!handle) return "";
    return `@${handle}`;
}
