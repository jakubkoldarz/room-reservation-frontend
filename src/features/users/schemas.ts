import { z } from "zod";
import { pageParam, textParam } from "@/composables/useListQuery";

export const UserListQuerySchema = z.object({
    page: pageParam,
    lastname: textParam,
    firstname: textParam,
    email: textParam,
    role: textParam,
    sort: textParam,
});
