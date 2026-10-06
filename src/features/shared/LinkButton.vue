<script setup lang="ts">
import type { RouteLocationRaw } from "vue-router";

const props = defineProps<{
    active?: boolean;
    to: RouteLocationRaw;
}>();
</script>

<template>
    <RouterLink :to="to" custom v-slot="{ isActive, href, navigate }">
        <a
            :href="href"
            @click="navigate"
            :aria-current="active === true || isActive ? 'page' : undefined"
            :class="[
                'w-full transition-all duration-75 border text-sm rounded-md px-3 py-2 items-center flex gap-2 [&_svg]:size-4 [&_svg]:shrink-0 outline-none focus-visible:ring-2 ring-offset-2 ring-primary',
                active === true || isActive
                    ? 'bg-primary/10 font-medium text-primary border-primary/20'
                    : 'bg-text-muted/10 text-text-muted border-text-muted/20 hover:border-primary/40 hover:text-primary hover:bg-primary/10',
            ]"
        >
            <slot />
        </a>
    </RouterLink>
</template>
