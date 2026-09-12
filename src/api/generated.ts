import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
import { z } from "zod";

const RegisterRequestDto = z
  .object({ email: z.string(), password: z.string() })
  .passthrough();
const JwtTokenResponseDto = z.object({ jwtToken: z.string() }).passthrough();
const VerificationCodedRequestDto = z
  .object({ verificationCode: z.string() })
  .passthrough();
const LoginRequestDto = z
  .object({ email: z.string(), password: z.string() })
  .passthrough();
const LoginResponseDto = z
  .object({
    requires2FA: z.boolean(),
    verificationId: z.union([z.null(), z.string()]).optional(),
    jwtToken: z.union([z.null(), z.string()]).optional(),
  })
  .passthrough();
const VerificationRequestDto = z
  .object({ verificationId: z.string().uuid(), verificationCode: z.string() })
  .passthrough();
const BasicUserResponseDto = z
  .object({
    id: z.string().uuid(),
    firstname: z.union([z.null(), z.string()]),
    lastname: z.union([z.null(), z.string()]),
  })
  .passthrough();
const UserAccountStatusResponseDto = z
  .object({
    hasProfileCompleted: z.boolean(),
    hasEmailVerified: z.boolean(),
    has2faEnabled: z.boolean(),
  })
  .passthrough();
const RoleWithPermissionsResponseDto = z
  .object({ role: z.string(), permissions: z.array(z.string()) })
  .passthrough();
const RefreshTokenResponseDto = z
  .object({
    id: z.string().uuid(),
    created: z.string().datetime({ offset: true }),
    expires: z.string().datetime({ offset: true }),
    ipAddress: z.union([z.null(), z.string()]).optional(),
    userAgent: z.union([z.null(), z.string()]).optional(),
  })
  .passthrough();
const UserDetailsResponseDto = z
  .object({
    userInfo: BasicUserResponseDto,
    accountStatus: UserAccountStatusResponseDto,
    roleInfo: RoleWithPermissionsResponseDto,
    refreshTokens: z.array(RefreshTokenResponseDto),
  })
  .passthrough();
const ChangePasswordRequestDto = z
  .object({ oldPassword: z.string(), newPassword: z.string() })
  .passthrough();
const EmailRequestDto = z.object({ emailAddress: z.string() }).passthrough();
const VerificationIdResponseDto = z
  .object({ verificationId: z.string().uuid() })
  .passthrough();
const Page = z.union([z.number(), z.string()]).optional();
const BasicBuildingResponseDto = z
  .object({
    id: z.string().uuid(),
    name: z.string(),
    identifier: z.union([z.null(), z.string()]),
    street: z.string(),
    city: z.string(),
    postalCode: z.string(),
    floorsCount: z.union([z.number(), z.string()]),
  })
  .passthrough();
const ErrorType = z.number();
const Error = z
  .object({ errorMessage: z.string(), errorType: ErrorType.int() })
  .passthrough();
const PagedResultOfBasicBuildingResponseDto = z
  .object({
    isSuccess: z.boolean(),
    value: z.union([z.null(), z.array(BasicBuildingResponseDto)]),
    error: z.union([z.null(), Error]),
    totalCount: z.union([z.number(), z.string()]),
    page: z.union([z.number(), z.string()]),
    pageSize: z.union([z.number(), z.string()]),
    totalPages: z.union([z.number(), z.string()]),
    hasNextPage: z.boolean(),
  })
  .partial()
  .passthrough();
const DayOfWeek = z.number();
const AvailabilityRequestDto = z
  .object({
    dayOfWeek: DayOfWeek.int(),
    startTime: z.string(),
    endTime: z.string(),
  })
  .passthrough();
const BuildingRequestDto = z
  .object({
    name: z.string(),
    identifier: z.union([z.null(), z.string()]),
    street: z.string(),
    city: z.string(),
    postalCode: z.string(),
    floorsCount: z.union([z.number(), z.string()]),
    availabilities: z.array(AvailabilityRequestDto),
  })
  .passthrough();
const AvailabilityResponseDto = z
  .object({
    dayOfWeek: DayOfWeek.int(),
    startTime: z.string(),
    endTime: z.string(),
  })
  .passthrough();
const BasicRoomResponseDto = z
  .object({
    id: z.string().uuid(),
    identifier: z.string(),
    requiresApproval: z.boolean(),
    capacity: z.union([z.number(), z.string()]),
    floor: z.union([z.number(), z.string()]),
  })
  .passthrough();
const BuildingDetailsResponseDto = z
  .object({
    buildingInfo: BasicBuildingResponseDto,
    availabilities: z.array(AvailabilityResponseDto),
    rooms: z.array(BasicRoomResponseDto),
  })
  .passthrough();
const EquipmentResponseDto = z
  .object({ id: z.string().uuid(), name: z.string(), icon: z.string() })
  .passthrough();
const PagedResultOfEquipmentResponseDto = z
  .object({
    isSuccess: z.boolean(),
    value: z.union([z.null(), z.array(EquipmentResponseDto)]),
    error: z.union([z.null(), Error]),
    totalCount: z.union([z.number(), z.string()]),
    page: z.union([z.number(), z.string()]),
    pageSize: z.union([z.number(), z.string()]),
    totalPages: z.union([z.number(), z.string()]),
    hasNextPage: z.boolean(),
  })
  .partial()
  .passthrough();
const EquipmentRequestDto = z
  .object({ name: z.string(), icon: z.string() })
  .passthrough();
const EventResponseDto = z
  .object({
    id: z.string().uuid(),
    name: z.string(),
    startDate: z.string(),
    endDate: z.string(),
    isClosed: z.boolean(),
    startTime: z.union([z.null(), z.string()]),
    endTime: z.union([z.null(), z.string()]),
    rooms: z.array(BasicRoomResponseDto),
  })
  .passthrough();
const EventRequestDto = z
  .object({
    name: z.string(),
    roomIds: z.array(z.string().uuid()),
    startDate: z.string(),
    endDate: z.string(),
    isClosed: z.boolean(),
    startTime: z.union([z.null(), z.string()]),
    endTime: z.union([z.null(), z.string()]),
  })
  .passthrough();
const PermissionResponseDto = z
  .object({ id: z.string().uuid(), name: z.string() })
  .passthrough();
const ReservationActorResponseDto = z
  .object({
    at: z.string().datetime({ offset: true }),
    by: BasicUserResponseDto,
  })
  .passthrough();
const ReservationResponseDto = z
  .object({
    id: z.string().uuid(),
    createdBy: ReservationActorResponseDto,
    approvedBy: z.union([z.null(), ReservationActorResponseDto]),
    canceledBy: z.union([z.null(), ReservationActorResponseDto]),
    rejectedBy: z.union([z.null(), ReservationActorResponseDto]),
    date: z.string(),
    startTime: z.string(),
    endTime: z.string(),
    purpose: z.union([z.null(), z.string()]),
    reason: z.union([z.null(), z.string()]),
    status: z.string(),
  })
  .passthrough();
const UpdateReservationRequestDto = z
  .object({
    startTime: z.string(),
    endTime: z.string(),
    purpose: z.union([z.null(), z.string()]),
  })
  .passthrough();
const PagedResultOfReservationResponseDto = z
  .object({
    isSuccess: z.boolean(),
    value: z.union([z.null(), z.array(ReservationResponseDto)]),
    error: z.union([z.null(), Error]),
    totalCount: z.union([z.number(), z.string()]),
    page: z.union([z.number(), z.string()]),
    pageSize: z.union([z.number(), z.string()]),
    totalPages: z.union([z.number(), z.string()]),
    hasNextPage: z.boolean(),
  })
  .partial()
  .passthrough();
const CreateReservationRequestDto = z
  .object({
    roomId: z.string().uuid(),
    date: z.string(),
    startTime: z.string(),
    endTime: z.string(),
    purpose: z.union([z.null(), z.string()]),
  })
  .passthrough();
const ReservationReasonRequestDto = z
  .object({ reason: z.union([z.null(), z.string()]) })
  .passthrough();
const RoleResponseDto = z
  .object({
    id: z.string().uuid(),
    name: z.string(),
    isDefault: z.boolean(),
    isSuperAdmin: z.boolean(),
    permissions: z.array(z.string()),
  })
  .passthrough();
const PagedResultOfRoleResponseDto = z
  .object({
    isSuccess: z.boolean(),
    value: z.union([z.null(), z.array(RoleResponseDto)]),
    error: z.union([z.null(), Error]),
    totalCount: z.union([z.number(), z.string()]),
    page: z.union([z.number(), z.string()]),
    pageSize: z.union([z.number(), z.string()]),
    totalPages: z.union([z.number(), z.string()]),
    hasNextPage: z.boolean(),
  })
  .partial()
  .passthrough();
const RoleRequestDto = z
  .object({
    name: z.string(),
    description: z.union([z.null(), z.string()]),
    isDefault: z.boolean(),
    isSuperAdmin: z.boolean(),
    permissionIds: z.array(z.string().uuid()),
  })
  .passthrough();
const PagedResultOfBasicRoomResponseDto = z
  .object({
    isSuccess: z.boolean(),
    value: z.union([z.null(), z.array(BasicRoomResponseDto)]),
    error: z.union([z.null(), Error]),
    totalCount: z.union([z.number(), z.string()]),
    page: z.union([z.number(), z.string()]),
    pageSize: z.union([z.number(), z.string()]),
    totalPages: z.union([z.number(), z.string()]),
    hasNextPage: z.boolean(),
  })
  .partial()
  .passthrough();
const RoomRequestDto = z
  .object({
    identifier: z.string(),
    requiresApproval: z.boolean(),
    buildingId: z.string().uuid(),
    floor: z.union([z.number(), z.string()]),
    capacity: z.union([z.number(), z.string()]),
    equipmentIds: z.array(z.string().uuid()),
    availabilities: z.array(AvailabilityRequestDto),
  })
  .passthrough();
const PagedResultOfBasicUserResponseDto = z
  .object({
    isSuccess: z.boolean(),
    value: z.union([z.null(), z.array(BasicUserResponseDto)]),
    error: z.union([z.null(), Error]),
    totalCount: z.union([z.number(), z.string()]),
    page: z.union([z.number(), z.string()]),
    pageSize: z.union([z.number(), z.string()]),
    totalPages: z.union([z.number(), z.string()]),
    hasNextPage: z.boolean(),
  })
  .partial()
  .passthrough();
const UpdateProfileRequestDto = z
  .object({ firstname: z.string(), lastname: z.string() })
  .passthrough();

export const schemas = {
  RegisterRequestDto,
  JwtTokenResponseDto,
  VerificationCodedRequestDto,
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
  Page,
  BasicBuildingResponseDto,
  ErrorType,
  Error,
  PagedResultOfBasicBuildingResponseDto,
  DayOfWeek,
  AvailabilityRequestDto,
  BuildingRequestDto,
  AvailabilityResponseDto,
  BasicRoomResponseDto,
  BuildingDetailsResponseDto,
  EquipmentResponseDto,
  PagedResultOfEquipmentResponseDto,
  EquipmentRequestDto,
  EventResponseDto,
  EventRequestDto,
  PermissionResponseDto,
  ReservationActorResponseDto,
  ReservationResponseDto,
  UpdateReservationRequestDto,
  PagedResultOfReservationResponseDto,
  CreateReservationRequestDto,
  ReservationReasonRequestDto,
  RoleResponseDto,
  PagedResultOfRoleResponseDto,
  RoleRequestDto,
  PagedResultOfBasicRoomResponseDto,
  RoomRequestDto,
  PagedResultOfBasicUserResponseDto,
  UpdateProfileRequestDto,
};

const endpoints = makeApi([
  {
    method: "post",
    path: "/auth/email",
    alias: "postAuthemail",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: z.object({ emailAddress: z.string() }).passthrough(),
      },
      {
        name: "userId",
        type: "Query",
        schema: z.string().uuid().optional(),
      },
    ],
    response: z.object({ verificationId: z.string().uuid() }).passthrough(),
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
    response: z.object({ verificationId: z.string().uuid() }).passthrough(),
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
        schema: z.object({ verificationCode: z.string() }).passthrough(),
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
    response: z.object({ jwtToken: z.string() }).passthrough(),
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
    method: "post",
    path: "/auth/password",
    alias: "postAuthpassword",
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
    response: z.object({ jwtToken: z.string() }).passthrough(),
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
    response: z.object({ jwtToken: z.string() }).passthrough(),
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
        schema: Page,
      },
      {
        name: "PageSize",
        type: "Query",
        schema: Page,
      },
    ],
    response: PagedResultOfBasicBuildingResponseDto,
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
        schema: Page,
      },
      {
        name: "PageSize",
        type: "Query",
        schema: Page,
      },
    ],
    response: PagedResultOfEquipmentResponseDto,
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
    response: z.array(PermissionResponseDto),
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
        schema: Page,
      },
      {
        name: "PageSize",
        type: "Query",
        schema: Page,
      },
    ],
    response: PagedResultOfReservationResponseDto,
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
        schema: Page,
      },
      {
        name: "PageSize",
        type: "Query",
        schema: Page,
      },
    ],
    response: PagedResultOfReservationResponseDto,
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
        schema: Page,
      },
      {
        name: "PageSize",
        type: "Query",
        schema: Page,
      },
    ],
    response: PagedResultOfRoleResponseDto,
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
        schema: Page,
      },
      {
        name: "Floor",
        type: "Query",
        schema: Page,
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
        schema: Page,
      },
      {
        name: "PageSize",
        type: "Query",
        schema: Page,
      },
    ],
    response: PagedResultOfBasicRoomResponseDto,
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
    response: BasicRoomResponseDto,
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
        schema: Page,
      },
      {
        name: "PageSize",
        type: "Query",
        schema: Page,
      },
    ],
    response: PagedResultOfBasicUserResponseDto,
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
    response: UserDetailsResponseDto,
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
