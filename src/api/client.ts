import { useAuthStore } from "@/features/auth/stores/useAuthStore";
import { createApiClient } from "./generated";
import { HttpStatusCode, type AxiosError, type AxiosRequestConfig } from "axios";

const apiClient = createApiClient(import.meta.env.VITE_API_BASE_URL);

apiClient.axios.defaults.withCredentials = true;

apiClient.axios.interceptors.request.use((request) => {
    const authStore = useAuthStore();

    if (authStore.jwtToken) {
        request.headers.Authorization = `Bearer ${authStore.jwtToken}`;
    }

    return request;
});

apiClient.axios.interceptors.response.use(null, async (error: AxiosError) => {
    const isRefreshEndpoint = error.config?.url?.includes("/auth/refresh");
    if (isRefreshEndpoint) return Promise.reject(error);

    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    const isUnauthorized = error.response?.status === HttpStatusCode.Unauthorized;
    if (!isUnauthorized || originalRequest._retry) {
        return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
        const authStore = useAuthStore();
        await authStore.tryRefreshToken();

        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers.Authorization = `Bearer ${authStore.jwtToken}`;
        return apiClient.axios(originalRequest);
    } catch (refreshError) {
        return Promise.reject(refreshError);
    }
});

export default apiClient;
