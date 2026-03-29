export interface AuthUser {
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
  gender?: Gender;
}

export interface AuthTokens {
  accessToken: string;
}

export type Gender = "MALE" | "FEMALE";

export interface LoginPayload {
  identifier: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  gender: Gender;
  phone: string;
}
