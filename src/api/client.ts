import { createApiClient } from "./generated";

const apiClient = createApiClient(import.meta.env.VITE_API_BASE_URL, { 
  axiosConfig: {
    
  }
});

export default apiClient;