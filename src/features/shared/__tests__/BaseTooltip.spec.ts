import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mount, type VueWrapper } from "@vue/test-utils";
import { nextTick } from "vue";
import BaseTooltip from "../BaseTooltip.vue";

function tooltip(): HTMLElement | null {
    return document.body.querySelector('[role="tooltip"]');
}

describe("BaseTooltip", () => {
    let wrapper: VueWrapper;

    beforeEach(() => {
        vi.useFakeTimers();
        wrapper = mount(BaseTooltip, {
            props: { text: "Monday: 08:00–16:00", delay: 80 },
            slots: { default: "<span>M</span>" },
            attachTo: document.body,
        });
    });

    afterEach(() => {
        wrapper.unmount();
        vi.useRealTimers();
    });

    it("mysz: pokazuje się po opóźnieniu i opisuje element", async () => {
        const trigger = wrapper.find("span");
        await trigger.trigger("pointerenter", { pointerType: "mouse" });
        expect(tooltip()).toBeNull();

        await vi.advanceTimersByTimeAsync(80);
        await nextTick();

        expect(tooltip()?.textContent).toContain("Monday: 08:00–16:00");
        expect(trigger.attributes("aria-describedby")).toBe(tooltip()?.id);
    });

    it("mysz: znika po zjechaniu kursorem", async () => {
        const trigger = wrapper.find("span");
        await trigger.trigger("pointerenter", { pointerType: "mouse" });
        await vi.advanceTimersByTimeAsync(80);
        await trigger.trigger("pointerleave", { pointerType: "mouse" });

        expect(tooltip()).toBeNull();
    });

    it("mysz: szybkie przejechanie kursorem nie pokazuje tooltipa", async () => {
        const trigger = wrapper.find("span");
        await trigger.trigger("pointerenter", { pointerType: "mouse" });
        await vi.advanceTimersByTimeAsync(40);
        await trigger.trigger("pointerleave", { pointerType: "mouse" });
        await vi.advanceTimersByTimeAsync(80);

        expect(tooltip()).toBeNull();
    });

    it("dotyk: tap pokazuje od razu, drugi tap chowa", async () => {
        const trigger = wrapper.find("span");
        await trigger.trigger("pointerup", { pointerType: "touch" });
        await vi.advanceTimersByTimeAsync(0);
        await nextTick();
        expect(tooltip()).not.toBeNull();

        await trigger.trigger("pointerup", { pointerType: "touch" });
        expect(tooltip()).toBeNull();
    });

    it("dotyk: tooltip znika sam po kilku sekundach", async () => {
        await wrapper.find("span").trigger("pointerup", { pointerType: "touch" });
        await vi.advanceTimersByTimeAsync(0);
        await nextTick();
        expect(tooltip()).not.toBeNull();

        await vi.advanceTimersByTimeAsync(3000);
        await nextTick();
        expect(tooltip()).toBeNull();
    });

    it("dotyk: tap obok chowa tooltip", async () => {
        await wrapper.find("span").trigger("pointerup", { pointerType: "touch" });
        await vi.advanceTimersByTimeAsync(0);
        await nextTick();

        document.body.dispatchEvent(new Event("pointerdown", { bubbles: true }));
        document.body.dispatchEvent(new Event("click", { bubbles: true }));
        await nextTick();

        expect(tooltip()).toBeNull();
    });

    it("Escape zamyka tooltip", async () => {
        await wrapper.find("span").trigger("focusin");
        await vi.advanceTimersByTimeAsync(80);
        window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
        await nextTick();

        expect(tooltip()).toBeNull();
    });
});
