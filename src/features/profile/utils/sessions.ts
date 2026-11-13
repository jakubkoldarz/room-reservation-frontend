import type { RefreshToken } from "@/features/auth/types";
import type { SessionDevice } from "../types";

type NamedPattern = {
    pattern: RegExp;
    name: string;
};

const BROWSERS: NamedPattern[] = [
    { pattern: /Edg(e|A|iOS)?\//, name: "Edge" },
    { pattern: /OPR\/|Opera/, name: "Opera" },
    { pattern: /Firefox\/|FxiOS\//, name: "Firefox" },
    { pattern: /Chrome\/|CriOS\//, name: "Chrome" },
    { pattern: /Safari\//, name: "Safari" },
];

const SYSTEMS: NamedPattern[] = [
    { pattern: /Windows/, name: "Windows" },
    { pattern: /iPhone|iPad|iPod/, name: "iOS" },
    { pattern: /Macintosh|Mac OS X/, name: "macOS" },
    { pattern: /Android/, name: "Android" },
    { pattern: /Linux/, name: "Linux" },
];

function firstMatch(value: string, patterns: NamedPattern[]): string | null {
    for (const item of patterns) {
        if (item.pattern.test(value)) return item.name;
    }
    return null;
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
    if (device.browser) return device.browser;
    if (device.os) return device.os;
    return "Unknown device";
}

export function sortSessions(sessions: readonly RefreshToken[]): RefreshToken[] {
    return [...sessions].sort((a, b) => Date.parse(b.created) - Date.parse(a.created));
}

export function currentSessionId(
    sessions: readonly RefreshToken[],
    userAgent: string,
): string | null {
    for (const session of sortSessions(sessions)) {
        if (session.userAgent === userAgent) return session.id;
    }
    return null;
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
