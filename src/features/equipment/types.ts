import type { schemas } from "@/api/generated";
import type { z } from "zod";

export type Equipment = z.infer<typeof schemas.EquipmentResponseDto>;
