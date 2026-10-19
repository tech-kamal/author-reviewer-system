export type UserRole = "ADMIN" | "EDITOR" | "REVIEWER";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  // role: UserRole;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}