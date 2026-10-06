export function useDate() {
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;

    function getDayName(dayOfWeek: number) {
        if (dayOfWeek < 0) return dayNames[0];
        if (dayOfWeek > dayNames.length - 1) return dayNames[dayNames.length - 1];
        return dayNames[dayOfWeek];
    }

    function formatTime(time?: string): string {
        if (!time) return "";
        const [hours, minutes] = time.split(":");
        const date = new Date();
        date.setHours(Number(hours), Number(minutes));
        return new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit" }).format(date);
    }

    return { getDayName, dayNames, formatTime };
}
