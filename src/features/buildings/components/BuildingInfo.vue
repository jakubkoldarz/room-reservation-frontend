<script setup lang="ts">
import { usePermissions } from "@/composables/usePermissions";
import { Permission } from "@/features/auth/constants/permissions";
import Badge from "@/features/shared/Badge.vue";
import BaseButton from "@/features/shared/BaseButton.vue";
import Container from "@/features/shared/Container.vue";
import OutlineButton from "@/features/shared/OutlineButton.vue";
import Skeleton from "@/features/shared/Skeleton.vue";
import router from "@/router";
import {
    BuildingOfficeIcon,
    MapPinIcon,
    PencilSquareIcon,
    PlusIcon,
} from "@heroicons/vue/24/solid";
import { roomRoutes } from "@/features/rooms/routes";
import { buildingRoutes } from "../routes";

const { hasPermission } = usePermissions();

const props = defineProps<{
    buildingId?: string;
    name?: string;
    isLoading?: boolean;
    identifier?: string | null;
    localization?: string | null;
    floorsCount?: string | number | null;
}>();

function gotoEdit() {
    router.push({ name: buildingRoutes.edit.name, params: { buildingId: props.buildingId } });
}

function gotoAddRoom() {
    router.push({ name: roomRoutes.add.name, query: { buildingId: props.buildingId } });
}
</script>

<template>
    <Container class="flex w-full flex-col justify-start">
        <template v-if="isLoading">
            <div class="flex w-full animate-pulse flex-col gap-1">
                <Skeleton class="w-full" />
                <Skeleton class="mt-4 w-full" />

                <div
                    v-if="
                        hasPermission(Permission.BuildingEdit) || hasPermission(Permission.RoomAdd)
                    "
                    class="mt-4 flex flex-wrap gap-2"
                >
                    <Skeleton
                        v-if="hasPermission(Permission.BuildingEdit)"
                        class="w-32 rounded-lg"
                    />
                    <Skeleton v-if="hasPermission(Permission.RoomAdd)" class="w-28 rounded-lg" />
                </div>
            </div>
        </template>

        <template v-else>
            <h1 class="text-lg font-bold sm:text-xl">{{ name }}</h1>
            <Badge v-if="identifier" class="mt-1 self-start">{{ identifier }}</Badge>
            <div class="mt-4 flex flex-wrap gap-2" v-if="localization || floorsCount">
                <p v-if="localization" class="flex items-center gap-1 text-sm">
                    <MapPinIcon class="size-5" /> {{ localization }}
                </p>
                <p v-if="floorsCount" class="flex items-center gap-1 text-sm">
                    <BuildingOfficeIcon class="size-5" />Floors count: <b>{{ floorsCount }}</b>
                </p>
            </div>
            <div
                v-if="hasPermission(Permission.BuildingEdit) || hasPermission(Permission.RoomAdd)"
                class="mt-4 flex flex-wrap gap-2"
            >
                <OutlineButton
                    @click="gotoEdit"
                    v-if="hasPermission(Permission.BuildingEdit)"
                    class="rounded-lg py-1"
                >
                    <PencilSquareIcon class="size-5" /> Edit Building
                </OutlineButton>
                <BaseButton
                    v-if="hasPermission(Permission.RoomAdd)"
                    class="rounded-lg py-1"
                    @click="gotoAddRoom"
                >
                    <PlusIcon class="size-5" /> Add Room
                </BaseButton>
            </div>
        </template>
    </Container>
</template>
