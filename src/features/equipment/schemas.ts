import { z } from "zod";
import { schemas } from "@/api/generated";
import { isEquipmentIconName } from "./icons";

export const EquipmentFormSchema = schemas.EquipmentRequestDto.extend({
    name: z
        .string()
        .trim()
        .min(1, "Name is required")
        .max(50, "Name can have at most 50 characters"),
    icon: z.string().refine(isEquipmentIconName, "Pick an icon"),
});
