<script setup lang="ts">
import { authRoutes } from "@/features/auth/routes";
import BaseButton from "@/features/shared/BaseButton.vue";
import BaseInput from "@/features/shared/BaseInput.vue";
import { KeyIcon, UserIcon } from "@heroicons/vue/24/solid";
</script>

<template>
    <section class="grid min-h-screen place-items-center">
        <div class="bg-surface flex flex-col gap-2 rounded p-8 shadow">
            <h2 class="mb-4 text-xl">Zarejestruj się</h2>
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
            <BaseButton class="mt-4 justify-center" @click="console.log('test')">
                Zarejestruj się
            </BaseButton>
            <p class="text-text-muted mt-4 text-center text-sm">
                Masz już swoje konto?
                <RouterLink :to="{ name: authRoutes.login.name }" class="text-primary">
                    Zaloguj się</RouterLink
                >
            </p>
        </div>
    </section>
</template>
