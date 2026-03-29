export interface PublicProfile {
  userId: string;
  name: string;
  bio?: string;
  phone?: string;
  email?: string;
  gender?: "MALE" | "FEMALE";
}
