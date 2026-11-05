import { describe, expect, it } from "vitest";
import type { RefreshToken } from "@/features/auth/types";
import { currentSessionId, describeUserAgent, deviceLabel, sortSessions } from "../utils/sessions";

const CHROME_WINDOWS =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36";
const EDGE_WINDOWS = `${CHROME_WINDOWS} Edg/130.0.0.0`;
const SAFARI_IPHONE =
    "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1";
const FIREFOX_ANDROID = "Mozilla/5.0 (Android 14; Mobile; rv:131.0) Gecko/131.0 Firefox/131.0";

function session(id: string, created: string, userAgent: string | null): RefreshToken {
    return { id, created, expires: "2026-12-01T00:00:00Z", ipAddress: "127.0.0.1", userAgent };
}

describe("describeUserAgent", () => {
    it("rozpoznaje przeglądarkę i system (Edge przed Chrome, iOS przed macOS)", () => {
        expect(deviceLabel(describeUserAgent(CHROME_WINDOWS))).toBe("Chrome on Windows");
        expect(deviceLabel(describeUserAgent(EDGE_WINDOWS))).toBe("Edge on Windows");
        expect(describeUserAgent(SAFARI_IPHONE)).toEqual({
            browser: "Safari",
            os: "iOS",
            isMobile: true,
        });
        expect(deviceLabel(describeUserAgent(FIREFOX_ANDROID))).toBe("Firefox on Android");
    });

    it("nieznany albo pusty user agent", () => {
        expect(deviceLabel(describeUserAgent("PostmanRuntime/7.42.0"))).toBe("Unknown device");
        expect(deviceLabel(describeUserAgent(null))).toBe("Unknown device");
    });
});

describe("sesje", () => {
    const sessions = [
        session("old", "2026-11-01T10:00:00Z", CHROME_WINDOWS),
        session("phone", "2026-11-04T10:00:00Z", SAFARI_IPHONE),
        session("new", "2026-11-03T10:00:00Z", CHROME_WINDOWS),
    ];

    it("sortuje od najnowszej", () => {
        expect(sortSessions(sessions).map((s) => s.id)).toEqual(["phone", "new", "old"]);
    });

    it("bieżąca sesja to najnowsza z tym samym user agentem", () => {
        expect(currentSessionId(sessions, CHROME_WINDOWS)).toBe("new");
        expect(currentSessionId(sessions, EDGE_WINDOWS)).toBeNull();
    });
});
