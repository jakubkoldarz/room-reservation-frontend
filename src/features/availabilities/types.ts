import type { schemas } from "@/api/generated";
import { z } from "zod";

export type Availability = z.infer<typeof schemas.AvailabilityRequestDto>;
