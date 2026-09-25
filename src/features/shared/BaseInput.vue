<script setup lang="ts" generic="T extends string | number">
import { useId } from "vue";
defineOptions({ inheritAttrs: false });

const slots = defineSlots<{
    icon?(): any;
}>();

const props = defineProps<{
    label?: string;
    floatingLabel?: boolean;
    errorMessage?: string;
    type?: string;
    placeholder?: string;
    isSlim?: boolean;
    hasIcon?: boolean;
    isRequired?: boolean;
}>();

const emit = defineEmits<{
    focus: [];
}>();

const model = defineModel<T | null>();
const inputId = useId();
const errorId = `${inputId}-error`;
</script>

<template>
    <div class="flex flex-col gap-1 group">
        <label v-if="!floatingLabel && label" :for="inputId" class="text-sm font-semibold">
            <span>
                {{ label }}
            </span>
            <span v-if="isRequired" class="text-danger"> * </span>
        </label>
        <div class="relative">
            <div class="size-5 absolute left-2 top-1/2 translate-y-[-50%] text-border group-focus-within:text-primary">
                <slot name="icon" />
            </div>
            <input
                :id="inputId"
                v-model="model"
                v-bind="$attrs"
                :type="type ?? 'text'"
                :placeholder="placeholder ?? ' '"
                :aria-invalid="!!errorMessage"
                :aria-describedby="errorMessage ? errorId : undefined"
                @focus="emit('focus')"
                spellcheck="false"
                class="peer border text-text rounded px-2 w-full outline-none focus-visible:ring-2 focus-visible:ring-primary"
                :class="[
                    errorMessage ? 'border-danger' : 'border-border',
                    isSlim ? 'py-1 text-sm' : 'py-1',
                    hasIcon ? 'pl-8' : '',
                ]"
            />

            <label
                v-if="floatingLabel && label"
                :for="inputId"
                class="peer-placeholder-shown:text-sm text-xs peer-placeholder-shown:top-1/2 font-medium text-text-muted absolute top-0 peer-placeholder-shown:px-0 px-1 -translate-y-1/2 bg-surface placeholder-shown:text-xs transition-all"
                :class="[hasIcon ? 'peer-placeholder-shown:left-8 left-7' : 'peer-placeholder-shown:left-2 left-2']"
            >
                {{ label }}
            </label>
        </div>

        <p v-if="errorMessage" :id="errorId" class="text-danger text-sm">
            {{ errorMessage }}
        </p>
    </div>
</template>
