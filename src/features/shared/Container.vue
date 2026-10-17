<script setup lang="ts"></script>

<template>
    <div v-bind="$attrs" class="border-border bg-surface rounded-md border p-4 shadow sm:p-6">
        <slot />
    </div>
</template>
