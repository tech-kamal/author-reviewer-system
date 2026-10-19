import {
  Response,
  NextFunction,
} from "express";

import { AuthenticatedRequest } from "./auth.middleware";

import { sendError } from "../utils/error";

// ============================================
// Require Specific User Role
// ============================================

export const requireRole = (
  role: "ADMIN" | "EDITOR" | "REVIEWER"
) => {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    // ============================================
    // Check authentication
    // ============================================

    if (!req.user) {
      return sendError(
        res,
        401,
        "Unauthorized"
      );
    }

    // ============================================
    // Check user role
    // ============================================

    if (req.user.role !== role) {
      return sendError(
        res,
        403,
        "Forbidden"
      );
    }

    // ============================================
    // Continue request
    // ============================================

    next();
  };
};