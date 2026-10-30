import type { schemas } from "@/api/generated";
import type { z } from "zod";
import type { EQUIPMENT_ICONS } from "./icons";
import type { EquipmentFormSchema } from "./schemas";

export type Equipment = z.infer<typeof schemas.EquipmentResponseDto>;
export type EquipmentForm = z.infer<typeof EquipmentFormSchema>;
export type EquipmentIconName = keyof typeof EQUIPMENT_ICONS;
