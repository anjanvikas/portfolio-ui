// Typed client for the admin profile editor (SCRUM-68).

import { getJSON, sendJSON } from "@/lib/admin-client";

export { ApiError, UNAUTHORIZED } from "@/lib/admin-client";

export type AdminProfile = {
  id: string;
  name: string;
  headline: string;
  bio: string;
  location: string;
  email: string;
  resume_url: string;
  avatar_url: string;
};

export type ProfileInput = {
  name: string;
  headline: string;
  bio: string;
  location: string;
  email: string;
  resume_url: string;
  avatar_url: string;
};

export const fetchAdminProfile = () => getJSON<AdminProfile>("/api/admin/profile");

export const updateProfile = (input: ProfileInput) =>
  sendJSON<AdminProfile>("PUT", "/api/admin/profile", input);
