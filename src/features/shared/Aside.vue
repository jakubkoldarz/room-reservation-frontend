<script setup lang="ts">
import { usePermissions } from "@/composables/usePermissions";
import { Permission } from "../auth/constants/permissions";
import LinkButton from "./LinkButton.vue";
import { dashboardRoutes } from "../dashboard/routes";
import { BuildingOffice2Icon, HomeIcon } from "@heroicons/vue/24/solid";
import { buildingRoutes } from "../buildings/routes.ts";

const { hasPermission } = usePermissions();
</script>

<template>
    <aside class="w-64 shrink-0 p-4 flex flex-col gap-2 border-r border-text-muted/20 bg-surface min-h-full">
        <LinkButton :to="dashboardRoutes.dashboard">
            <HomeIcon />
            Dashboard
        </LinkButton>
        <LinkButton :to="buildingRoutes.list">
            <BuildingOffice2Icon />
            Buildings
        </LinkButton>
        <ul v-if="hasPermission(Permission.BuildingList)">
            <li>xd</li>
            <li>xd</li>
        </ul>
    </aside>
</template>
