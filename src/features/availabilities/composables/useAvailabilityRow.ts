import { useDate } from "@/composables/useDate";
import type { Availability } from "../types";
import { computed, toValue, type MaybeRefOrGetter } from "vue";

const DEFAULT_START_TIME = "09:00";
const DEFAULT_END_TIME = "17:00";

export function useAvailabilityRow(
    items: MaybeRefOrGetter<Availability[]>,
    onUpdate?: (next: Availability[]) => void,
) {
    const { dayNames, formatTime } = useDate();

    const rows = computed(() => {
        const list = toValue(items);
        const result = [];

        for (let dayOfWeek = 0; dayOfWeek < dayNames.length; dayOfWeek++) {
            const availability = list.find((item) => item.dayOfWeek === dayOfWeek);

            let startTime: string | null = null;
            let endTime: string | null = null;
            if (availability) {
                startTime = formatTime(availability.startTime);
                endTime = formatTime(availability.endTime);
            }

            result.push({
                day: dayNames[dayOfWeek],
                dayOfWeek,
                isOpen: availability !== undefined,
                startTime,
                endTime,
            });
        }

        return result;
    });

    function setOpen(dayOfWeek: number, isOpen: boolean) {
        if (!onUpdate) return;

        const list = toValue(items);
        const exists = list.some((item) => item.dayOfWeek === dayOfWeek);

        if (isOpen && !exists) {
            const added: Availability = {
                dayOfWeek,
                startTime: DEFAULT_START_TIME,
                endTime: DEFAULT_END_TIME,
            };
            onUpdate([...list, added]);
        } else if (!isOpen && exists) {
            onUpdate(list.filter((item) => item.dayOfWeek !== dayOfWeek));
        }
    }

    function setTime(dayOfWeek: number, field: "startTime" | "endTime", value: string) {
        if (!onUpdate) return;

        const next: Availability[] = [];
        for (const item of toValue(items)) {
            if (item.dayOfWeek === dayOfWeek) {
                next.push({ ...item, [field]: value });
            } else {
                next.push(item);
            }
        }
        onUpdate(next);
    }

    return { rows, setOpen, setTime };
}
