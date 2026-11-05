import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
import { z } from "zod";

const RegisterRequestDto = z.object({ email: z.string(), password: z.string().min(8) });
const JwtTokenResponseDto = z.object({ jwtToken: z.string() });
const VerificationCodeRequestDto = z.object({ verificationCode: z.string() });
const LoginRequestDto = z.object({ email: z.string(), password: z.string() });
const LoginResponseDto = z.object({
    requires2FA: z.boolean(),
    verificationId: z.union([z.null(), z.string()]).optional(),
    jwtToken: z.union([z.null(), z.string()]).optional(),
});
const VerificationRequestDto = z.object({
    verificationId: z.string().uuid(),
    verificationCode: z.string(),
});
const BasicUserResponseDto = z.object({
    id: z.string().uuid(),
    firstname: z.union([z.null(), z.string()]).optional(),
    lastname: z.union([z.null(), z.string()]).optional(),
});
const UserAccountStatusResponseDto = z.object({
    hasProfileCompleted: z.boolean(),
    hasEmailVerified: z.boolean(),
    has2faEnabled: z.boolean(),
});
const RoleWithPermissionsResponseDto = z.object({
    role: z.string(),
    permissions: z.array(z.string()),
});
const RefreshTokenResponseDto = z.object({
    id: z.string().uuid(),
    created: z.string().datetime({ offset: true }),
    expires: z.string().datetime({ offset: true }),
    ipAddress: z.union([z.null(), z.string()]).optional(),
    userAgent: z.union([z.null(), z.string()]).optional(),
});
const UserDetailsResponseDto = z.object({
    userInfo: BasicUserResponseDto,
    accountStatus: UserAccountStatusResponseDto,
    roleInfo: RoleWithPermissionsResponseDto,
    refreshTokens: z.array(RefreshTokenResponseDto),
});
const ChangePasswordRequestDto = z.object({
    oldPassword: z.string().min(8),
    newPassword: z.string().min(8),
});
const EmailRequestDto = z.object({ emailAddress: z.string() });
const VerificationIdResponseDto = z.object({ verificationId: z.string().uuid() });
const ConfirmPasswordRequestDto = z.object({ password: z.string() });
const BasicBuildingResponseDto = z.object({
    id: z.string().uuid(),
    name: z.string(),
    identifier: z.union([z.null(), z.string()]).optional(),
    street: z.string(),
    city: z.string(),
    postalCode: z.string(),
    floorsCount: z.number().int(),
});
const PagedResponseDtoOfBasicBuildingResponseDto = z.object({
    items: z.array(BasicBuildingResponseDto),
    totalCount: z.number().int(),
    page: z.number().int(),
    pageSize: z.number().int(),
    totalPages: z.number().int(),
    hasNextPage: z.boolean(),
});
const DayOfWeek = z.number();
const AvailabilityRequestDto = z.object({
    dayOfWeek: DayOfWeek.int(),
    startTime: z.string(),
    endTime: z.string(),
});
const BuildingRequestDto = z.object({
    name: z.string().min(1).max(100),
    identifier: z.union([z.null(), z.string()]).optional(),
    street: z.string().min(1).max(50),
    city: z.string().min(1).max(50),
    postalCode: z.string().regex(/^[0-9]{2}-[0-9]{3}$/),
    floorsCount: z.number().int().gte(0).lte(100),
    availabilities: z.array(AvailabilityRequestDto),
});
const AvailabilityResponseDto = z.object({
    dayOfWeek: DayOfWeek.int(),
    startTime: z.string(),
    endTime: z.string(),
});
const BasicRoomResponseDto = z.object({
    id: z.string().uuid(),
    identifier: z.string(),
    requiresApproval: z.boolean(),
    capacity: z.number().int(),
    floor: z.number().int(),
});
const BuildingDetailsResponseDto = z.object({
    buildingInfo: BasicBuildingResponseDto,
    availabilities: z.array(AvailabilityResponseDto),
    rooms: z.array(BasicRoomResponseDto),
});
const EquipmentResponseDto = z.object({
    id: z.string().uuid(),
    name: z.string(),
    icon: z.string(),
});
const PagedResponseDtoOfEquipmentResponseDto = z.object({
    items: z.array(EquipmentResponseDto),
    totalCount: z.number().int(),
    page: z.number().int(),
    pageSize: z.number().int(),
    totalPages: z.number().int(),
    hasNextPage: z.boolean(),
});
const EquipmentRequestDto = z.object({ name: z.string().max(50), icon: z.string().max(50) });
const EventResponseDto = z.object({
    id: z.string().uuid(),
    name: z.string(),
    startDate: z.string(),
    endDate: z.string(),
    isClosed: z.boolean(),
    startTime: z.union([z.null(), z.string()]).optional(),
    endTime: z.union([z.null(), z.string()]).optional(),
    rooms: z.array(BasicRoomResponseDto),
});
const EventRequestDto = z.object({
    name: z.string().max(100),
    roomIds: z.array(z.string().uuid()),
    startDate: z.string(),
    endDate: z.string(),
    isClosed: z.boolean(),
    startTime: z.union([z.null(), z.string()]).optional(),
    endTime: z.union([z.null(), z.string()]).optional(),
});
const PermissionResponseDto = z.object({ id: z.string().uuid(), name: z.string() });
const PagedResponseDtoOfPermissionResponseDto = z.object({
    items: z.array(PermissionResponseDto),
    totalCount: z.number().int(),
    page: z.number().int(),
    pageSize: z.number().int(),
    totalPages: z.number().int(),
    hasNextPage: z.boolean(),
});
const ReservationActorResponseDto = z.object({
    at: z.string().datetime({ offset: true }),
    by: BasicUserResponseDto,
});
const ReservationResponseDto = z.object({
    id: z.string().uuid(),
    createdBy: ReservationActorResponseDto,
    approvedBy: z.union([z.null(), ReservationActorResponseDto]).optional(),
    canceledBy: z.union([z.null(), ReservationActorResponseDto]).optional(),
    rejectedBy: z.union([z.null(), ReservationActorResponseDto]).optional(),
    date: z.string(),
    startTime: z.string(),
    endTime: z.string(),
    purpose: z.union([z.null(), z.string()]).optional(),
    reason: z.union([z.null(), z.string()]).optional(),
    status: z.string().optional(),
});
const UpdateReservationRequestDto = z.object({
    startTime: z.string(),
    endTime: z.string(),
    purpose: z.union([z.null(), z.string()]).optional(),
});
const PagedResponseDtoOfReservationResponseDto = z.object({
    items: z.array(ReservationResponseDto),
    totalCount: z.number().int(),
    page: z.number().int(),
    pageSize: z.number().int(),
    totalPages: z.number().int(),
    hasNextPage: z.boolean(),
});
const CreateReservationRequestDto = z.object({
    roomId: z.string().uuid(),
    date: z.string(),
    startTime: z.string(),
    endTime: z.string(),
    purpose: z.union([z.null(), z.string()]).optional(),
});
const ReservationReasonRequestDto = z.object({ reason: z.union([z.null(), z.string()]) }).partial();
const RoleResponseDto = z.object({
    id: z.string().uuid(),
    name: z.string(),
    isDefault: z.boolean(),
    isSuperAdmin: z.boolean(),
    permissions: z.array(z.string()),
});
const PagedResponseDtoOfRoleResponseDto = z.object({
    items: z.array(RoleResponseDto),
    totalCount: z.number().int(),
    page: z.number().int(),
    pageSize: z.number().int(),
    totalPages: z.number().int(),
    hasNextPage: z.boolean(),
});
const RoleRequestDto = z.object({
    name: z.string().max(50),
    description: z.union([z.null(), z.string()]).optional(),
    isDefault: z.boolean(),
    isSuperAdmin: z.boolean(),
    permissionIds: z.array(z.string().uuid()),
});
const RoomListItemResponseDto = z.object({
    roomInfo: BasicRoomResponseDto,
    buildingInfo: BasicBuildingResponseDto,
    equipment: z.array(EquipmentResponseDto),
    availabilities: z.array(AvailabilityResponseDto),
});
const PagedResponseDtoOfRoomListItemResponseDto = z.object({
    items: z.array(RoomListItemResponseDto),
    totalCount: z.number().int(),
    page: z.number().int(),
    pageSize: z.number().int(),
    totalPages: z.number().int(),
    hasNextPage: z.boolean(),
});
const RoomRequestDto = z.object({
    identifier: z.string().max(50),
    requiresApproval: z.boolean(),
    buildingId: z.string().uuid(),
    floor: z.number().int(),
    capacity: z.number().int().gte(1).lte(2147483647),
    equipmentIds: z.array(z.string().uuid()).max(5),
    availabilities: z.array(AvailabilityRequestDto),
});
const RoomResponseDto = z.object({
    roomInfo: BasicRoomResponseDto,
    buildingInfo: BasicBuildingResponseDto,
    equipment: z.array(EquipmentResponseDto),
});
const RoomDetailsResponseDto = z.object({
    details: RoomResponseDto,
    reservations: z.array(ReservationResponseDto),
    availabilities: z.array(AvailabilityResponseDto),
    events: z.array(EventResponseDto),
});
const PagedResponseDtoOfBasicUserResponseDto = z.object({
    items: z.array(BasicUserResponseDto),
    totalCount: z.number().int(),
    page: z.number().int(),
    pageSize: z.number().int(),
    totalPages: z.number().int(),
    hasNextPage: z.boolean(),
});
const UpdateProfileRequestDto = z.object({
    firstname: z.string().min(3).max(50),
    lastname: z.string().max(100),
});

export const schemas = {
    RegisterRequestDto,
    JwtTokenResponseDto,
    VerificationCodeRequestDto,
    LoginRequestDto,
    LoginResponseDto,
    VerificationRequestDto,
    BasicUserResponseDto,
    UserAccountStatusResponseDto,
    RoleWithPermissionsResponseDto,
    RefreshTokenResponseDto,
    UserDetailsResponseDto,
    ChangePasswordRequestDto,
    EmailRequestDto,
    VerificationIdResponseDto,
    ConfirmPasswordRequestDto,
    BasicBuildingResponseDto,
    PagedResponseDtoOfBasicBuildingResponseDto,
    DayOfWeek,
    AvailabilityRequestDto,
    BuildingRequestDto,
    AvailabilityResponseDto,
    BasicRoomResponseDto,
    BuildingDetailsResponseDto,
    EquipmentResponseDto,
    PagedResponseDtoOfEquipmentResponseDto,
    EquipmentRequestDto,
    EventResponseDto,
    EventRequestDto,
    PermissionResponseDto,
    PagedResponseDtoOfPermissionResponseDto,
    ReservationActorResponseDto,
    ReservationResponseDto,
    UpdateReservationRequestDto,
    PagedResponseDtoOfReservationResponseDto,
    CreateReservationRequestDto,
    ReservationReasonRequestDto,
    RoleResponseDto,
    PagedResponseDtoOfRoleResponseDto,
    RoleRequestDto,
    RoomListItemResponseDto,
    PagedResponseDtoOfRoomListItemResponseDto,
    RoomRequestDto,
    RoomResponseDto,
    RoomDetailsResponseDto,
    PagedResponseDtoOfBasicUserResponseDto,
    UpdateProfileRequestDto,
};

const endpoints = makeApi([
    {
        method: "post",
        path: "/auth/2fa/disable",
        alias: "postAuth2fadisable",
        requestFormat: "json",
        parameters: [
            {
                name: "body",
                type: "Body",
                schema: z.object({ password: z.string() }),
            },
            {
                name: "userId",
                type: "Query",
                schema: z.string().uuid().optional(),
            },
        ],
        response: z.void(),
    },
    {
        method: "post",
        path: "/auth/2fa/enable",
        alias: "postAuth2faenable",
        requestFormat: "json",
        parameters: [
            {
                name: "userId",
                type: "Query",
                schema: z.string().uuid().optional(),
            },
        ],
        response: z.void(),
    },
    {
        method: "patch",
        path: "/auth/email",
        alias: "patchAuthemail",
        requestFormat: "json",
        parameters: [
            {
                name: "body",
                type: "Body",
                schema: z.object({ emailAddress: z.string() }),
            },
            {
                name: "userId",
                type: "Query",
                schema: z.string().uuid().optional(),
            },
        ],
        response: z.object({ verificationId: z.string().uuid() }),
    },
    {
        method: "post",
        path: "/auth/email/confirmation",
        alias: "postAuthemailconfirmation",
        requestFormat: "json",
        parameters: [
            {
                name: "userId",
                type: "Query",
                schema: z.string().uuid().optional(),
            },
        ],
        response: z.object({ verificationId: z.string().uuid() }),
    },
    {
        method: "post",
        path: "/auth/email/confirmation/verify",
        alias: "postAuthemailconfirmationverify",
        requestFormat: "json",
        parameters: [
            {
                name: "body",
                type: "Body",
                schema: z.object({ verificationCode: z.string() }),
            },
            {
                name: "userId",
                type: "Query",
                schema: z.string().uuid().optional(),
            },
        ],
        response: z.void(),
    },
    {
        method: "post",
        path: "/auth/email/verify",
        alias: "postAuthemailverify",
        requestFormat: "json",
        parameters: [
            {
                name: "body",
                type: "Body",
                schema: VerificationRequestDto,
            },
        ],
        response: z.void(),
    },
    {
        method: "post",
        path: "/auth/login",
        alias: "postAuthlogin",
        requestFormat: "json",
        parameters: [
            {
                name: "body",
                type: "Body",
                schema: LoginRequestDto,
            },
        ],
        response: LoginResponseDto,
    },
    {
        method: "post",
        path: "/auth/login/2fa",
        alias: "postAuthlogin2fa",
        requestFormat: "json",
        parameters: [
            {
                name: "body",
                type: "Body",
                schema: VerificationRequestDto,
            },
        ],
        response: z.object({ jwtToken: z.string() }),
    },
    {
        method: "post",
        path: "/auth/logout",
        alias: "postAuthlogout",
        requestFormat: "json",
        parameters: [
            {
                name: "userId",
                type: "Query",
                schema: z.string().uuid().optional(),
            },
        ],
        response: z.void(),
    },
    {
        method: "get",
        path: "/auth/me",
        alias: "getAuthme",
        requestFormat: "json",
        parameters: [
            {
                name: "userId",
                type: "Query",
                schema: z.string().uuid().optional(),
            },
        ],
        response: UserDetailsResponseDto,
    },
    {
        method: "patch",
        path: "/auth/password",
        alias: "patchAuthpassword",
        requestFormat: "json",
        parameters: [
            {
                name: "body",
                type: "Body",
                schema: ChangePasswordRequestDto,
            },
            {
                name: "userId",
                type: "Query",
                schema: z.string().uuid().optional(),
            },
        ],
        response: z.void(),
    },
    {
        method: "post",
        path: "/auth/refresh",
        alias: "postAuthrefresh",
        requestFormat: "json",
        response: z.object({ jwtToken: z.string() }),
    },
    {
        method: "post",
        path: "/auth/register",
        alias: "postAuthregister",
        requestFormat: "json",
        parameters: [
            {
                name: "body",
                type: "Body",
                schema: RegisterRequestDto,
            },
        ],
        response: z.object({ jwtToken: z.string() }),
    },
    {
        method: "delete",
        path: "/auth/sessions",
        alias: "deleteAuthsessions",
        requestFormat: "json",
        parameters: [
            {
                name: "userId",
                type: "Query",
                schema: z.string().uuid().optional(),
            },
        ],
        response: z.void(),
    },
    {
        method: "delete",
        path: "/auth/sessions/:refreshTokenId",
        alias: "deleteAuthsessionsRefreshTokenId",
        requestFormat: "json",
        parameters: [
            {
                name: "userId",
                type: "Query",
                schema: z.string().uuid().optional(),
            },
            {
                name: "refreshTokenId",
                type: "Path",
                schema: z.string().uuid(),
            },
        ],
        response: z.void(),
    },
    {
        method: "get",
        path: "/buildings",
        alias: "getBuildings",
        requestFormat: "json",
        parameters: [
            {
                name: "Name",
                type: "Query",
                schema: z.string().optional(),
            },
            {
                name: "Identifier",
                type: "Query",
                schema: z.string().optional(),
            },
            {
                name: "Street",
                type: "Query",
                schema: z.string().optional(),
            },
            {
                name: "City",
                type: "Query",
                schema: z.string().optional(),
            },
            {
                name: "PostalCode",
                type: "Query",
                schema: z.string().optional(),
            },
            {
                name: "Page",
                type: "Query",
                schema: z.number().int().gte(1).lte(2147483647).optional(),
            },
            {
                name: "PageSize",
                type: "Query",
                schema: z.number().int().gte(1).lte(100).optional(),
            },
        ],
        response: PagedResponseDtoOfBasicBuildingResponseDto,
    },
    {
        method: "post",
        path: "/buildings",
        alias: "postBuildings",
        requestFormat: "json",
        parameters: [
            {
                name: "body",
                type: "Body",
                schema: BuildingRequestDto,
            },
        ],
        response: BasicBuildingResponseDto,
    },
    {
        method: "get",
        path: "/buildings/:buildingId",
        alias: "getBuildingsBuildingId",
        requestFormat: "json",
        parameters: [
            {
                name: "buildingId",
                type: "Path",
                schema: z.string().uuid(),
            },
        ],
        response: BuildingDetailsResponseDto,
    },
    {
        method: "put",
        path: "/buildings/:buildingId",
        alias: "putBuildingsBuildingId",
        requestFormat: "json",
        parameters: [
            {
                name: "body",
                type: "Body",
                schema: BuildingRequestDto,
            },
            {
                name: "buildingId",
                type: "Path",
                schema: z.string().uuid(),
            },
        ],
        response: BasicBuildingResponseDto,
    },
    {
        method: "delete",
        path: "/buildings/:buildingId",
        alias: "deleteBuildingsBuildingId",
        requestFormat: "json",
        parameters: [
            {
                name: "buildingId",
                type: "Path",
                schema: z.string().uuid(),
            },
        ],
        response: z.void(),
    },
    {
        method: "get",
        path: "/equipment",
        alias: "getEquipment",
        requestFormat: "json",
        parameters: [
            {
                name: "Name",
                type: "Query",
                schema: z.string().optional(),
            },
            {
                name: "Page",
                type: "Query",
                schema: z.number().int().gte(1).lte(2147483647).optional(),
            },
            {
                name: "PageSize",
                type: "Query",
                schema: z.number().int().gte(1).lte(100).optional(),
            },
        ],
        response: PagedResponseDtoOfEquipmentResponseDto,
    },
    {
        method: "post",
        path: "/equipment",
        alias: "postEquipment",
        requestFormat: "json",
        parameters: [
            {
                name: "body",
                type: "Body",
                schema: EquipmentRequestDto,
            },
        ],
        response: EquipmentResponseDto,
    },
    {
        method: "get",
        path: "/equipment/:equipmentId",
        alias: "getEquipmentEquipmentId",
        requestFormat: "json",
        parameters: [
            {
                name: "equipmentId",
                type: "Path",
                schema: z.string().uuid(),
            },
        ],
        response: EquipmentResponseDto,
    },
    {
        method: "put",
        path: "/equipment/:equipmentId",
        alias: "putEquipmentEquipmentId",
        requestFormat: "json",
        parameters: [
            {
                name: "body",
                type: "Body",
                schema: EquipmentRequestDto,
            },
            {
                name: "equipmentId",
                type: "Path",
                schema: z.string().uuid(),
            },
        ],
        response: EquipmentResponseDto,
    },
    {
        method: "delete",
        path: "/equipment/:equipmentId",
        alias: "deleteEquipmentEquipmentId",
        requestFormat: "json",
        parameters: [
            {
                name: "equipmentId",
                type: "Path",
                schema: z.string().uuid(),
            },
        ],
        response: z.void(),
    },
    {
        method: "post",
        path: "/events",
        alias: "postEvents",
        requestFormat: "json",
        parameters: [
            {
                name: "body",
                type: "Body",
                schema: EventRequestDto,
            },
            {
                name: "force",
                type: "Query",
                schema: z.boolean().optional().default(false),
            },
        ],
        response: EventResponseDto,
    },
    {
        method: "get",
        path: "/events/:eventId",
        alias: "getEventsEventId",
        requestFormat: "json",
        parameters: [
            {
                name: "eventId",
                type: "Path",
                schema: z.string().uuid(),
            },
        ],
        response: EventResponseDto,
    },
    {
        method: "put",
        path: "/events/:eventId",
        alias: "putEventsEventId",
        requestFormat: "json",
        parameters: [
            {
                name: "body",
                type: "Body",
                schema: EventRequestDto,
            },
            {
                name: "eventId",
                type: "Path",
                schema: z.string().uuid(),
            },
            {
                name: "force",
                type: "Query",
                schema: z.boolean().optional().default(false),
            },
        ],
        response: EventResponseDto,
    },
    {
        method: "delete",
        path: "/events/:eventId",
        alias: "deleteEventsEventId",
        requestFormat: "json",
        parameters: [
            {
                name: "eventId",
                type: "Path",
                schema: z.string().uuid(),
            },
            {
                name: "force",
                type: "Query",
                schema: z.boolean().optional().default(false),
            },
        ],
        response: z.void(),
    },
    {
        method: "get",
        path: "/events/rooms/:roomId",
        alias: "getEventsroomsRoomId",
        requestFormat: "json",
        parameters: [
            {
                name: "roomId",
                type: "Path",
                schema: z.string().uuid(),
            },
        ],
        response: z.array(EventResponseDto),
    },
    {
        method: "get",
        path: "/permissions",
        alias: "getPermissions",
        requestFormat: "json",
        parameters: [
            {
                name: "Name",
                type: "Query",
                schema: z.string().optional(),
            },
            {
                name: "Page",
                type: "Query",
                schema: z.number().int().gte(1).lte(2147483647).optional(),
            },
            {
                name: "PageSize",
                type: "Query",
                schema: z.number().int().gte(1).lte(100).optional(),
            },
        ],
        response: PagedResponseDtoOfPermissionResponseDto,
    },
    {
        method: "get",
        path: "/reservations",
        alias: "getReservations",
        requestFormat: "json",
        parameters: [
            {
                name: "CreatedById",
                type: "Query",
                schema: z.string().uuid().optional(),
            },
            {
                name: "ApprovedById",
                type: "Query",
                schema: z.string().uuid().optional(),
            },
            {
                name: "CanceledById",
                type: "Query",
                schema: z.string().uuid().optional(),
            },
            {
                name: "RoomId",
                type: "Query",
                schema: z.string().uuid().optional(),
            },
            {
                name: "BuildingId",
                type: "Query",
                schema: z.string().uuid().optional(),
            },
            {
                name: "Date",
                type: "Query",
                schema: z.string().optional(),
            },
            {
                name: "Status",
                type: "Query",
                schema: z.number().int().optional(),
            },
            {
                name: "Page",
                type: "Query",
                schema: z.number().int().gte(1).lte(2147483647).optional(),
            },
            {
                name: "PageSize",
                type: "Query",
                schema: z.number().int().gte(1).lte(100).optional(),
            },
        ],
        response: PagedResponseDtoOfReservationResponseDto,
    },
    {
        method: "post",
        path: "/reservations",
        alias: "postReservations",
        requestFormat: "json",
        parameters: [
            {
                name: "body",
                type: "Body",
                schema: CreateReservationRequestDto,
            },
            {
                name: "userId",
                type: "Query",
                schema: z.string().uuid().optional(),
            },
        ],
        response: ReservationResponseDto,
    },
    {
        method: "get",
        path: "/reservations/:reservationId",
        alias: "getReservationsReservationId",
        requestFormat: "json",
        parameters: [
            {
                name: "reservationId",
                type: "Path",
                schema: z.string().uuid(),
            },
        ],
        response: ReservationResponseDto,
    },
    {
        method: "delete",
        path: "/reservations/:reservationId",
        alias: "deleteReservationsReservationId",
        requestFormat: "json",
        parameters: [
            {
                name: "reservationId",
                type: "Path",
                schema: z.string().uuid(),
            },
            {
                name: "userId",
                type: "Query",
                schema: z.string().uuid().optional(),
            },
        ],
        response: z.void(),
    },
    {
        method: "put",
        path: "/reservations/:reservationId",
        alias: "putReservationsReservationId",
        requestFormat: "json",
        parameters: [
            {
                name: "body",
                type: "Body",
                schema: UpdateReservationRequestDto,
            },
            {
                name: "reservationId",
                type: "Path",
                schema: z.string().uuid(),
            },
            {
                name: "userId",
                type: "Query",
                schema: z.string().uuid().optional(),
            },
        ],
        response: ReservationResponseDto,
    },
    {
        method: "post",
        path: "/reservations/:reservationId/approve",
        alias: "postReservationsReservationIdapprove",
        requestFormat: "json",
        parameters: [
            {
                name: "reservationId",
                type: "Path",
                schema: z.string().uuid(),
            },
            {
                name: "userId",
                type: "Query",
                schema: z.string().uuid().optional(),
            },
        ],
        response: z.void(),
    },
    {
        method: "post",
        path: "/reservations/:reservationId/cancel",
        alias: "postReservationsReservationIdcancel",
        requestFormat: "json",
        parameters: [
            {
                name: "body",
                type: "Body",
                schema: ReservationReasonRequestDto,
            },
            {
                name: "reservationId",
                type: "Path",
                schema: z.string().uuid(),
            },
            {
                name: "userId",
                type: "Query",
                schema: z.string().uuid().optional(),
            },
        ],
        response: z.void(),
    },
    {
        method: "post",
        path: "/reservations/:reservationId/force-cancel",
        alias: "postReservationsReservationIdforceCancel",
        requestFormat: "json",
        parameters: [
            {
                name: "body",
                type: "Body",
                schema: ReservationReasonRequestDto,
            },
            {
                name: "reservationId",
                type: "Path",
                schema: z.string().uuid(),
            },
            {
                name: "userId",
                type: "Query",
                schema: z.string().uuid().optional(),
            },
        ],
        response: z.void(),
    },
    {
        method: "post",
        path: "/reservations/:reservationId/reject",
        alias: "postReservationsReservationIdreject",
        requestFormat: "json",
        parameters: [
            {
                name: "body",
                type: "Body",
                schema: ReservationReasonRequestDto,
            },
            {
                name: "reservationId",
                type: "Path",
                schema: z.string().uuid(),
            },
            {
                name: "userId",
                type: "Query",
                schema: z.string().uuid().optional(),
            },
        ],
        response: z.void(),
    },
    {
        method: "get",
        path: "/reservations/mine",
        alias: "getReservationsmine",
        requestFormat: "json",
        parameters: [
            {
                name: "CreatedById",
                type: "Query",
                schema: z.string().uuid().optional(),
            },
            {
                name: "ApprovedById",
                type: "Query",
                schema: z.string().uuid().optional(),
            },
            {
                name: "CanceledById",
                type: "Query",
                schema: z.string().uuid().optional(),
            },
            {
                name: "RoomId",
                type: "Query",
                schema: z.string().uuid().optional(),
            },
            {
                name: "BuildingId",
                type: "Query",
                schema: z.string().uuid().optional(),
            },
            {
                name: "Date",
                type: "Query",
                schema: z.string().optional(),
            },
            {
                name: "Status",
                type: "Query",
                schema: z.number().int().optional(),
            },
            {
                name: "Page",
                type: "Query",
                schema: z.number().int().gte(1).lte(2147483647).optional(),
            },
            {
                name: "PageSize",
                type: "Query",
                schema: z.number().int().gte(1).lte(100).optional(),
            },
            {
                name: "userId",
                type: "Query",
                schema: z.string().uuid().optional(),
            },
        ],
        response: PagedResponseDtoOfReservationResponseDto,
    },
    {
        method: "get",
        path: "/roles",
        alias: "getRoles",
        requestFormat: "json",
        parameters: [
            {
                name: "Name",
                type: "Query",
                schema: z.string().optional(),
            },
            {
                name: "Page",
                type: "Query",
                schema: z.number().int().gte(1).lte(2147483647).optional(),
            },
            {
                name: "PageSize",
                type: "Query",
                schema: z.number().int().gte(1).lte(100).optional(),
            },
        ],
        response: PagedResponseDtoOfRoleResponseDto,
    },
    {
        method: "post",
        path: "/roles",
        alias: "postRoles",
        requestFormat: "json",
        parameters: [
            {
                name: "body",
                type: "Body",
                schema: RoleRequestDto,
            },
            {
                name: "force",
                type: "Query",
                schema: z.boolean().optional().default(false),
            },
        ],
        response: RoleResponseDto,
    },
    {
        method: "get",
        path: "/roles/:roleId",
        alias: "getRolesRoleId",
        requestFormat: "json",
        parameters: [
            {
                name: "roleId",
                type: "Path",
                schema: z.string().uuid(),
            },
        ],
        response: RoleResponseDto,
    },
    {
        method: "put",
        path: "/roles/:roleId",
        alias: "putRolesRoleId",
        requestFormat: "json",
        parameters: [
            {
                name: "body",
                type: "Body",
                schema: RoleRequestDto,
            },
            {
                name: "roleId",
                type: "Path",
                schema: z.string().uuid(),
            },
            {
                name: "force",
                type: "Query",
                schema: z.boolean().optional().default(false),
            },
        ],
        response: RoleResponseDto,
    },
    {
        method: "delete",
        path: "/roles/:roleId",
        alias: "deleteRolesRoleId",
        requestFormat: "json",
        parameters: [
            {
                name: "roleId",
                type: "Path",
                schema: z.string().uuid(),
            },
        ],
        response: z.void(),
    },
    {
        method: "post",
        path: "/roles/:roleId/assign",
        alias: "postRolesRoleIdassign",
        requestFormat: "json",
        parameters: [
            {
                name: "roleId",
                type: "Path",
                schema: z.string().uuid(),
            },
            {
                name: "userId",
                type: "Query",
                schema: z.string().uuid().optional(),
            },
            {
                name: "requestingUserId",
                type: "Query",
                schema: z.string().uuid().optional(),
            },
        ],
        response: z.void(),
    },
    {
        method: "get",
        path: "/rooms",
        alias: "getRooms",
        requestFormat: "json",
        parameters: [
            {
                name: "BuildingId",
                type: "Query",
                schema: z.string().uuid().optional(),
            },
            {
                name: "Identifier",
                type: "Query",
                schema: z.string().optional(),
            },
            {
                name: "MinCapacity",
                type: "Query",
                schema: z.number().int().optional(),
            },
            {
                name: "Floor",
                type: "Query",
                schema: z.number().int().optional(),
            },
            {
                name: "DayOfWeek",
                type: "Query",
                schema: z.number().int().optional(),
            },
            {
                name: "StartTime",
                type: "Query",
                schema: z.string().optional(),
            },
            {
                name: "EndTime",
                type: "Query",
                schema: z.string().optional(),
            },
            {
                name: "EquipmentIds",
                type: "Query",
                schema: z.array(z.string().uuid()).optional(),
            },
            {
                name: "Page",
                type: "Query",
                schema: z.number().int().gte(1).lte(2147483647).optional(),
            },
            {
                name: "PageSize",
                type: "Query",
                schema: z.number().int().gte(1).lte(100).optional(),
            },
        ],
        response: PagedResponseDtoOfRoomListItemResponseDto,
    },
    {
        method: "post",
        path: "/rooms",
        alias: "postRooms",
        requestFormat: "json",
        parameters: [
            {
                name: "body",
                type: "Body",
                schema: RoomRequestDto,
            },
        ],
        response: BasicRoomResponseDto,
    },
    {
        method: "get",
        path: "/rooms/:roomId",
        alias: "getRoomsRoomId",
        requestFormat: "json",
        parameters: [
            {
                name: "roomId",
                type: "Path",
                schema: z.string().uuid(),
            },
        ],
        response: RoomDetailsResponseDto,
    },
    {
        method: "put",
        path: "/rooms/:roomId",
        alias: "putRoomsRoomId",
        requestFormat: "json",
        parameters: [
            {
                name: "body",
                type: "Body",
                schema: RoomRequestDto,
            },
            {
                name: "roomId",
                type: "Path",
                schema: z.string().uuid(),
            },
            {
                name: "force",
                type: "Query",
                schema: z.boolean().optional().default(false),
            },
        ],
        response: BasicRoomResponseDto,
    },
    {
        method: "delete",
        path: "/rooms/:roomId",
        alias: "deleteRoomsRoomId",
        requestFormat: "json",
        parameters: [
            {
                name: "roomId",
                type: "Path",
                schema: z.string().uuid(),
            },
            {
                name: "force",
                type: "Query",
                schema: z.boolean().optional().default(false),
            },
        ],
        response: z.void(),
    },
    {
        method: "get",
        path: "/users",
        alias: "getUsers",
        requestFormat: "json",
        parameters: [
            {
                name: "Firstname",
                type: "Query",
                schema: z.string().optional(),
            },
            {
                name: "Lastname",
                type: "Query",
                schema: z.string().optional(),
            },
            {
                name: "Email",
                type: "Query",
                schema: z.string().optional(),
            },
            {
                name: "RoleId",
                type: "Query",
                schema: z.string().uuid().optional(),
            },
            {
                name: "Page",
                type: "Query",
                schema: z.number().int().gte(1).lte(2147483647).optional(),
            },
            {
                name: "PageSize",
                type: "Query",
                schema: z.number().int().gte(1).lte(100).optional(),
            },
        ],
        response: PagedResponseDtoOfBasicUserResponseDto,
    },
    {
        method: "get",
        path: "/users/:userId",
        alias: "getUsersUserId",
        requestFormat: "json",
        parameters: [
            {
                name: "userId",
                type: "Path",
                schema: z.string().uuid(),
            },
        ],
        response: BasicUserResponseDto,
    },
    {
        method: "put",
        path: "/users/profile",
        alias: "putUsersprofile",
        requestFormat: "json",
        parameters: [
            {
                name: "body",
                type: "Body",
                schema: UpdateProfileRequestDto,
            },
            {
                name: "userId",
                type: "Query",
                schema: z.string().uuid().optional(),
            },
        ],
        response: BasicUserResponseDto,
    },
]);

export const api = new Zodios(endpoints);

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
    return new Zodios(baseUrl, endpoints, options);
}
