import axios from "axios";
import type { ApiEnvelope, ApiErrorEnvelope } from "@/types/api.types";

export const unwrapApiResponse = <T>(payload: T | ApiEnvelope<T>): T => {
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as ApiEnvelope<T>).data;
  }

  return payload as T;
};

export const getApiErrorMessage = (error: unknown, fallback = "Request failed.") => {
  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data as ApiErrorEnvelope | undefined;
    return responseData?.message ?? responseData?.error ?? error.message ?? fallback;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
};

