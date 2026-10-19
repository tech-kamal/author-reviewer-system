import { Navigate } from "react-router-dom";

import {
  getStoredUser,
  getToken,
} from "../auth/auth.storage";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole?: "ADMIN" | "EDITOR" | "REVIEWER";
}

function ProtectedRoute({
  children,
  allowedRole,
}: ProtectedRouteProps) {
  const token = getToken();
  const user = getStoredUser();

  console.log("========== PROTECTED ROUTE ==========");
  console.log("Token exists:", !!token);
  console.log("User:", user);
  console.log("User role:", user?.role);
  console.log("Allowed role:", allowedRole);

  // ============================================
  // Check authentication
  // ============================================

  if (!token || !user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  // ============================================
  // Check role
  // ============================================

  if (
    allowedRole &&
    user.role !== allowedRole
  ) {
    return (
      <Navigate
        to={
          user.role === "ADMIN"
            ? "/admin"
            : user.role === "EDITOR"
              ? "/editor"
              : "/reviewer"
        }
        replace
      />
    );
  }

  return children;
}

export default ProtectedRoute;