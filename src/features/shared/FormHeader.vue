<script setup lang="ts">
import { computed } from "vue";
import { CheckIcon, XMarkIcon } from "@heroicons/vue/24/solid";
import Badge from "./Badge.vue";
import BaseButton from "./BaseButton.vue";
import Container from "./Container.vue";
import OutlineButton from "./OutlineButton.vue";
import Skeleton from "./Skeleton.vue";

const {
    mode,
    title,
    isLoading = false,
    isSaving = false,
} = defineProps<{
    mode: "create" | "edit";
    title?: string;
    isLoading?: boolean;
    isSaving?: boolean;
}>();

const emit = defineEmits<{
    cancel: [];
    save: [];
}>();

const isCreate = computed(() => mode === "create");
</script>

<template>
    <Container class="py-3 sm:sticky sm:top-0 sm:z-10 sm:py-3">
        <div class="flex items-center justify-between gap-4">
            <div class="flex min-w-0 flex-1 items-center gap-2">
                <Badge :type="isCreate ? 'success' : 'warning'" class="shrink-0">
                    {{ isCreate ? "Creating" : "Editing" }}
                </Badge>
                <Skeleton v-if="isLoading" class="w-40" />
                <h1 v-else-if="title" class="min-w-0 truncate font-bold sm:text-lg" :title>
                    {{ title }}
                </h1>
            </div>

            <div
                class="bg-surface border-border fixed inset-x-0 bottom-0 z-20 flex gap-2 border-t p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-[0_-4px_12px_rgb(0_0_0/0.06)] sm:static sm:z-auto sm:shrink-0 sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none"
            >
                <OutlineButton
                    class="flex-1 justify-center rounded-lg py-2! sm:flex-none sm:py-1!"
                    :disabled="isSaving"
                    @click="emit('cancel')"
                >
                    <XMarkIcon class="size-5" /> Cancel
                </OutlineButton>
                <BaseButton
                    class="flex-1 justify-center rounded-lg py-2! sm:flex-none sm:py-1!"
                    :is-loading="isSaving"
                    :disabled="isLoading"
                    @click="emit('save')"
                >
                    <CheckIcon v-if="!isSaving" class="size-5" />
                    {{ isCreate ? "Create" : "Save changes" }}
                </BaseButton>
            </div>
        </div>
    </Container>
</template>
