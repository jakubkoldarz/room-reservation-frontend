import { z } from "zod";
import { pageParam, textParam } from "@/composables/useListQuery";

export const EventListQuerySchema = z.object({
    page: pageParam,
    name: textParam,
    when: textParam,
    date: textParam,
    building: textParam,
    room: textParam,
    type: textParam,
});
