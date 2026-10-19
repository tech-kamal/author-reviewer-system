import { api } from "../api/api";
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
} from "./auth.types";

export const loginUser = async (
  data: LoginRequest
): Promise<AuthResponse> => {
  const response = await api.post(
    "/auth/login",
    data
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || "Login failed"
    );
  }

  return result;
};

export const registerUser = async (
  data: RegisterRequest
): Promise<AuthResponse> => {
  const response = await api.post(
    "/auth/register",
    data
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || "Registration failed"
    );
  }

  return result;
};