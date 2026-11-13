import { ref } from "vue";
import type { ApiResult } from "@/api/apiCall";
import { useConfirm } from "@/features/modal/composables/useConfirm";
import type { Role } from "../types";
import { isDefaultRoleConflict } from "../utils/roleErrors";

export function useRoleSave() {
    const confirm = useConfirm();
    const isSaving = ref(false);

    async function save(
        send: (force: boolean) => Promise<ApiResult<Role>>,
    ): Promise<ApiResult<Role> | null> {
        if (isSaving.value) return null;

        isSaving.value = true;
        const firstResult = await send(false);
        isSaving.value = false;

        if (firstResult.ok) return firstResult;
        if (!isDefaultRoleConflict(firstResult.error)) return firstResult;

        const confirmed = await confirm({
            title: "Replace the default role?",
            message:
                "Another role is already the default one. Only one role can be given to new accounts, so the other role will stop being the default.",
            confirmText: "Make default",
        });
        if (!confirmed) return null;

        isSaving.value = true;
        const forcedResult = await send(true);
        isSaving.value = false;
        return forcedResult;
    }

    return { save, isSaving };
}
