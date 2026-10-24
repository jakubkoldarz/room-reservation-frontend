<script setup lang="ts">
import { computed, ref, shallowRef, useTemplateRef, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { z } from "zod";
import apiClient from "@/api/client";
import { apiCall } from "@/api/apiCall";
import { apiErrorMessage } from "@/api/errors";
import EditHeader from "@/features/buildings/components/EditHeader.vue";
import AsideNavbarLayout from "@/features/layouts/AsideNavbarLayout.vue";
import ErrorText from "@/features/shared/ErrorText.vue";
import { useToastsStore } from "@/features/toasts/stores/useToastsStore";
import EditEquipment from "../components/EditEquipment.vue";
import { equipmentRoutes } from "../routes";
import type { Equipment } from "../types";

const route = useRoute();
const router = useRouter();
const toasts = useToastsStore();
const form = useTemplateRef("form");

const equipmentId = computed(() => {
    const parsed = z.string().uuid().safeParse(route.params.equipmentId);
    return parsed.success ? parsed.data : null;
});

const equipment = shallowRef<Equipment | null>(null);
const loadError = ref<string | null>(null);
const isLoading = ref(false);
const isSaving = ref(false);

async function load(id: string | null): Promise<void> {
    equipment.value = null;
    loadError.value = null;
    if (!id) {
        loadError.value = "Equipment not found.";
        return;
    }

    isLoading.value = true;
    const result = await apiCall(() =>
        apiClient.getEquipmentEquipmentId({ params: { equipmentId: id } }),
    );
    isLoading.value = false;

    if (result.ok) equipment.value = result.data;
    else loadError.value = apiErrorMessage(result.error);
}

watch(equipmentId, load, { immediate: true });

function goToList() {
    return router.push({ name: equipmentRoutes.list.name });
}

async function handleSave(): Promise<void> {
    const id = equipmentId.value;
    if (!id || isSaving.value) return;
    const values = await form.value?.submit();
    if (!values) return;

    isSaving.value = true;
    const result = await apiCall(() =>
        apiClient.putEquipmentEquipmentId(values, { params: { equipmentId: id } }),
    );
    isSaving.value = false;

    if (result.ok) {
        toasts.pushSuccess({
            title: "Success",
            message: `Equipment "${result.data.name}" updated`,
        });
        await goToList();
        return;
    }
    if (result.error.kind === "validation") form.value?.showServerErrors(result.error.fieldErrors);
    toasts.pushError({
        title: "Failed to update equipment",
        message: apiErrorMessage(result.error),
    });
}
</script>

<template>
    <AsideNavbarLayout>
        <div class="flex flex-col gap-4 pb-20">
            <ErrorText v-if="loadError" :error="loadError" />
            <template v-else>
                <EditHeader
                    :name="equipment?.name"
                    :is-loading="isLoading"
                    @save="handleSave"
                    @cancel="goToList"
                />
                <EditEquipment ref="form" :equipment>
                    Edit details of the equipment. Equipment is used as a part of the room
                    description.
                </EditEquipment>
            </template>
        </div>
    </AsideNavbarLayout>
</template>
