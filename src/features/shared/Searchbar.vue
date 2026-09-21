<script setup lang="ts">
import { MagnifyingGlassIcon } from "@heroicons/vue/24/solid";
import { ref, useId } from "vue";

const model = defineModel<string>();
const inputId = useId();
const inputRef = ref<HTMLInputElement>();

const props = defineProps<{
    placeholder?: string;
}>();

defineExpose({
    focus: () => inputRef.value?.focus(),
});
</script>

<template>
    <div class="relative">
        <div
            class="size-5 absolute left-2 top-1/2 translate-y-[-50%] text-text-muted-secondary group-focus-within:text-primary"
        >
            <MagnifyingGlassIcon />
        </div>
        <input
            :id="inputId"
            v-model="model"
            v-bind="$attrs"
            type="text"
            ref="inputRef"
            :placeholder="placeholder"
            spellcheck="false"
            class="peer border text-sm py-1 pl-8 rounded-md px-1 w-full outline-none focus-visible:ring-2 focus-visible:ring-primary placeholder:text-text-muted-secondary"
        />
    </div>
</template>
