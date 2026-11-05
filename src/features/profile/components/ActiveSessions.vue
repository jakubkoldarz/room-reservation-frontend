<script setup lang="ts">
import {
    ArrowRightStartOnRectangleIcon,
    ComputerDesktopIcon,
    DevicePhoneMobileIcon,
} from "@heroicons/vue/24/solid";
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import apiClient from "@/api/client";
import { apiCall } from "@/api/apiCall";
import { apiErrorMessage } from "@/api/errors";
import { useSignOut } from "@/features/auth/composables/useSignOut";
import { authRoutes } from "@/features/auth/routes";
import { useAuthStore } from "@/features/auth/stores/useAuthStore";
import type { RefreshToken } from "@/features/auth/types";
import { useConfirm } from "@/features/modal/composables/useConfirm";
import Badge from "@/features/shared/Badge.vue";
import BaseTooltip from "@/features/shared/BaseTooltip.vue";
import Container from "@/features/shared/Container.vue";
import IconButton from "@/features/shared/IconButton.vue";
import OutlineButton from "@/features/shared/OutlineButton.vue";
import DataTable from "@/features/table/components/DataTable.vue";
import type { Column } from "@/features/table/types";
import { useToastsStore } from "@/features/toasts/stores/useToastsStore";
import {
    currentSessionId,
    describeUserAgent,
    deviceLabel,
    formatSessionDate,
    sortSessions,
} from "../utils/sessions";

const { sessions } = defineProps<{
    sessions: readonly RefreshToken[];
}>();

const columns: Column[] = [
    { key: "device", label: "Device", align: "left" },
    { key: "created", label: "Signed in", width: 190, align: "left" },
    { key: "expires", label: "Expires", width: 190, align: "left" },
    { key: "revoke", width: 65, align: "center" },
];

const router = useRouter();
const authStore = useAuthStore();
const toasts = useToastsStore();
const confirm = useConfirm();
const { signOut } = useSignOut();

const rows = computed(() =>
    sortSessions(sessions).map((session) => {
        const device = describeUserAgent(session.userAgent);
        return { ...session, device, label: deviceLabel(device) };
    }),
);
const currentId = computed(() => currentSessionId(sessions, navigator.userAgent));
const isRevokingAll = ref(false);

async function revoke(session: (typeof rows.value)[number]): Promise<void> {
    const isCurrent = session.id === currentId.value;
    const confirmed = await confirm({
        title: "Sign out this session?",
        message: isCurrent
            ? "This is the browser you are using now. You will be signed out."
            : `${session.label} will be signed out.`,
        confirmText: "Sign out",
        danger: true,
    });
    if (!confirmed) return;

    if (isCurrent) {
        await signOut();
        return;
    }

    const response = await apiCall(() =>
        apiClient.deleteAuthsessionsRefreshTokenId(undefined, {
            params: { refreshTokenId: session.id },
        }),
    );
    if (!response.ok) {
        toasts.pushError({ title: "Failed to sign out", message: apiErrorMessage(response.error) });
        return;
    }

    await authStore.init();
    toasts.pushSuccess({ title: "Signed out", message: `${session.label} was signed out.` });
}

async function revokeAll(): Promise<void> {
    const confirmed = await confirm({
        title: "Sign out everywhere?",
        message: "All sessions, including this one, will be signed out.",
        confirmText: "Sign out everywhere",
        danger: true,
    });
    if (!confirmed) return;

    isRevokingAll.value = true;
    const response = await apiCall(() => apiClient.deleteAuthsessions(undefined));
    isRevokingAll.value = false;

    if (!response.ok) {
        toasts.pushError({ title: "Failed to sign out", message: apiErrorMessage(response.error) });
        return;
    }

    await authStore.logout();
    await router.push({ name: authRoutes.login.name });
}
</script>

<template>
    <Container class="@container px-0! py-0!">
        <div class="border-border flex flex-wrap items-center gap-2 border-b p-4">
            <h2 class="text-lg font-semibold">Active sessions</h2>
            <span class="text-text-muted text-sm">{{ sessions.length }}</span>
            <span class="grow"></span>
            <OutlineButton
                type="button"
                class="rounded-lg py-1"
                :is-loading="isRevokingAll"
                :disabled="sessions.length === 0"
                @click="revokeAll"
            >
                Sign out everywhere
            </OutlineButton>
        </div>

        <DataTable :columns :items="rows" row-key="id">
            <template #cell-device="{ row }">
                <span class="flex min-w-0 items-center gap-2">
                    <component
                        :is="row.device.isMobile ? DevicePhoneMobileIcon : ComputerDesktopIcon"
                        class="text-text-muted/70 size-4 shrink-0"
                    />
                    <BaseTooltip :text="row.userAgent ?? 'No user agent'" class="min-w-0 truncate">
                        <span class="truncate font-medium">{{ row.label }}</span>
                    </BaseTooltip>
                    <Badge v-if="row.id === currentId" type="success" class="shrink-0 px-2!">
                        This browser
                    </Badge>
                </span>
                <span class="text-text-muted block truncate text-xs">
                    {{ row.ipAddress ? `IP ${row.ipAddress}` : "Unknown IP" }}
                </span>
            </template>

            <template #cell-created="{ row }">
                {{ formatSessionDate(row.created) }}
            </template>

            <template #cell-expires="{ row }">
                {{ formatSessionDate(row.expires) }}
            </template>

            <template #cell-revoke="{ row }">
                <IconButton type="danger" aria-label="Sign out this session" @click="revoke(row)">
                    <ArrowRightStartOnRectangleIcon class="size-4" />
                </IconButton>
            </template>
        </DataTable>
    </Container>
</template>
