// Typed client for the admin testimonial CRUD + visibility toggle (SCRUM-68).

import { del, getJSON, sendJSON } from "@/lib/admin-client";

export { ApiError, UNAUTHORIZED } from "@/lib/admin-client";

export type AdminTestimonial = {
  id: string;
  author_name: string;
  author_role: string;
  author_company: string;
  quote: string;
  visible: boolean;
  sort_order: number;
};

export type TestimonialInput = {
  author_name: string;
  author_role: string;
  author_company: string;
  quote: string;
  visible: boolean;
};

export const fetchAdminTestimonials = () =>
  getJSON<AdminTestimonial[]>("/api/admin/testimonials");

export const createTestimonial = (input: TestimonialInput) =>
  sendJSON<AdminTestimonial>("POST", "/api/admin/testimonials", input);

export const updateTestimonial = (id: string, input: TestimonialInput) =>
  sendJSON<AdminTestimonial>("PUT", `/api/admin/testimonials/${id}`, input);

export const setTestimonialVisibility = (id: string, visible: boolean) =>
  sendJSON<AdminTestimonial>("PATCH", `/api/admin/testimonials/${id}/visibility`, {
    visible,
  });

export const deleteTestimonial = (id: string) =>
  del(`/api/admin/testimonials/${id}`);
