<script setup lang="ts">
import { usePermissions } from "@/composables/usePermissions";
import { Permission } from "@/features/auth/constants/permissions";
import Badge from "@/features/shared/Badge.vue";
import BaseButton from "@/features/shared/BaseButton.vue";
import Container from "@/features/shared/Container.vue";
import OutlineButton from "@/features/shared/OutlineButton.vue";
import Skeleton from "@/features/shared/Skeleton.vue";
import { BuildingOfficeIcon, MapPinIcon, PencilSquareIcon, PlusIcon } from "@heroicons/vue/24/solid";

const { hasPermission } = usePermissions();

const props = defineProps<{
    name?: string;
    isLoading?: boolean;
    identifier?: string | null;
    localization?: string | null;
    floorsCount?: string | number | null;
}>();
</script>

<template>
    <Container class="w-full flex flex-col justify-start">
        <template v-if="isLoading">
            <!-- Skeleton -->
            <div class="animate-pulse flex flex-col gap-1 w-full">
                <Skeleton class="w-full" />
                <Skeleton class="w-full mt-4" />

                <div
                    v-if="hasPermission(Permission.BuildingEdit) || hasPermission(Permission.RoomAdd)"
                    class="flex flex-wrap gap-2 mt-4"
                >
                    <Skeleton v-if="hasPermission(Permission.BuildingEdit)" class="w-32 rounded-lg" />
                    <Skeleton v-if="hasPermission(Permission.RoomAdd)" class="w-28 rounded-lg" />
                </div>
            </div>
        </template>

        <template v-else>
            <h1 class="text-lg sm:text-xl font-bold">{{ name }}</h1>
            <Badge v-if="identifier" class="self-start mt-1" :text="identifier" />
            <div class="flex flex-wrap gap-2 mt-4" v-if="localization || floorsCount">
                <p v-if="localization" class="text-sm flex items-center gap-1">
                    <MapPinIcon class="size-5" /> {{ localization }}
                </p>
                <p v-if="floorsCount" class="text-sm flex items-center gap-1">
                    <BuildingOfficeIcon class="size-5" />Floors count: <b>{{ floorsCount }}</b>
                </p>
            </div>
            <div
                v-if="hasPermission(Permission.BuildingEdit) || hasPermission(Permission.RoomAdd)"
                class="flex flex-wrap mt-4 gap-2"
            >
                <OutlineButton v-if="hasPermission(Permission.BuildingEdit)" class="py-1 rounded-lg">
                    <PencilSquareIcon class="size-5" /> Edit Building
                </OutlineButton>
                <BaseButton v-if="hasPermission(Permission.RoomAdd)" class="py-1 rounded-lg">
                    <PlusIcon class="size-5" /> Add Room
                </BaseButton>
            </div>
        </template>
    </Container>
</template>
