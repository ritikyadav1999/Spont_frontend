import axios, { AxiosHeaders, type InternalAxiosRequestConfig } from "axios";
import { API_ROUTES } from "@/config/api-routes";
import { env } from "@/config/env";
import { tokenStorage } from "@/lib/api/token-storage";
import { unwrapApiResponse } from "@/lib/utils/api-response";
import type { ApiEnvelope } from "@/types/api.types";

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

const setAuthorizationHeader = (config: InternalAxiosRequestConfig, token: string) => {
  const headers = AxiosHeaders.from(config.headers);
  headers.set("Authorization", `Bearer ${token}`);
  config.headers = headers;
};

const extractRefreshAccessToken = (payload: string | ApiEnvelope<string>): string | null => {
  const data = unwrapApiResponse(payload);

  if (!data) {
    return null;
  }

  return data;
};

let isRefreshing = false;
let pendingRequests: Array<(token: string | null) => void> = [];

const enqueuePendingRequest = (callback: (token: string | null) => void) => {
  pendingRequests.push(callback);
};

const resolvePendingRequests = (token: string | null) => {
  pendingRequests.forEach((callback) => callback(token));
  pendingRequests = [];
};

export const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 15000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const tokens = tokenStorage.getTokens();

  if (tokens?.accessToken) {
    setAuthorizationHeader(config, tokens.accessToken);
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;
    const status = error.response?.status as number | undefined;

    if (!originalRequest || status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    const currentTokens = tokenStorage.getTokens();
    if (!currentTokens?.accessToken) {
      tokenStorage.clearTokens();
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        enqueuePendingRequest((newToken) => {
          if (!newToken) {
            reject(error);
            return;
          }

          setAuthorizationHeader(originalRequest, newToken);
          resolve(apiClient(originalRequest));
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshResponse = await axios.post<string | ApiEnvelope<string>>(
        `${env.apiBaseUrl}${API_ROUTES.auth.refresh}`,
        undefined,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      const refreshedAccessToken = extractRefreshAccessToken(refreshResponse.data);

      if (!refreshedAccessToken) {
        throw new Error("Invalid refresh token response.");
      }

      tokenStorage.setTokens({
        accessToken: refreshedAccessToken,
      });

      resolvePendingRequests(refreshedAccessToken);
      setAuthorizationHeader(originalRequest, refreshedAccessToken);
      return apiClient(originalRequest);
    } catch (refreshError) {
      resolvePendingRequests(null);
      tokenStorage.clearTokens();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);
