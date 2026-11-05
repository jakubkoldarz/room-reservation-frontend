<script setup lang="ts">
import { EyeIcon, EyeSlashIcon, KeyIcon } from "@heroicons/vue/24/solid";
import { ref } from "vue";
import BaseInput from "@/features/shared/BaseInput.vue";

defineOptions({ inheritAttrs: false });

defineProps<{
    label: string;
    errorMessage?: string;
}>();

const model = defineModel<string>();
const isVisible = ref(false);
</script>

<template>
    <BaseInput
        v-model="model"
        v-bind="$attrs"
        :label
        :error-message
        :type="isVisible ? 'text' : 'password'"
        floating-label
        has-icon
    >
        <template #icon>
            <KeyIcon />
        </template>
        <template #suffix>
            <button
                type="button"
                class="text-text-muted hover:text-text focus-visible:ring-primary flex size-8 cursor-pointer items-center justify-center rounded outline-none focus-visible:ring-2"
                :aria-label="isVisible ? 'Hide password' : 'Show password'"
                :aria-pressed="isVisible"
                @click="isVisible = !isVisible"
            >
                <EyeSlashIcon v-if="isVisible" class="size-5" />
                <EyeIcon v-else class="size-5" />
            </button>
        </template>
    </BaseInput>
</template>
