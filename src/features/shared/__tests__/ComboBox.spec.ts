import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { mount, type VueWrapper } from "@vue/test-utils";
import ComboBox from "../ComboBox.vue";
import MultiSelect from "../MultiSelect.vue";

const OPTIONS = [
    { value: "a", label: "A-101" },
    { value: "b", label: "B-202" },
];

let wrapper: VueWrapper | undefined;

beforeAll(() => {
    Element.prototype.scrollIntoView = vi.fn();
});

afterEach(() => {
    wrapper?.unmount();
    wrapper = undefined;
});

function mountComboBox(modelValue: string): VueWrapper {
    wrapper = mount(ComboBox, {
        props: {
            options: OPTIONS,
            modelValue,
            "onUpdate:modelValue": (value: string) => wrapper?.setProps({ modelValue: value }),
        },
        attachTo: document.body,
    });
    return wrapper;
}

function mountMultiSelect(modelValue: string[]): VueWrapper {
    wrapper = mount(MultiSelect, {
        props: {
            options: OPTIONS,
            modelValue,
            "onUpdate:modelValue": (value: string[]) => wrapper?.setProps({ modelValue: value }),
        },
        attachTo: document.body,
    });
    return wrapper;
}

function isExpanded(w: VueWrapper): boolean {
    return w.find('[role="combobox"]').attributes("aria-expanded") === "true";
}

describe("ComboBox", () => {
    it("X przy aktywnym polu czyści wartość i od razu pokazuje listę", async () => {
        const w = mountComboBox("a");
        const input = w.find("input");
        await input.trigger("focus");
        await input.trigger("keydown", { key: "Escape" });
        expect(isExpanded(w)).toBe(false);

        await w.find('[aria-label="Clear selection"]').trigger("click");

        expect(w.emitted("update:modelValue")).toContainEqual([""]);
        expect(isExpanded(w)).toBe(true);
        expect((input.element as HTMLInputElement).value).toBe("");
        expect(w.findAll('[role="option"]')).toHaveLength(OPTIONS.length);
    });

    it("kliknięcie w aktywne pole po wyborze opcji otwiera listę ponownie", async () => {
        const w = mountComboBox("");
        const input = w.find("input");
        await input.trigger("focus");
        await w.findAll('[role="option"]')[1]!.trigger("click");
        expect(isExpanded(w)).toBe(false);

        await input.trigger("click");

        expect(isExpanded(w)).toBe(true);
    });

    it("Escape przy zamkniętej liście czyści wartość bez otwierania", async () => {
        const w = mountComboBox("a");
        const input = w.find("input");
        await input.trigger("focus");
        await input.trigger("keydown", { key: "Escape" });

        await input.trigger("keydown", { key: "Escape" });

        expect(w.emitted("update:modelValue")).toContainEqual([""]);
        expect(isExpanded(w)).toBe(false);
    });
});

describe("MultiSelect", () => {
    it("X czyści wybór i zostawia otwartą listę", async () => {
        const w = mountMultiSelect(["a", "b"]);
        const input = w.find("input");
        await input.trigger("focus");
        expect(isExpanded(w)).toBe(true);

        await w.find('[aria-label="Clear selection"]').trigger("click");

        expect(w.emitted("update:modelValue")).toContainEqual([[]]);
        expect(isExpanded(w)).toBe(true);
    });

    it("X przy zamkniętej liście otwiera ją", async () => {
        const w = mountMultiSelect(["a"]);
        const input = w.find("input");
        await input.trigger("focus");
        await input.trigger("keydown", { key: "Escape" });
        expect(isExpanded(w)).toBe(false);

        await w.find('[aria-label="Clear selection"]').trigger("click");

        expect(isExpanded(w)).toBe(true);
    });

    it("kliknięcie w aktywne pole po zamknięciu listy otwiera ją ponownie", async () => {
        const w = mountMultiSelect([]);
        const input = w.find("input");
        await input.trigger("focus");
        await input.trigger("keydown", { key: "Escape" });

        await input.trigger("click");

        expect(isExpanded(w)).toBe(true);
    });
});
