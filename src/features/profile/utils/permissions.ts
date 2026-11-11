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
    return value.charAt(0).toUpperCase() + value.slice(1).split(".").join(" ");
}

function rank(order: readonly string[], value: string): number {
    const index = order.indexOf(value);
    return index === -1 ? order.length : index;
}

export function groupPermissions(permissions: readonly string[]): PermissionGroup[] {
    const byArea = new Map<string, string[]>();
    for (const permission of permissions) {
        const [area = "", ...rest] = permission.split(".");
        const action = rest.join(".");
        if (!area || !action) continue;
        byArea.set(area, [...(byArea.get(area) ?? []), action]);
    }

    return [...byArea.entries()]
        .sort(([a], [b]) => rank(AREA_ORDER, a) - rank(AREA_ORDER, b) || a.localeCompare(b))
        .map(([area, actions]) => ({
            area: AREAS[area] ?? capitalize(area),
            actions: [...new Set(actions)]
                .sort((a, b) => rank(ACTION_ORDER, a) - rank(ACTION_ORDER, b))
                .map((action) => ACTIONS[action] ?? capitalize(action)),
        }));
}
