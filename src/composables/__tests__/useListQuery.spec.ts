import { describe, expect, it } from "vitest";
import { defineComponent } from "vue";
import { mount } from "@vue/test-utils";
import { createMemoryHistory, createRouter, type Router } from "vue-router";
import { z } from "zod";
import { pageParam, textParam, useListQuery } from "../useListQuery";

const Schema = z.object({ page: pageParam, name: textParam, city: textParam });

async function setup(path: string) {
    const router: Router = createRouter({
        history: createMemoryHistory(),
        routes: [{ path: "/list", component: { render: () => null } }],
    });
    await router.push(path);
    await router.isReady();

    let result: ReturnType<typeof useListQuery<z.infer<typeof Schema>>> | undefined;
    mount(
        defineComponent({
            setup() {
                result = useListQuery(Schema);
                return () => null;
            },
        }),
        { global: { plugins: [router] } },
    );
    if (!result) throw new Error("composable did not run");
    return { router, list: result };
}

describe("useListQuery", () => {
    it("parsuje poprawny URL", async () => {
        const { list } = await setup("/list?page=3&name=hall");
        expect(list.query.value).toEqual({ page: 3, name: "hall", city: "" });
    });

    it("śmieci w URL → wartości domyślne zamiast wyjątku", async () => {
        const { list } = await setup("/list?page=abc&name");
        expect(list.query.value).toEqual({ page: 1, name: "", city: "" });
    });

    it("powtórzony klucz → pierwsza wartość", async () => {
        const { list } = await setup("/list?page=2&page=5&name=a&name=b");
        expect(list.query.value).toMatchObject({ page: 2, name: "a" });
    });

    it("setFilter ustawia filtr, resetuje stronę i zostawia obce klucze", async () => {
        const { router, list } = await setup("/list?page=4&tab=rooms");
        await list.setFilter("name", "hall");
        expect(router.currentRoute.value.query).toEqual({ name: "hall", tab: "rooms" });
        expect(list.query.value).toEqual({ page: 1, name: "hall", city: "" });
    });

    it("wartości domyślne nie trafiają do URL", async () => {
        const { router, list } = await setup("/list?name=hall&page=2");
        await list.setFilter("name", "");
        expect(router.currentRoute.value.query).toEqual({});
    });

    it("setPage zmienia tylko stronę", async () => {
        const { router, list } = await setup("/list?name=hall");
        await list.setPage(3);
        expect(router.currentRoute.value.query).toEqual({ name: "hall", page: "3" });
    });

    it("clampPage przenosi na ostatnią stronę tylko, gdy bieżąca wyszła poza zakres", async () => {
        const { router, list } = await setup("/list?page=9");
        await list.clampPage(4);
        expect(list.query.value.page).toBe(4);

        await list.clampPage(10);
        expect(list.query.value.page).toBe(4);

        await list.clampPage(0); // brak wyników — nic nie rób
        expect(router.currentRoute.value.query).toEqual({ page: "4" });
    });

    it("resetFilters czyści filtry i stronę", async () => {
        const { router, list } = await setup("/list?page=2&name=hall&city=Lodz&tab=rooms");
        await list.resetFilters();
        expect(router.currentRoute.value.query).toEqual({ tab: "rooms" });
    });
});
