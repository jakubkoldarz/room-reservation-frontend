<script setup lang="ts">
import { ArrowRightStartOnRectangleIcon, UserIcon } from "@heroicons/vue/24/outline";
import { Bars4Icon, MagnifyingGlassIcon, XMarkIcon } from "@heroicons/vue/24/solid";
import { nextTick, ref, useTemplateRef, watch } from "vue";
import { useRoute } from "vue-router";
import { usePermissions } from "@/composables/usePermissions";
import { Permission } from "@/features/auth/constants/permissions";
import GlobalSearch from "@/features/search/components/GlobalSearch.vue";
import { useSignOut } from "../auth/composables/useSignOut";
import { dashboardRoutes } from "../dashboard/routes";
import { profileRoutes } from "../profile/routes";
import BaseTooltip from "./BaseTooltip.vue";
import IconButton from "./IconButton.vue";
import AppLogo from "./AppLogo.vue";

const route = useRoute();
const { hasPermission } = usePermissions();
const { signOut, isSigningOut } = useSignOut();

const dashboardLink = { name: dashboardRoutes.dashboard.name };
const canSearch = hasPermission(Permission.RoomList) || hasPermission(Permission.BuildingList);
const isMobileSearchOpen = ref(false);
const search = useTemplateRef("search");

async function toggleMobileSearch() {
    isMobileSearchOpen.value = !isMobileSearchOpen.value;
    if (!isMobileSearchOpen.value) {
        search.value?.clear();
        return;
    }
    await nextTick();
    search.value?.focus();
}

watch(
    () => route.fullPath,
    () => {
        isMobileSearchOpen.value = false;
    },
);

const emit = defineEmits<{
    mobileBurgerClick: [];
}>();
</script>

<template>
    <nav class="bg-secondary text-text-secondary z-1000 flex h-12 items-center px-4 py-2">
        <IconButton
            class="hover:text-text-muted-secondary! focus-visible:ring-text-secondary! mr-2 block size-8 shrink-0 md:hidden"
            aria-label="Menu"
            @click="emit('mobileBurgerClick')"
        >
            <Bars4Icon />
        </IconButton>
        <RouterLink
            :to="dashboardLink"
            aria-label="Go to dashboard"
            class="focus-visible:ring-text-secondary shrink-0 rounded outline-none focus-visible:ring-2"
            :class="[isMobileSearchOpen ? 'hidden' : 'flex', 'sm:flex']"
        >
            <AppLogo />
        </RouterLink>
        <div
            :class="[
                isMobileSearchOpen ? 'pr-2' : 'px-4',
                'flex min-w-0 grow justify-center sm:px-4',
            ]"
        >
            <GlobalSearch
                v-if="canSearch"
                ref="search"
                :class="[isMobileSearchOpen ? 'block' : 'hidden', 'sm:block']"
            />
        </div>
        <div class="flex gap-2">
            <IconButton
                v-if="canSearch"
                class="hover:text-text-muted-secondary! focus-visible:ring-text-secondary! block size-6 sm:hidden"
                :aria-label="isMobileSearchOpen ? 'Close search' : 'Open search'"
                :aria-expanded="isMobileSearchOpen"
                @click="toggleMobileSearch"
            >
                <XMarkIcon v-if="isMobileSearchOpen" />
                <MagnifyingGlassIcon v-else />
            </IconButton>
            <div :class="[isMobileSearchOpen ? 'hidden sm:flex' : 'flex', 'gap-2']">
                <RouterLink
                    :to="{ name: profileRoutes.view.name }"
                    aria-label="My profile"
                    class="text-text-secondary hover:text-text-muted-secondary focus-visible:ring-text-secondary block size-6 rounded-full outline-none focus-visible:ring-1"
                >
                    <UserIcon />
                </RouterLink>
                <BaseTooltip text="Sign out">
                    <IconButton
                        class="text-text-secondary hover:text-text-muted-secondary! focus-visible:ring-text-secondary! block size-6 disabled:opacity-60"
                        aria-label="Sign out"
                        :disabled="isSigningOut"
                        @click="signOut"
                    >
                        <ArrowRightStartOnRectangleIcon />
                    </IconButton>
                </BaseTooltip>
            </div>
        </div>
    </nav>
</template>
