<script setup lang="ts">
import BaseInput from "@/features/shared/BaseInput.vue";
import type { Filter } from "../types";
import { MagnifyingGlassIcon } from "@heroicons/vue/24/solid";
import { ref } from "vue";

const props = withDefaults(
    defineProps<{
        filters: Filter[];
    }>(),
    {
        filters: () => [],
    },
);

const values = ref<Record<string, string>>({});
</script>

<template>
    <div class="flex flex-wrap gap-2">
        <div v-for="filter in props.filters" :key="filter.key" class="flex items-center gap-2">
            <BaseInput v-if="filter.type === 'text'" type="text" :label="filter.placeholder" floating-label has-icon>
                <template #icon> <MagnifyingGlassIcon /> </template>
            </BaseInput>
        </div>
    </div>
</template>
