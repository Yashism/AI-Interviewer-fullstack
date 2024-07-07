import axios, { AxiosInstance, AxiosRequestConfig } from "axios";

// Create a custom Axios instance
const api: AxiosInstance = axios.create();

// Add an interceptor to include the access token in the request headers
api.interceptors.request.use(
  (config: any) => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${accessToken}`,
      };
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default api;
