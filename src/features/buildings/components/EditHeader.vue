<script setup lang="ts">
import Badge from "@/features/shared/Badge.vue";
import BaseButton from "@/features/shared/BaseButton.vue";
import Container from "@/features/shared/Container.vue";
import OutlineButton from "@/features/shared/OutlineButton.vue";
import Skeleton from "@/features/shared/Skeleton.vue";
import { CheckIcon, XMarkIcon } from "@heroicons/vue/24/solid";

const props = defineProps<{
    name?: string;
    isLoading?: boolean;
}>();

const emit = defineEmits<{
    cancel: [];
    save: [];
}>();
</script>

<template>
    <Container v-if="!isLoading" class="@container sticky top-2 py-3 sm:py-3">
        <div class="flex flex-col @sm:flex-row @sm:items-center gap-2 justify-between">
            <div class="flex items-center gap-2 min-w-0 flex-1">
                <Badge text="Editing" type="warning" class="shrink-0" />
                <h1 class="sm:text-lg font-bold truncate min-w-0">
                    {{ name }}
                </h1>
            </div>
            <div class="flex gap-2 shrink-0">
                <OutlineButton @click="emit('cancel')" class="py-1 rounded-lg">
                    <XMarkIcon class="size-5" /> Cancel
                </OutlineButton>
                <BaseButton @click="emit('save')" class="py-1 rounded-lg">
                    <CheckIcon class="size-5" /> Save changes
                </BaseButton>
            </div>
        </div>
    </Container>

    <Container v-else class="@container py-2">
        <div class="flex flex-col @sm:flex-row @sm:items-center gap-2 justify-between">
            <Skeleton class="w-full" />
            <Skeleton />
        </div>
    </Container>
</template>
