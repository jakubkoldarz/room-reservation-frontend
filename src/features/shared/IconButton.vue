<script setup lang="ts">
const emit = defineEmits<{
    click: [];
}>();

const props = withDefaults(
    defineProps<{
        type?: "plain" | "danger" | "warning" | "success";
    }>(),
    {
        type: "plain",
    },
);

function getTypeClasses(type: string) {
    switch (type) {
        case "danger":
            return "text-danger/80 hover:text-danger focus-visible:ring-danger border border-danger/40 p-0.5 rounded-lg bg-danger/10";
        case "warning":
            return "text-warning/80 hover:text-warning focus-visible:ring-warning border border-warning/40 p-0.5 rounded-lg bg-warning/10";
        case "success":
            return "text-success/80 hover:text-success focus-visible:ring-success border border-success/40 p-0.5 rounded-lg bg-success/10";
        default:
            return "focus-visible:ring-primary rounded-full hover:text-primary";
    }
}
</script>

<template>
    <button
        @click="emit('click')"
        v-bind="$attrs"
        :class="getTypeClasses(props.type)"
        class="cursor-pointer outline-none ring-offset-transparent focus-visible:ring-1 ring-offset-1 transition-all"
    >
        <slot />
    </button>
</template>
