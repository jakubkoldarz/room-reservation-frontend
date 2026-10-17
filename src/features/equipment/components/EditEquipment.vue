<script setup lang="ts">
import NumberCircle from '@/features/buildings/components/NumberCircle.vue'
import BaseInput from '@/features/shared/BaseInput.vue'
import Container from '@/features/shared/Container.vue'
import type { Equipment } from '../types'
import { useClipboard } from '@vueuse/core'
import { ref } from 'vue'

const props = withDefaults(
  defineProps<{
    equipment?: Equipment
    isNew?: boolean
  }>(),
  {
    isNew: false,
  },
)

let timeoutId: number | null = null
const idLabel = ref('System Identifier (id / UUID)')
const { copy, isSupported } = useClipboard()
function copyEquipmentId() {
  if (!isSupported.value || !props.equipment?.id) return
  copy(props.equipment.id)
  idLabel.value = 'Text Copied!'
  if (timeoutId) clearTimeout(timeoutId)

  timeoutId = window.setTimeout(() => {
    idLabel.value = 'System Identifier (id / UUID)'
  }, 2000)
}
</script>

<template>
  <Container class="@container flex flex-col gap-2">
    <div>
      <div class="flex items-center gap-2">
        <NumberCircle>1</NumberCircle>
        <h2 class="text-lg font-semibold">Equipment details</h2>
      </div>
      <p class="text-text-muted text-sm">
        Edit details of the equipment. Please fill in all required fields. Equipment is used as the
        part of the room description.
      </p>
      <hr class="border-border my-2" />
    </div>

    <div class="grid grid-cols-1 gap-4 @lg:grid-cols-2 @xl:grid-cols-3">
      <BaseInput
        v-if="!isNew"
        @focus="copyEquipmentId"
        class="bg-text-muted/10 text-text/60 cursor-pointer rounded-lg px-4 py-2 font-mono text-sm"
        readonly
        :label="idLabel"
        :model-value="equipment?.id"
      />
    </div>
  </Container>
</template>
