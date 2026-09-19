export const Permission = {
    RoomView: "room.view",
    RoomList: "room.list",
    RoomAdd: "room.add",
    RoomDelete: "room.delete",
    RoomEdit: "room.edit",

    UserView: "user.view",
    UserList: "user.list",

    BuildingView: "building.view",
    BuildingList: "building.list",
    BuildingAdd: "building.add",
    BuildingDelete: "building.delete",
    BuildingEdit: "building.edit",

    EquipmentView: "equipment.view",
    EquipmentList: "equipment.list",
    EquipmentAdd: "equipment.add",
    EquipmentDelete: "equipment.delete",
    EquipmentEdit: "equipment.edit",

    ReservationView: "reservation.view",
    ReservationList: "reservation.list",
    ReservationForceCancel: "reservation.force.cancel",
    ReservationApprove: "reservation.approve",
    ReservationReject: "reservation.reject",
    ReservationCreate: "reservation.create",

    EventView: "event.view",
    EventList: "event.list",
    EventAdd: "event.add",
    EventDelete: "event.delete",
    EventEdit: "event.edit",

    RoleView: "role.view",
    RoleList: "role.list",
    RoleAdd: "role.add",
    RoleDelete: "role.delete",
    RoleEdit: "role.edit",

    PermissionList: "permission.list",
    RoleAssign: "role.assign",
};

export type Permission = (typeof Permission)[keyof typeof Permission];
