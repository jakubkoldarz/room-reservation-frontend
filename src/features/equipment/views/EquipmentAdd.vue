<script setup lang="ts">
import CreateHeader from '@/features/buildings/components/CreateHeader.vue'
import AsideNavbarLayout from '@/features/layouts/AsideNavbarLayout.vue'
import Container from '@/features/shared/Container.vue'
import EditEquipment from '../components/EditEquipment.vue'
</script>

<template>
  <AsideNavbarLayout>
    <div class="flex flex-col gap-2">
      <CreateHeader />
      <EditEquipment is-new />
    </div>
  </AsideNavbarLayout>
</template>
