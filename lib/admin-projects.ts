// Typed client for the admin project CRUD (SCRUM-68).

import { del, getJSON, postJSON, sendJSON } from "@/lib/admin-client";

export { ApiError, UNAUTHORIZED } from "@/lib/admin-client";

export type ProjectStatus = "draft" | "published";

export type AdminProjectListItem = {
  id: string;
  title: string;
  slug: string;
  status: ProjectStatus;
  featured: boolean;
  published_at: string | null;
  sort_order: number;
};

export type AdminProject = {
  id: string;
  title: string;
  slug: string;
  tagline: string;
  summary: string;
  body_overview: string;
  body_why_built: string;
  body_learning: string;
  cover_url: string;
  repo_url: string;
  live_url: string;
  featured: boolean;
  tags: string[];
  status: ProjectStatus;
  published_at: string | null;
};

export type ProjectInput = {
  title: string;
  slug: string;
  tagline: string;
  summary: string;
  body_overview: string;
  body_why_built: string;
  body_learning: string;
  cover_url: string;
  repo_url: string;
  live_url: string;
  featured: boolean;
  tags: string[];
};

export const fetchAdminProjects = () =>
  getJSON<AdminProjectListItem[]>("/api/admin/projects");

export const fetchAdminProject = (id: string) =>
  getJSON<AdminProject>(`/api/admin/projects/${id}`);

export const createProject = (input: ProjectInput) =>
  sendJSON<AdminProject>("POST", "/api/admin/projects", input);

export const updateProject = (id: string, input: ProjectInput) =>
  sendJSON<AdminProject>("PUT", `/api/admin/projects/${id}`, input);

export const publishProject = (id: string) =>
  postJSON<AdminProject>(`/api/admin/projects/${id}/publish`);

export const deleteProject = (id: string) => del(`/api/admin/projects/${id}`);
