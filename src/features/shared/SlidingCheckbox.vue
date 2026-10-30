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
    <label :for="id" class="flex cursor-pointer items-center gap-2">
        <input :id="id" v-bind="$attrs" type="checkbox" v-model="checked" class="peer sr-only" />

        <p v-if="props.label" class="text-text-muted text-sm select-none">{{ props.label }}</p>

        <div
            class="peer-focus-visible:ring-primary relative h-4 w-8 shrink-0 rounded-full border transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-offset-1"
            :class="checked ? 'bg-success/15 border-success/40' : 'bg-text-muted/10 border-border'"
        >
            <span
                class="absolute top-1/2 left-px size-3 -translate-y-1/2 rounded-full transition-all"
                :class="checked ? 'bg-success translate-x-4' : 'bg-text-muted/50 translate-x-0'"
            ></span>
        </div>
    </label>
</template>
