<script setup lang="ts">
import { UserIcon } from "@heroicons/vue/24/outline";
import IconButton from "./IconButton.vue";
import Logo from "./Logo.vue";
import Searchbar from "./Searchbar.vue";
import { Bars4Icon, MagnifyingGlassIcon } from "@heroicons/vue/24/solid";
import { nextTick, ref } from "vue";

const isMobileSearchOpen = ref(false);
const searchbarRef = ref<InstanceType<typeof Searchbar>>();

function toggleMobileSearch() {
    isMobileSearchOpen.value = !isMobileSearchOpen.value;
    if (isMobileSearchOpen.value) {
        nextTick(() => searchbarRef.value?.focus());
    }
}
</script>

<template>
    <nav class="bg-secondary text-text-secondary px-4 py-2 items-center flex h-12">
        <IconButton class="size-8 md:hidden block mr-2">
            <Bars4Icon />
        </IconButton>
        <Logo :class="[!isMobileSearchOpen ? 'flex' : 'hidden', 'sm:flex']" />
        <div :class="[isMobileSearchOpen ? 'pr-2' : 'px-4', 'sm:px-4 grow flex justify-center']">
            <Searchbar
                ref="searchbarRef"
                :class="[
                    isMobileSearchOpen ? 'flex' : 'hidden',
                    'sm:flex w-full max-w-175 border-border-secondary bg-secondary-hover',
                ]"
                placeholder="Search rooms..."
            />
        </div>
        <div class="flex gap-2">
            <IconButton @click="toggleMobileSearch" class="size-6 block sm:hidden">
                <MagnifyingGlassIcon />
            </IconButton>
            <IconButton @click="console.log('przycisk')" class="size-6">
                <UserIcon />
            </IconButton>
        </div>
    </nav>
</template>
