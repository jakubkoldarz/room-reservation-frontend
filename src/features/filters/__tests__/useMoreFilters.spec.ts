import { describe, expect, it, vi } from "vitest";
import { ref } from "vue";
import { useMoreFilters } from "../composables/useMoreFilters";
import { defineFilters, type FilterValues } from "../types";

const filters = defineFilters([
    { key: "street", type: "text", placeholder: "Street" },
    { key: "postalCode", type: "text", placeholder: "Postal code" },
]);

type Key = (typeof filters)[number]["key"];

describe("useMoreFilters", () => {
    it("liczy tylko niepuste filtry z panelu", () => {
        const values = ref<FilterValues<Key> & { name: string }>({
            name: "hall",
            street: "Main",
            postalCode: "",
        });
        const { activeCount } = useMoreFilters(filters, values, vi.fn());

        expect(activeCount.value).toBe(1);
        values.value = { ...values.value, postalCode: "90-001" };
        expect(activeCount.value).toBe(2);
    });

    it("panel jest otwarty na starcie, gdy któryś filtr jest aktywny", () => {
        expect(useMoreFilters(filters, { street: "Main" }, vi.fn()).isOpen.value).toBe(true);
        expect(useMoreFilters(filters, {}, vi.fn()).isOpen.value).toBe(false);
    });

    it("clear czyści wszystkie filtry z panelu jednym wywołaniem", async () => {
        const setFilters = vi.fn().mockResolvedValue(undefined);
        const { clear } = useMoreFilters(filters, { street: "Main" }, setFilters);

        await clear();

        expect(setFilters).toHaveBeenCalledOnce();
        expect(setFilters).toHaveBeenCalledWith({ street: "", postalCode: "" });
    });
});
