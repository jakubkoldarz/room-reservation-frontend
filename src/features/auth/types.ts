import type { schemas } from "@/api/generated";
import type { z } from "zod";

export type RefreshToken = z.infer<typeof schemas.RefreshTokenResponseDto>;
