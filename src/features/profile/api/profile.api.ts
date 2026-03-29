import { API_ROUTES } from "@/config/api-routes";
import { apiClient } from "@/lib/api/client";
import { unwrapApiResponse } from "@/lib/utils/api-response";
import type { ApiEnvelope } from "@/types/api.types";
import type { PublicProfile } from "@/features/profile/types/public-profile.types";

type RawUserProfile = {
  userId?: string;
  id?: string;
  name?: string;
  fullName?: string;
  bio?: string;
  about?: string;
  description?: string;
  phone?: string;
  email?: string;
  gender?: "MALE" | "FEMALE";
};

const normalizePublicProfile = (payload: RawUserProfile): PublicProfile => ({
  userId: String(payload.userId ?? payload.id ?? ""),
  name: payload.name ?? payload.fullName ?? "Spont User",
  bio: payload.bio ?? payload.about ?? payload.description,
  phone: payload.phone,
  email: payload.email,
  gender: payload.gender,
});

export const profileApi = {
  async byId(userId: string): Promise<PublicProfile> {
    const response = await apiClient.get<ApiEnvelope<RawUserProfile> | RawUserProfile>(API_ROUTES.users.byId(userId));
    const data = unwrapApiResponse(response.data);
    return normalizePublicProfile(data);
  },
};
