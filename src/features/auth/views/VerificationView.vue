<script setup lang="ts">
import BaseButton from "@/features/shared/BaseButton.vue";
import { computed, ref } from "vue";
import { useRoute } from "vue-router";
import SegmentedInput from "../components/SegmentedInput.vue";
import { apiCall } from "@/api/apiCall.ts";
import { apiErrorMessage } from "@/api/errors.ts";
import apiClient from "@/api/client.ts";
import ErrorText from "@/features/shared/ErrorText.vue";
import router from "@/router/index.ts";
import { useAuthStore } from "../stores/useAuthStore.ts";
const { params } = useRoute();
const verificationId = computed(() => params.verificationId as string);

const verificationCode = ref<string>("");
const isLoading = ref(false);
const error = ref<string | undefined>();
const authStore = useAuthStore();

async function onSubmit() {
    isLoading.value = true;
    const response = await apiCall(() =>
        apiClient.postAuthlogin2fa({
            verificationCode: verificationCode.value,
            verificationId: verificationId.value,
        }),
    );

    if (!response.ok) {
        isLoading.value = false;
        error.value = apiErrorMessage(response.error);
        return;
    }
    error.value = undefined;
    if (response.data.jwtToken) {
        await authStore.login(response.data.jwtToken);
        router.push({ name: "index" });
    }
    isLoading.value = false;
}
</script>

<template>
    <section class="grid min-h-screen place-items-center">
        <div
            class="bg-surface flex w-full max-w-100 flex-col items-center gap-2 rounded p-8 shadow"
        >
            <h2 class="text-center">Enter your verification code</h2>
            <ErrorText :error="error" />
            <div class="my-2 flex gap-1">
                <SegmentedInput v-model="verificationCode" :segments="6" />
            </div>
            <BaseButton :is-loading="isLoading" class="w-24 justify-center" @click="onSubmit"
                >Verify</BaseButton
            >
        </div>
    </section>
</template>
