<script setup lang="ts">
import { computed, ref } from "vue";
import Searchbar from "@/features/shared/Searchbar.vue";
import { iconFor, iconLabel, searchIcons } from "../icons";

const { error } = defineProps<{
    error?: string;
}>();

const selected = defineModel<string | undefined>();

const search = ref("");
const results = computed(() => searchIcons(search.value));
</script>

<template>
    <fieldset class="flex flex-col gap-2">
        <legend class="mb-2 text-sm font-semibold">Icon <span class="text-danger">*</span></legend>

        <div class="flex items-center gap-2 text-sm">
            <template v-if="selected">
                <component :is="iconFor(selected)" class="text-primary size-6" />
                <span>{{ iconLabel(selected) }}</span>
            </template>
            <span v-else class="text-text-muted">No icon selected</span>
        </div>

        <Searchbar v-model="search" placeholder="Search icons..." class="border-border" />

        <div
            class="grid max-h-72 grid-cols-[repeat(auto-fill,minmax(5rem,1fr))] gap-2 overflow-y-auto p-1"
        >
            <button
                v-for="name in results"
                :key="name"
                type="button"
                :title="iconLabel(name)"
                class="focus-visible:ring-primary flex flex-col items-center gap-1 rounded-lg border p-2 text-center transition-colors outline-none focus-visible:ring-2"
                :class="
                    selected === name
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border text-text/65 hover:border-primary/40 hover:text-primary'
                "
                @click="selected = name"
            >
                <component :is="iconFor(name)" class="size-6" />
                <span class="w-full truncate text-[0.65rem]">{{ iconLabel(name) }}</span>
            </button>
        </div>

        <p v-if="results.length === 0" class="text-text-muted text-sm">
            No icons match "{{ search }}".
        </p>
        <p v-if="error" class="text-danger text-sm">{{ error }}</p>
    </fieldset>
</template>
