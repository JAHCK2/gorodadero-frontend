"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface CatalogSyncOptions {
    /** Periodic interval in milliseconds for gentle foreground revalidation (default: 60s) */
    intervalMs?: number;
    /** Minimum throttle between refresh calls in milliseconds (default: 15s) */
    minThrottleMs?: number;
}

/**
 * Hook to keep open client sessions synchronized with backend catalog changes (ISR).
 * Triggers router.refresh() when the tab returns to foreground (tab switch, phone unlock)
 * and at gentle periodic intervals while visible.
 */
export function useCatalogSync({
    intervalMs = 60_000,
    minThrottleMs = 15_000,
}: CatalogSyncOptions = {}) {
    const router = useRouter();
    const lastRefreshRef = useRef<number>(Date.now());

    useEffect(() => {
        const triggerRefresh = () => {
            if (typeof document === "undefined") return;
            // Never execute requests when the page/screen is hidden in the background
            if (document.visibilityState !== "visible") return;

            const now = Date.now();
            if (now - lastRefreshRef.current < minThrottleMs) return;

            lastRefreshRef.current = now;
            router.refresh();
        };

        // 1. Re-validate upon returning to foreground / phone unlock
        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible") {
                triggerRefresh();
            }
        };

        // 2. Re-validate upon window focus
        const handleWindowFocus = () => {
            triggerRefresh();
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        window.addEventListener("focus", handleWindowFocus);

        // 3. Gentle foreground periodic polling (only active while tab is visible)
        const intervalId = setInterval(() => {
            if (document.visibilityState === "visible") {
                triggerRefresh();
            }
        }, intervalMs);

        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            window.removeEventListener("focus", handleWindowFocus);
            clearInterval(intervalId);
        };
    }, [router, intervalMs, minThrottleMs]);
}
