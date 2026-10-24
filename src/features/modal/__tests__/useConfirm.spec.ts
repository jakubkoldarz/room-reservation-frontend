import { describe, expect, it } from "vitest";
import { useConfirm, useConfirmDialogState } from "../composables/useConfirm";

const options = { title: "Delete?", message: "Sure?" };

describe("useConfirm", () => {
    it("otwiera dialog i zwraca true po potwierdzeniu", async () => {
        const confirm = useConfirm();
        const dialog = useConfirmDialogState();

        const answer = confirm(options);
        expect(dialog.pending.value?.options).toEqual(options);

        dialog.answer(true);
        expect(await answer).toBe(true);
        expect(dialog.pending.value).toBeNull();
    });

    it("zwraca false po anulowaniu", async () => {
        const answer = useConfirm()(options);
        useConfirmDialogState().answer(false);
        expect(await answer).toBe(false);
    });

    it("nowe pytanie zamyka poprzednie jako „Anuluj”", async () => {
        const confirm = useConfirm();
        const first = confirm(options);
        const second = confirm({ title: "Second", message: "?" });

        expect(await first).toBe(false);
        expect(useConfirmDialogState().pending.value?.options.title).toBe("Second");

        useConfirmDialogState().answer(true);
        expect(await second).toBe(true);
    });

    it("drugie zamknięcie (np. zdarzenie close po kliknięciu) nic nie psuje", async () => {
        const answer = useConfirm()(options);
        const dialog = useConfirmDialogState();
        dialog.answer(true);
        dialog.answer(false);
        expect(await answer).toBe(true);
    });
});
