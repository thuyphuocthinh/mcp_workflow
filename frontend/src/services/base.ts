import { TOKEN_KEY } from "@/constants";
import axios, {
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig
} from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5050";

export const http: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  withCredentials: false,
  headers: {
    "Content-Type": "application/json",
  },
});

http.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token =
      localStorage.getItem(TOKEN_KEY);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);


http.interceptors.response.use(
  (response: AxiosResponse) => {
    if (response.data && typeof response.data === "object" && "data" in response.data) {
      return response.data;
    }

    return response.data;
  },
  (error) => {
    const status = error?.response?.status;
    const message =
      error?.response?.data?.message ||
      error.message ||
      "Unknown error";

    if (status === 401) {
      localStorage.removeItem(TOKEN_KEY);
    }

    return Promise.reject({
      status,
      message,
      raw: error?.response?.data,
    });
  }
);
