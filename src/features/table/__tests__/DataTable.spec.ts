import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import DataTable from "../components/DataTable.vue";
import type { Column, SortState } from "../types";

const COLUMNS: Column[] = [
    { key: "name", label: "Name", sortKey: "name" },
    { key: "city", label: "City" },
    { key: "delete" },
];

function mountTable(sort: SortState | null) {
    return mount(DataTable, {
        props: { columns: COLUMNS, items: [{ id: "1", name: "A" }], rowKey: "id", sort },
    });
}

describe("DataTable", () => {
    it("bez sort nagłówki są zwykłym tekstem", () => {
        const wrapper = mountTable(null);

        expect(wrapper.find("thead button").exists()).toBe(false);
        expect(wrapper.find("th").attributes("aria-sort")).toBeUndefined();
    });

    it("sortowalna kolumna ma przycisk i aria-sort, pozostałe nie", () => {
        const wrapper = mountTable({ by: "name", direction: "desc" });
        const headers = wrapper.findAll("th");

        expect(headers[0]!.attributes("aria-sort")).toBe("descending");
        expect(headers[0]!.find("button").exists()).toBe(true);
        expect(headers[1]!.attributes("aria-sort")).toBeUndefined();
        expect(headers[1]!.find("button").exists()).toBe(false);
    });

    it("kliknięcie nagłówka emituje klucz sortowania", async () => {
        const wrapper = mountTable({ by: "name", direction: "asc" });

        await wrapper.find("thead button").trigger("click");

        expect(wrapper.emitted("sort")).toEqual([["name"]]);
    });

    it("przycisk kierunku w pasku mobilnym emituje bieżące pole", async () => {
        const wrapper = mountTable({ by: "name", direction: "asc" });

        await wrapper.find('[aria-label="Sort descending"]').trigger("click");

        expect(wrapper.emitted("sort")).toEqual([["name"]]);
    });
});
