<script setup lang="ts">
defineOptions({ inheritAttrs: false });

import { useId } from "vue";

const slots = defineSlots<{
    icon?(): any;
}>();

const props = defineProps<{
    label: string;
    errorMessage?: string;
    type?: string;
    placeholder?: string;
}>();

const model = defineModel<string>();
const inputId = useId();
const errorId = `${inputId}-error`;
</script>

<template>
    <div class="flex flex-col gap-1 group">
        <div class="relative">
            <div class="size-5 absolute left-2 top-1/2 translate-y-[-50%] text-border group-focus-within:text-primary">
                <slot name="icon" />
            </div>
            <input
                :id="inputId"
                v-model="model"
                v-bind="$attrs"
                :type="type ?? 'text'"
                placeholder=" "
                :aria-invalid="!!errorMessage"
                :aria-describedby="errorMessage ? errorId : undefined"
                spellcheck="false"
                class="peer border pl-8 rounded px-1 py-2 w-full outline-none focus-visible:ring-2 focus-visible:ring-primary"
                :class="errorMessage ? 'border-danger' : 'border-border'"
            />

            <label
                :for="inputId"
                class="peer-placeholder-shown:text-sm text-xs peer-placeholder-shown:top-1/2 font-medium text-text-muted absolute left-7 top-0 peer-placeholder-shown:px-0 px-1 -translate-y-1/2 bg-surface placeholder-shown:text-xs transition-all peer-placeholder-shown:left-8"
            >
                {{ label }}
            </label>
        </div>

        <p v-if="errorMessage" :id="errorId" class="text-danger text-sm">
            {{ errorMessage }}
        </p>
    </div>
</template>
