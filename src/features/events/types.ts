import type { schemas } from "@/api/generated";
import type { z } from "zod";

export type EventInfo = z.infer<typeof schemas.EventResponseDto>;
