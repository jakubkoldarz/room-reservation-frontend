<script setup lang="ts">
import {
    CalendarDaysIcon,
    ListBulletIcon,
    ShieldCheckIcon,
    UserCircleIcon,
} from "@heroicons/vue/24/solid";
import { computed, useTemplateRef, type Component } from "vue";
import { DARK_CLOSED_HOURS_BACKGROUND } from "@/features/rooms/utils/calendarStyles";
import Container from "@/features/shared/Container.vue";
import type { UserDetails } from "@/features/users/types";
import type { ProfileTab } from "../types";

const { user, tab } = defineProps<{
    user: UserDetails;
    tab: ProfileTab;
}>();

const emit = defineEmits<{
    select: [tab: ProfileTab];
}>();

const TABS: { key: ProfileTab; label: string; icon: Component }[] = [
    { key: "calendar", label: "Calendar", icon: CalendarDaysIcon },
    { key: "reservations", label: "Reservations", icon: ListBulletIcon },
    { key: "security", label: "Security", icon: ShieldCheckIcon },
    { key: "account", label: "Account", icon: UserCircleIcon },
];

const tabButtons = useTemplateRef<HTMLButtonElement[]>("tabButtons");

const fullName = computed(() => {
    const parts: string[] = [];
    if (user.userInfo.firstname) parts.push(user.userInfo.firstname);
    if (user.userInfo.lastname) parts.push(user.userInfo.lastname);
    return parts.join(" ");
});

function firstLetter(name: string | null | undefined): string {
    if (!name) return "";
    return name.trim().charAt(0).toUpperCase();
}

const initials = computed(
    () => firstLetter(user.userInfo.firstname) + firstLetter(user.userInfo.lastname),
);

function focusTab(index: number): void {
    const wrapped = (index + TABS.length) % TABS.length;
    const next = TABS[wrapped];
    if (!next) return;
    emit("select", next.key);
    tabButtons.value?.[wrapped]?.focus();
}

function onKeydown(event: KeyboardEvent, index: number): void {
    const moves: Record<string, number> = {
        ArrowRight: index + 1,
        ArrowLeft: index - 1,
        Home: 0,
        End: TABS.length - 1,
    };
    const target = moves[event.key];
    if (target === undefined) return;
    event.preventDefault();
    focusTab(target);
}
</script>

<template>
    <Container class="overflow-hidden px-0! py-0!">
        <div
            class="bg-secondary flex items-center gap-4 px-4 py-5 sm:px-6"
            :style="{ backgroundImage: DARK_CLOSED_HOURS_BACKGROUND }"
        >
            <span
                class="bg-primary grid size-14 shrink-0 place-items-center rounded-full text-xl font-semibold text-white ring-4 ring-white/10"
                aria-hidden="true"
            >
                {{ initials || "?" }}
            </span>
            <div class="flex min-w-0 flex-col gap-1">
                <h1 class="text-text-secondary truncate text-xl font-bold">
                    {{ fullName || "No name" }}
                </h1>
                <p class="flex min-w-0 items-center gap-2 text-sm">
                    <span
                        class="border-border-secondary bg-secondary text-text-secondary shrink-0 rounded border px-2 py-0.5 text-xs font-semibold"
                    >
                        {{ user.roleInfo.role }}
                    </span>
                    <span class="text-text-muted-secondary truncate">{{ user.email }}</span>
                </p>
            </div>
        </div>

        <div role="tablist" aria-label="Profile sections" class="flex overflow-x-auto px-2 sm:px-4">
            <button
                v-for="(item, index) in TABS"
                :id="`profile-tab-${item.key}`"
                ref="tabButtons"
                :key="item.key"
                type="button"
                role="tab"
                :aria-selected="item.key === tab"
                :aria-controls="`profile-panel-${item.key}`"
                :tabindex="item.key === tab ? 0 : -1"
                class="focus-visible:ring-primary flex shrink-0 cursor-pointer items-center gap-2 border-b-2 px-3 py-3 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-inset"
                :class="
                    item.key === tab
                        ? 'border-primary text-primary'
                        : 'text-text-muted hover:text-text border-transparent'
                "
                @click="emit('select', item.key)"
                @keydown="onKeydown($event, index)"
            >
                <component :is="item.icon" class="size-4" />
                {{ item.label }}
            </button>
        </div>
    </Container>
</template>
