import { api } from "./api-client";

export async function getProfile() {
  return api.get<{
    name: string;
    department: string;
    designation: string;
    email: string;
    phone: string;
  }>("/profile");
}

export async function updateProfile(payload: unknown) {
  return api.patch<unknown>("/profile", payload);
}
