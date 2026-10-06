import type apiClient from "@/api/client";

export type UserDetails = Awaited<ReturnType<typeof apiClient.getAuthme>>;
