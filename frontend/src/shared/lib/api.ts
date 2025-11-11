// src/shared/lib/api.ts
// Purpose: Centralized Axios client and thin typed helpers.
// Notes:
// - Interceptor unwraps response.data.
// - `http.*` helpers give you Promise<T> so TS stops thinking in AxiosResponse<T>.

import axios from 'axios';
import type { AxiosRequestConfig } from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export const api = axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true,
});

api.interceptors.request.use((config) => {
    try {
        const token = window.localStorage.getItem('auth:token');
        if (token) {
            config.headers = config.headers ?? {};
            (config.headers as any).Authorization = `Bearer ${token}`;
        }
    } catch {}
    return config;
});

api.interceptors.response.use(
    (response) => response.data,
    (error) => {
        const status = error?.response?.status;
        const message =
            error?.response?.data?.message || error?.message || 'Une erreur est survenue.';
        const err = new Error(message) as Error & { status?: number };
        if (typeof status === 'number') err.status = status;
        return Promise.reject(err);
    }
);

// Typed thin wrappers so calls return Promise<T> (not AxiosResponse<T>)
export const http = {
    get<T>(url: string, config?: AxiosRequestConfig) {
        return api.get(url, config) as unknown as Promise<T>;
    },
    post<T>(url: string, data?: any, config?: AxiosRequestConfig) {
        return api.post(url, data, config) as unknown as Promise<T>;
    },
    put<T>(url: string, data?: any, config?: AxiosRequestConfig) {
        return api.put(url, data, config) as unknown as Promise<T>;
    },
    delete<T = void>(url: string, config?: AxiosRequestConfig) {
        return api.delete(url, config) as unknown as Promise<T>;
    },
};

export default api;
