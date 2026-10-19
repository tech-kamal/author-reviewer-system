import { getToken } from "../auth/auth.storage";

const API_BASE_URL = "http://localhost:4000/api";

const getHeaders = (
  isFormData = false
) => {
  const token = getToken();

  return {
    ...(isFormData
      ? {}
      : {
          "Content-Type": "application/json",
        }),

    ...(token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {}),
  };
};

export const authenticatedApi = {
  // ============================================
  // GET
  // ============================================

  get: async (endpoint: string) => {
    return fetch(`${API_BASE_URL}${endpoint}`, {
      method: "GET",
      headers: getHeaders(),
    });
  },

  // ============================================
  // POST
  // ============================================

  post: async (
    endpoint: string,
    body?: unknown
  ) => {
    const isFormData = body instanceof FormData;

    return fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers: getHeaders(isFormData),
      body: body
        ? isFormData
          ? (body as FormData)
          : JSON.stringify(body)
        : undefined,
    });
  },

  // ============================================
  // PATCH
  // ============================================

  patch: async (
    endpoint: string,
    body?: unknown
  ) => {
    const isFormData = body instanceof FormData;

    return fetch(`${API_BASE_URL}${endpoint}`, {
      method: "PATCH",
      headers: getHeaders(isFormData),
      body: body
        ? isFormData
          ? (body as FormData)
          : JSON.stringify(body)
        : undefined,
    });
  },

  // ============================================
  // DELETE
  // ============================================

  delete: async (endpoint: string) => {
    return fetch(`${API_BASE_URL}${endpoint}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
  },
};