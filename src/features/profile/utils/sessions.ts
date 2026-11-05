import type { RefreshToken } from "@/features/auth/types";
import type { SessionDevice } from "../types";

const BROWSERS: [RegExp, string][] = [
    [/Edg(e|A|iOS)?\//, "Edge"],
    [/OPR\/|Opera/, "Opera"],
    [/Firefox\/|FxiOS\//, "Firefox"],
    [/Chrome\/|CriOS\//, "Chrome"],
    [/Safari\//, "Safari"],
];

const SYSTEMS: [RegExp, string][] = [
    [/Windows/, "Windows"],
    [/iPhone|iPad|iPod/, "iOS"],
    [/Macintosh|Mac OS X/, "macOS"],
    [/Android/, "Android"],
    [/Linux/, "Linux"],
];

function firstMatch(value: string, patterns: [RegExp, string][]): string | null {
    return patterns.find(([pattern]) => pattern.test(value))?.[1] ?? null;
}

export function describeUserAgent(userAgent: string | null | undefined): SessionDevice {
    const value = userAgent ?? "";
    const os = firstMatch(value, SYSTEMS);
    return {
        browser: firstMatch(value, BROWSERS),
        os,
        isMobile: os === "iOS" || os === "Android" || /Mobile/.test(value),
    };
}

export function deviceLabel(device: SessionDevice): string {
    if (device.browser && device.os) return `${device.browser} on ${device.os}`;
    return device.browser ?? device.os ?? "Unknown device";
}

export function sortSessions(sessions: readonly RefreshToken[]): RefreshToken[] {
    return [...sessions].sort((a, b) => Date.parse(b.created) - Date.parse(a.created));
}

export function currentSessionId(
    sessions: readonly RefreshToken[],
    userAgent: string,
): string | null {
    const matching = sortSessions(sessions).find((session) => session.userAgent === userAgent);
    return matching?.id ?? null;
}

const dateTimeFormat = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
});

export function formatSessionDate(value: string): string {
    return dateTimeFormat.format(new Date(value));
}
