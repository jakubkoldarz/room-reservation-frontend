<script setup lang="ts">
import { useId } from "vue";

defineOptions({ inheritAttrs: false });

const checked = defineModel<boolean>();
const id = useId();

const props = defineProps<{
    label?: string;
}>();
</script>

<template>
    <label :for="id" class="flex items-center gap-2">
        <input :id="id" v-bind="$attrs" type="checkbox" v-model="checked" class="sr-only peer" />

        <p v-if="props.label" class="text-sm text-text-muted select-none">{{ props.label }}</p>

        <div
            class="w-8 h-4 rounded-full bg-zinc-100 border border-border cursor-pointer relative peer-focus-visible:ring-2 peer-focus-visible:ring-primary peer-focus-visible:ring-offset-1 transition-all"
        >
            <span
                :class="[
                    checked ? 'translate-x-4 bg-success' : 'translate-x-0 bg-text-muted/50',
                    'absolute top-1/2 -translate-y-1/2 left-px size-3 bg-red-500 rounded-full transition-all',
                ]"
            ></span>
            <span class=""></span>
        </div>
    </label>
</template>
