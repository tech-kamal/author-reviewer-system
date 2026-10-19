import type { User } from "./auth.types";

const TOKEN_KEY = "journal_reviewer_token";
const USER_KEY = "journal_reviewer_user";

export const saveAuth = (
  token: string,
  user: User
) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(
    USER_KEY,
    JSON.stringify(user)
  );
};

export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

export const getStoredUser = (): User | null => {
  const user = localStorage.getItem(USER_KEY);

  if (!user) {
    return null;
  }

  try {
    return JSON.parse(user) as User;
  } catch {
    return null;
  }
};

export const clearAuth = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};