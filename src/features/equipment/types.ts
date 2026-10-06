import type { schemas } from "@/api/generated";
import { z } from "zod";

export type Equipment = z.infer<typeof schemas.EquipmentResponseDto>;
export type EquipmentPageState = {
    value: Equipment[];
    totalPages: number;
    page: number;
};
