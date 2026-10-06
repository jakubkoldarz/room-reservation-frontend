import { useDate } from "@/composables/useDate";
import type { Availability } from "@/types/availabilities";
import { computed, toValue, type MaybeRefOrGetter } from "vue";

export function useAvailabilityRow(items: MaybeRefOrGetter<Availability[]>, onUpdate?: (next: Availability[]) => void) {
    const { dayNames, formatTime } = useDate();

    const rows = computed(() =>
        dayNames.map((day, index) => {
            const list = toValue(items);
            const availability = list.find((i) => i.dayOfWeek === index);
            return {
                day,
                dayOfWeek: index,
                isOpen: availability !== undefined,
                startTime: availability ? formatTime(availability.startTime) : null,
                endTime: availability ? formatTime(availability.endTime) : null,
            };
        }),
    );

    function setOpen(dayOfWeek: number, isOpen: boolean) {
        if (!onUpdate) return;

        const list = toValue(items);
        const exists = list.some((i) => i.dayOfWeek === dayOfWeek);

        if (isOpen && !exists) {
            onUpdate([...list, { dayOfWeek, startTime: "09:00", endTime: "17:00" } as Availability]);
        } else if (!isOpen && exists) {
            onUpdate(list.filter((i) => i.dayOfWeek !== dayOfWeek));
        }
    }

    function setTime(dayOfWeek: number, field: "startTime" | "endTime", value: string) {
        if (!onUpdate) return;

        const list = toValue(items);
        onUpdate(list.map((i) => (i.dayOfWeek === dayOfWeek ? { ...i, [field]: value } : i)));
    }

    return { rows, setOpen, setTime };
}
