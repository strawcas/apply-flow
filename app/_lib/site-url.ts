import "server-only";

export function siteUrl() {
    const configured = process.env.NEXT_PUBLIC_SITE_URL;
    if (!configured && process.env.NODE_ENV === "production") {
        throw new Error("Set NEXT_PUBLIC_SITE_URL to the public ApplyFlow URL.");
    }
    const url = new URL(configured || "http://localhost:3000");
    if (url.protocol !== "https:" && !(url.protocol === "http:" && ["localhost", "127.0.0.1"].includes(url.hostname))) {
        throw new Error("NEXT_PUBLIC_SITE_URL must use HTTPS (except on localhost).");
    }
    return url.origin;
}
