<script setup lang="ts">
import { ref, useTemplateRef } from "vue";
import { useRouter } from "vue-router";
import apiClient from "@/api/client";
import { apiCall } from "@/api/apiCall";
import { apiErrorMessage } from "@/api/errors";
import CreateHeader from "@/features/buildings/components/CreateHeader.vue";
import AsideNavbarLayout from "@/features/layouts/AsideNavbarLayout.vue";
import { useToastsStore } from "@/features/toasts/stores/useToastsStore";
import EditEquipment from "../components/EditEquipment.vue";
import { equipmentRoutes } from "../routes";

const router = useRouter();
const toasts = useToastsStore();
const form = useTemplateRef("form");
const isSaving = ref(false);

function goToList() {
    return router.push({ name: equipmentRoutes.list.name });
}

async function handleSave(): Promise<void> {
    if (isSaving.value) return; // podwójne kliknięcie nie tworzy dwóch rekordów
    const values = await form.value?.submit();
    if (!values) return;

    isSaving.value = true;
    const result = await apiCall(() => apiClient.postEquipment(values));
    isSaving.value = false;

    if (result.ok) {
        toasts.pushSuccess({
            title: "Success",
            message: `Equipment "${result.data.name}" created`,
        });
        await goToList();
        return;
    }
    if (result.error.kind === "validation") form.value?.showServerErrors(result.error.fieldErrors);
    toasts.pushError({
        title: "Failed to create equipment",
        message: apiErrorMessage(result.error),
    });
}
</script>

<template>
    <AsideNavbarLayout>
        <div class="flex flex-col gap-4 pb-20">
            <CreateHeader @cancel="goToList" @save="handleSave" />
            <EditEquipment ref="form" is-new>
                Set details of the equipment. Please fill in all required fields. Equipment is used
                as a part of the room description.
            </EditEquipment>
        </div>
    </AsideNavbarLayout>
</template>
