<script setup lang="ts">
import BaseButton from "@/features/shared/BaseButton.vue";
import BaseInput from "@/features/shared/BaseInput.vue";
import { KeyIcon, UserIcon } from "@heroicons/vue/24/solid";
</script>

<template>
    <div class="p-4 flex flex-col gap-2">
        <BaseInput label="Adres email">
            <template #icon>
                <UserIcon />
            </template>
        </BaseInput>
        <BaseInput label="Hasło" type="password">
            <template #icon>
                <KeyIcon />
            </template>
        </BaseInput>
        <BaseButton @click="console.log('test')"> Wciśnij mnie </BaseButton>
    </div>
</template>
