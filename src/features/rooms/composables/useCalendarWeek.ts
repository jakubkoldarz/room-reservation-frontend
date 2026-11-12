import { computed, type Ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { toIsoDate } from "@/utils/isoDate";
import { addDays, formatWeekRange, parseIsoDate, startOfWeek } from "../utils/calendar";

export function useCalendarWeek(now: Readonly<Ref<Date>>) {
    const route = useRoute();
    const router = useRouter();

    const currentWeekStart = computed(() => startOfWeek(now.value));
    const weekStart = computed(() => {
        const fromUrl = parseIsoDate(route.query.week);
        return fromUrl ? startOfWeek(fromUrl) : currentWeekStart.value;
    });
    const isCurrentWeek = computed(
        () => toIsoDate(weekStart.value) === toIsoDate(currentWeekStart.value),
    );
    const weekLabel = computed(() => formatWeekRange(weekStart.value));

    async function showWeek(start: Date): Promise<void> {
        const week =
            toIsoDate(start) === toIsoDate(currentWeekStart.value) ? undefined : toIsoDate(start);
        await router.replace({ query: { ...route.query, week } });
    }

    return {
        weekStart,
        isCurrentWeek,
        weekLabel,
        showPreviousWeek: () => showWeek(addDays(weekStart.value, -7)),
        showNextWeek: () => showWeek(addDays(weekStart.value, 7)),
        showCurrentWeek: () => showWeek(currentWeekStart.value),
    };
}
