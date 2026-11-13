import {
    actionLabel,
    areaLabel,
    compareActions,
    compareAreas,
    splitPermission,
} from "@/features/profile/utils/permissions";
import type { PermissionItem, PermissionOptionGroup, PermissionOption, Role } from "../types";

type PermissionEntry = {
    id: string;
    action: string;
};

function compareEntries(a: PermissionEntry, b: PermissionEntry): number {
    return compareActions(a.action, b.action);
}

export function groupPermissionOptions(
    permissions: readonly PermissionItem[],
): PermissionOptionGroup[] {
    const entriesByArea = new Map<string, PermissionEntry[]>();

    for (const permission of permissions) {
        const parts = splitPermission(permission.name);
        if (!parts) continue;

        let entries = entriesByArea.get(parts.area);
        if (!entries) {
            entries = [];
            entriesByArea.set(parts.area, entries);
        }
        entries.push({ id: permission.id, action: parts.action });
    }

    const areas = [...entriesByArea.keys()];
    areas.sort(compareAreas);

    const groups: PermissionOptionGroup[] = [];
    for (const area of areas) {
        const entries = entriesByArea.get(area) ?? [];
        entries.sort(compareEntries);

        const options: PermissionOption[] = [];
        for (const entry of entries) {
            options.push({ id: entry.id, label: actionLabel(entry.action) });
        }
        groups.push({ area: areaLabel(area), options });
    }
    return groups;
}

export function permissionIdsByName(
    permissions: readonly PermissionItem[],
    names: readonly string[],
): string[] {
    const ids: string[] = [];
    for (const permission of permissions) {
        if (names.includes(permission.name)) ids.push(permission.id);
    }
    return ids;
}

export function countSelected(ids: readonly string[], selectedIds: readonly string[]): number {
    let count = 0;
    for (const id of ids) {
        if (selectedIds.includes(id)) count += 1;
    }
    return count;
}

export function withIds(selectedIds: readonly string[], ids: readonly string[]): string[] {
    const next = [...selectedIds];
    for (const id of ids) {
        if (!next.includes(id)) next.push(id);
    }
    return next;
}

export function withoutIds(selectedIds: readonly string[], ids: readonly string[]): string[] {
    const next: string[] = [];
    for (const id of selectedIds) {
        if (!ids.includes(id)) next.push(id);
    }
    return next;
}

export function permissionSummary(role: Pick<Role, "isSuperAdmin" | "permissions">): string {
    if (role.isSuperAdmin) return "All permissions";

    const count = role.permissions.length;
    if (count === 0) return "No permissions";
    if (count === 1) return "1 permission";
    return `${count} permissions`;
}
