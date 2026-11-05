export function formatFloor(floor: number): string {
    if (floor === 0) return "Ground floor";
    if (floor < 0) return `Basement ${Math.abs(floor)}`;
    return `Floor ${floor}`;
}

export function formatCapacity(capacity: number): string {
    return capacity === 1 ? "1 person" : `${capacity} people`;
}

export function approvalShortLabel(requiresApproval: boolean): string {
    return requiresApproval ? "Requires approval" : "Instant booking";
}

export function approvalDescription(requiresApproval: boolean): string {
    return requiresApproval
        ? "reservations must be approved first"
        : "reservations are confirmed immediately";
}

export function approvalLabel(requiresApproval: boolean): string {
    return `${approvalShortLabel(requiresApproval)}: ${approvalDescription(requiresApproval)}`;
}
