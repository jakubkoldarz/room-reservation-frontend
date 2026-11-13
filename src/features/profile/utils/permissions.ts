import type { PermissionGroup } from "../types";

const AREAS: Record<string, string> = {
    reservation: "Reservations",
    room: "Rooms",
    building: "Buildings",
    equipment: "Equipment",
    event: "Events",
    user: "Users",
    role: "Roles",
    permission: "Permissions",
};

const ACTIONS: Record<string, string> = {
    view: "View",
    list: "List",
    create: "Book",
    add: "Add",
    edit: "Edit",
    delete: "Delete",
    approve: "Approve",
    reject: "Reject",
    "force.cancel": "Cancel any",
    assign: "Assign",
};

const AREA_ORDER = Object.keys(AREAS);
const ACTION_ORDER = Object.keys(ACTIONS);

function capitalize(value: string): string {
    const firstLetter = value.charAt(0).toUpperCase();
    const rest = value.slice(1).split(".").join(" ");
    return firstLetter + rest;
}

function areaLabel(area: string): string {
    return AREAS[area] ?? capitalize(area);
}

function actionLabel(action: string): string {
    return ACTIONS[action] ?? capitalize(action);
}

function rank(order: readonly string[], value: string): number {
    const index = order.indexOf(value);
    if (index === -1) return order.length;
    return index;
}

function compareAreas(a: string, b: string): number {
    const rankDifference = rank(AREA_ORDER, a) - rank(AREA_ORDER, b);
    if (rankDifference !== 0) return rankDifference;
    return a.localeCompare(b);
}

function compareActions(a: string, b: string): number {
    return rank(ACTION_ORDER, a) - rank(ACTION_ORDER, b);
}

function splitPermission(permission: string): { area: string; action: string } | null {
    const dotIndex = permission.indexOf(".");
    if (dotIndex <= 0) return null;

    const area = permission.slice(0, dotIndex);
    const action = permission.slice(dotIndex + 1);
    if (action === "") return null;
    return { area, action };
}

export function groupPermissions(permissions: readonly string[]): PermissionGroup[] {
    const actionsByArea = new Map<string, string[]>();

    for (const permission of permissions) {
        const parts = splitPermission(permission);
        if (!parts) continue;

        let actions = actionsByArea.get(parts.area);
        if (!actions) {
            actions = [];
            actionsByArea.set(parts.area, actions);
        }
        if (!actions.includes(parts.action)) actions.push(parts.action);
    }

    const areas = [...actionsByArea.keys()];
    areas.sort(compareAreas);

    const groups: PermissionGroup[] = [];
    for (const area of areas) {
        const actions = actionsByArea.get(area) ?? [];
        actions.sort(compareActions);

        const labels: string[] = [];
        for (const action of actions) {
            labels.push(actionLabel(action));
        }
        groups.push({ area: areaLabel(area), actions: labels });
    }
    return groups;
}
