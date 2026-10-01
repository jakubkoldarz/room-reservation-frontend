<script setup lang="ts">
import AsideNavbarLayout from "@/features/layouts/AsideNavbarLayout.vue";
import DataTable from "@/features/table/components/DataTable.vue";
import type { Column } from "@/features/table/types/table-column";
import { useBuildingsStore } from "../stores/useBuildingsStore";
import Badge from "@/features/shared/Badge.vue";
import { formatAddress } from "../utils/formatAddres";
import Container from "@/features/shared/Container.vue";

const columns = [
    { key: "identifier", label: "Identifier", width: 150, align: "left" },
    { key: "name", label: "Name" },
    { key: "location", label: "Location", width: 350 },
    { key: "floors", label: "Floors", width: 100, align: "center" },
] as Column[];

const buildingsStore = useBuildingsStore();
</script>

<template>
    <AsideNavbarLayout>
        <Container class="px-0!">
            <DataTable :columns :items="buildingsStore.buildings" row-key="id">
                <template #cell-identifier="{ row }">
                    <Badge v-if="row.identifier">
                        {{ row.identifier }}
                    </Badge>
                </template>

                <template #cell-name="{ row }">
                    {{ row.name }}
                </template>

                <template #cell-location="{ row }">
                    {{ formatAddress(row) }}
                </template>

                <template #cell-floors="{ row }">
                    {{ row.floorsCount }}
                </template>
            </DataTable>
        </Container>
    </AsideNavbarLayout>
</template>
