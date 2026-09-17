<script setup lang="ts">
import BaseButton from "@/features/shared/BaseButton.vue";
import { computed, ref } from "vue";
import { useRoute } from "vue-router";
import SegmentedInput from "../components/SegmentedInput.vue";
import { useApiCall } from "@/composables/useApiCall.ts";
import apiClient from "@/api/client.ts";
import ErrorText from "@/features/shared/ErrorText.vue";
import router from "@/router/index.ts";
import { useAuthStore } from "../stores/useAuthStore.ts";
const { params } = useRoute();
const verificationId = computed(() => params.verificationId as string);

const verificationCode = ref<string>("");
const { call, isLoading, error } = useApiCall();
const authStore = useAuthStore();

async function onSubmit() {
    const response = await call(() =>
        apiClient.postAuthlogin2fa({
            verificationCode: verificationCode.value,
            verificationId: verificationId.value,
        }),
    );
    if (response.success && response.data.jwtToken) {
        authStore.login(response.data.jwtToken);
        router.push({ name: "index" });
    }
}
</script>

<template>
    <section class="grid place-items-center min-h-screen">
        <div class="p-8 flex flex-col items-center gap-2 shadow rounded bg-surface w-full max-w-100">
            <h2 class="text-center">Enter your verification code</h2>
            <ErrorText :error="error?.message" />
            <div class="flex gap-1 my-2">
                <SegmentedInput v-model="verificationCode" :segments="6" />
            </div>
            <BaseButton :is-loading="isLoading" class="w-24 justify-center" @click="onSubmit">Verify</BaseButton>
        </div>
    </section>
</template>
