// Typed client for the admin experience CRUD + drag-to-reorder (SCRUM-68).

import { del, getJSON, postJSON, sendJSON } from "@/lib/admin-client";

export { ApiError, UNAUTHORIZED } from "@/lib/admin-client";

export type AdminExperience = {
  id: string;
  company: string;
  role: string;
  location: string;
  start_date: string; // YYYY-MM-DD
  end_date: string | null; // null = current role
  description: string;
  sort_order: number;
};

export type ExperienceInput = {
  company: string;
  role: string;
  location: string;
  start_date: string;
  end_date: string | null;
  description: string;
};

export const fetchAdminExperience = () =>
  getJSON<AdminExperience[]>("/api/admin/experience");

export const createExperience = (input: ExperienceInput) =>
  sendJSON<AdminExperience>("POST", "/api/admin/experience", input);

export const updateExperience = (id: string, input: ExperienceInput) =>
  sendJSON<AdminExperience>("PUT", `/api/admin/experience/${id}`, input);

export const deleteExperience = (id: string) => del(`/api/admin/experience/${id}`);

// reorderExperience sends the full ordered list of ids (top to bottom as shown)
// and gets back the re-listed entries with their new sort_order.
export const reorderExperience = (ids: string[]) =>
  postJSON<AdminExperience[]>("/api/admin/experience/reorder", { ids });
