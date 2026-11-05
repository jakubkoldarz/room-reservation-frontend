import { afterEach, describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import SegmentedInput from "../components/SegmentedInput.vue";

function mountInput(modelValue = "") {
    const wrapper = mount(SegmentedInput, {
        props: {
            segments: 6,
            modelValue,
            "onUpdate:modelValue": (value: string) => wrapper.setProps({ modelValue: value }),
        },
        attachTo: document.body,
    });
    return wrapper;
}

function values(wrapper: ReturnType<typeof mountInput>): string[] {
    return wrapper.findAll("input").map((input) => (input.element as HTMLInputElement).value);
}

describe("SegmentedInput", () => {
    let wrapper: ReturnType<typeof mountInput>;

    afterEach(() => wrapper.unmount());

    it("wpisanie cyfry przenosi fokus dalej, litery są ignorowane", async () => {
        wrapper = mountInput();
        const inputs = wrapper.findAll("input");

        await inputs[0].setValue("a");
        expect(values(wrapper)[0]).toBe("");

        await inputs[0].setValue("4");
        expect(document.activeElement).toBe(inputs[1].element);
        expect(wrapper.props("modelValue")).toBe("4");
    });

    it("wklejenie pełnego kodu wypełnia wszystkie pola i emituje complete", async () => {
        wrapper = mountInput();
        const inputs = wrapper.findAll("input");

        await inputs[2].trigger("paste", { clipboardData: { getData: () => "12 34 56 78" } });

        expect(values(wrapper)).toEqual(["1", "2", "3", "4", "5", "6"]);
        expect(wrapper.emitted("complete")).toEqual([["123456"]]);
    });

    it("backspace na pustym polu czyści poprzednie", async () => {
        wrapper = mountInput("12");
        const inputs = wrapper.findAll("input");

        await inputs[2].trigger("keydown", { key: "Backspace" });

        expect(wrapper.props("modelValue")).toBe("1");
        expect(document.activeElement).toBe(inputs[1].element);
    });

    it("wyczyszczenie modelu z zewnątrz czyści pola", async () => {
        wrapper = mountInput("123456");
        await wrapper.setProps({ modelValue: "" });
        expect(values(wrapper)).toEqual(["", "", "", "", "", ""]);
    });
});
