import { z } from "zod";
import { schemas } from "@/api/generated";
import { isEquipmentIconName } from "./icons";

/** Formularz sprzętu — ostrzejszy niż wygenerowany DTO: nazwa nie może być pusta, ikona musi być znana. */
export const EquipmentFormSchema = schemas.EquipmentRequestDto.extend({
    name: z
        .string()
        .trim()
        .min(1, "Name is required")
        .max(50, "Name can have at most 50 characters"),
    icon: z.string().refine(isEquipmentIconName, "Pick an icon"),
});

export type EquipmentForm = z.infer<typeof EquipmentFormSchema>;
