import { getToken } from "../auth/auth.storage";

const API_BASE_URL = "http://localhost:4000/api";

export const api = {
  get: async (endpoint: string, options: RequestInit = {}) => {
    const response = await fetch(
      `${API_BASE_URL}${endpoint}`,
      {
        method: "GET",
        ...options,
       headers: {
          "Content-Type": "application/json",

          ...(getToken()
            ? {
                Authorization: `Bearer ${getToken()}`,
              }
            : {}),

          ...(options.headers || {}),
        },
      }
    );

    return response;
  },





 post: async (
  endpoint: string,
  body?: unknown,
  options: RequestInit = {}
) => {
  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      method: "POST",
      ...options,
      headers: {
          ...(body instanceof FormData
            ? {}
            : {
                "Content-Type": "application/json",
              }),

          ...(getToken()
            ? {
                Authorization: `Bearer ${getToken()}`,
              }
            : {}),

          ...(options.headers || {}),
      },
      body:
        body instanceof FormData
          ? body
          : body
            ? JSON.stringify(body)
            : undefined,
    }
  );

  return response;
},







  patch: async (
    endpoint: string,
    body?: unknown,
    options: RequestInit = {}
  ) => {
    const response = await fetch(
      `${API_BASE_URL}${endpoint}`,
      {
        method: "PATCH",
        ...options,
              headers: {
        "Content-Type": "application/json",

        ...(getToken()
          ? {
              Authorization: `Bearer ${getToken()}`,
            }
          : {}),

        ...(options.headers || {}),
      },
        body: body ? JSON.stringify(body) : undefined,
      }
    );

    return response;
  },






  delete: async (
    endpoint: string,
    options: RequestInit = {}
  ) => {
    const response = await fetch(
      `${API_BASE_URL}${endpoint}`,
      {
        method: "DELETE",
        ...options,
              headers: {
        "Content-Type": "application/json",

        ...(getToken()
          ? {
              Authorization: `Bearer ${getToken()}`,
            }
          : {}),

        ...(options.headers || {}),
      },
      }
    );

    return response;
  },
};