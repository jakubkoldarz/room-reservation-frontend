<script setup lang="ts">
import { UserIcon } from "@heroicons/vue/24/outline";
import IconButton from "./IconButton.vue";
import Logo from "./Logo.vue";
import Searchbar from "./Searchbar.vue";
import { Bars4Icon, MagnifyingGlassIcon } from "@heroicons/vue/24/solid";
import { nextTick, ref } from "vue";
import { profileRoutes } from "../profile/routes";

const isMobileSearchOpen = ref(false);
const searchbarRef = ref<InstanceType<typeof Searchbar>>();

function toggleMobileSearch() {
    isMobileSearchOpen.value = !isMobileSearchOpen.value;
    if (isMobileSearchOpen.value) {
        nextTick(() => searchbarRef.value?.focus());
    }
}

const emit = defineEmits<{
    mobileBurgerClick: [];
}>();
</script>

<template>
    <nav class="bg-secondary text-text-secondary z-1000 flex h-12 items-center px-4 py-2">
        <IconButton class="mr-2 block size-8 shrink-0 md:hidden" @click="emit('mobileBurgerClick')">
            <Bars4Icon />
        </IconButton>
        <Logo :class="[!isMobileSearchOpen ? 'flex' : 'hidden', 'sm:flex']" />
        <div :class="[isMobileSearchOpen ? 'pr-2' : 'px-4', 'flex grow justify-center sm:px-4']">
            <Searchbar
                ref="searchbarRef"
                :class="[
                    isMobileSearchOpen ? 'flex' : 'hidden',
                    'border-border-secondary bg-secondary-hover w-full max-w-175 sm:flex',
                ]"
                placeholder="Search rooms..."
            />
        </div>
        <div class="flex gap-2">
            <IconButton @click="toggleMobileSearch" class="block size-6 sm:hidden">
                <MagnifyingGlassIcon />
            </IconButton>
            <RouterLink
                :to="{ name: profileRoutes.view.name }"
                aria-label="My profile"
                class="hover:text-primary focus-visible:ring-primary block size-6 rounded-full outline-none focus-visible:ring-1"
            >
                <UserIcon />
            </RouterLink>
        </div>
    </nav>
</template>
