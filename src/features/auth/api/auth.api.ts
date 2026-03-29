"use client";

import { API_ROUTES } from "@/config/api-routes";
import { apiClient } from "@/lib/api/client";
import { unwrapApiResponse } from "@/lib/utils/api-response";
import type { ApiEnvelope } from "@/types/api.types";
import type {
  AuthUser,
  LoginPayload,
  LoginResponse,
  RegisterPayload,
} from "@/features/auth/types/auth.types";

type LoginResponsePayload = {
  token?: string;
  name?: string;
  email?: string;
  phone?: string;
  gender?: "MALE" | "FEMALE";
};

const normalizeLoginResponse = (
  payload: LoginResponsePayload | ApiEnvelope<LoginResponsePayload>,
): LoginResponse => {
  const data = unwrapApiResponse(payload);
  const accessToken = data.token;

  if (!accessToken) {
    throw new Error("Login response is missing access token.");
  }

  const user: AuthUser = {
    name: data.name,
    email: data.email,
    phone: data.phone,
    gender: data.gender,
  };

  return {
    accessToken,
    user,
  };
};

export const authApi = {
  async login(payload: LoginPayload): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponsePayload | ApiEnvelope<LoginResponsePayload>>(
      API_ROUTES.auth.login,
      payload,
    );

    return normalizeLoginResponse(response.data);
  },

  async register(payload: RegisterPayload) {
    const response = await apiClient.post<ApiEnvelope<unknown>>(API_ROUTES.auth.register, payload);
    return unwrapApiResponse(response.data);
  },

  async logout() {
    const response = await apiClient.post<string | ApiEnvelope<string>>(API_ROUTES.auth.logout);
    return unwrapApiResponse(response.data);
  },
};
