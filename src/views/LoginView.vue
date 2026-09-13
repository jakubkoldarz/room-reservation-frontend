<script setup lang="ts">
import { authRoutes } from "@/features/auth/routes";
import BaseButton from "@/features/shared/BaseButton.vue";
import BaseInput from "@/features/shared/BaseInput.vue";
import { KeyIcon, UserIcon } from "@heroicons/vue/24/solid";
</script>

<template>
    <section class="grid place-items-center min-h-screen">
        <div class="p-8 flex flex-col gap-2 shadow rounded bg-surface">
            <h2 class="text-xl mb-4">Zaloguj się</h2>
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
            <BaseButton class="mt-4 justify-center" @click="console.log('test')"> Zaloguj się </BaseButton>
            <p class="text-sm text-text-muted text-center mt-4">
                Nie masz konta?
                <RouterLink :to="{ name: authRoutes.register.name }" class="text-primary"> Zarejestruj się</RouterLink>
            </p>
        </div>
    </section>
</template>
