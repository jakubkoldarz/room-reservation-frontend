export const LOW_PRIORITY = 0;
export const MEDIUM_PRIORITY = 1;
export const HIGH_PRIORITY = 2;

export const DEFAULT_EVENT_PRIORITY = MEDIUM_PRIORITY;

export const EVENT_PRIORITY_OPTIONS = [
    {
        value: HIGH_PRIORITY,
        title: "High",
        description: "Wins over every other event on the same day.",
    },
    {
        value: MEDIUM_PRIORITY,
        title: "Medium",
        description: "The usual choice. Wins over low priority events.",
    },
    {
        value: LOW_PRIORITY,
        title: "Low",
        description: "Applies only on days without a higher priority event.",
    },
] as const;

export function eventPriorityLabel(priority: number): string {
    if (priority === HIGH_PRIORITY) return "High";
    if (priority === LOW_PRIORITY) return "Low";
    return "Medium";
}
