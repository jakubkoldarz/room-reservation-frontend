import { useIntervalFn } from "@vueuse/core";
import { ref } from "vue";

export const RESEND_COOLDOWN_SECONDS = 60;

export function useResendCooldown(startActive = false) {
    const remaining = ref(startActive ? RESEND_COOLDOWN_SECONDS : 0);

    const { pause, resume } = useIntervalFn(
        () => {
            remaining.value = Math.max(remaining.value - 1, 0);
            if (remaining.value === 0) pause();
        },
        1000,
        { immediate: startActive },
    );

    function start(): void {
        remaining.value = RESEND_COOLDOWN_SECONDS;
        resume();
    }

    function reset(): void {
        remaining.value = 0;
        pause();
    }

    return { remaining, start, reset };
}
