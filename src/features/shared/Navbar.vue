<script setup lang="ts">
import { UserIcon } from "@heroicons/vue/24/outline";
import IconButton from "./IconButton.vue";
import Logo from "./Logo.vue";
import Searchbar from "./Searchbar.vue";
import { MagnifyingGlassIcon } from "@heroicons/vue/24/solid";
import { ref } from "vue";

const isMobileSearchOpen = ref(false);
</script>

<template>
    <nav class="bg-secondary text-text-secondary px-4 py-2 items-center flex h-12">
        <Logo :class="[!isMobileSearchOpen ? 'flex' : 'hidden', 'sm:flex']" />
        <div :class="[isMobileSearchOpen ? 'pr-2' : 'px-4', 'sm:px-4 grow flex justify-center']">
            <Searchbar
                :class="[isMobileSearchOpen ? 'flex' : 'hidden', 'sm:flex w-full max-w-125']"
                placeholder="Search rooms..."
            />
        </div>
        <div class="flex gap-2">
            <IconButton @click="isMobileSearchOpen = !isMobileSearchOpen" class="size-6 block sm:hidden">
                <MagnifyingGlassIcon />
            </IconButton>
            <IconButton @click="console.log('przycisk')" class="size-6">
                <UserIcon />
            </IconButton>
        </div>
    </nav>
</template>
