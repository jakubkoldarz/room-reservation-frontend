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
    <Container v-if="!isLoading" class="@container sticky top-0 z-10 py-3 sm:py-3">
        <div class="flex flex-col justify-between gap-2 @sm:flex-row @sm:items-center">
            <div class="flex min-w-0 flex-1 items-center gap-2">
                <Badge type="warning" class="shrink-0">Editing</Badge>
                <h1 class="min-w-0 truncate font-bold sm:text-lg">
                    {{ name }}
                </h1>
            </div>
            <div class="flex shrink-0 gap-2">
                <OutlineButton @click="emit('cancel')" class="rounded-lg py-1">
                    <XMarkIcon class="size-5" /> Cancel
                </OutlineButton>
                <BaseButton @click="emit('save')" class="rounded-lg py-1">
                    <CheckIcon class="size-5" /> Save changes
                </BaseButton>
            </div>
        </div>
    </Container>

    <Container v-else class="@container py-4 sm:py-4">
        <div class="flex flex-col justify-between gap-2 @sm:flex-row @sm:items-center">
            <Skeleton class="w-full" />
            <Skeleton class="" />
        </div>
    </Container>
</template>
