import {
  Request,
  Response,
  NextFunction,
} from "express";

import jwt from "jsonwebtoken";

import { sendError } from "../utils/error";

// ============================================
// Authenticated Request
// ============================================

export interface AuthenticatedRequest
  extends Request {
  user?: {
    id: string;
    role: "ADMIN" | "EDITOR" | "REVIEWER";
  };
}

// ============================================
// Require Authentication
// ============================================

export function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    // ============================================
    // Get Authorization header
    // ============================================

    const authHeader =
      req.headers.authorization;

    if (!authHeader) {
      return sendError(
        res,
        401,
        "Authorization token is required"
      );
    }

    // ============================================
    // Validate Bearer format
    // ============================================

    if (
      !authHeader.startsWith("Bearer ")
    ) {
      return sendError(
        res,
        401,
        "Invalid authorization format"
      );
    }

    // ============================================
    // Extract token
    // ============================================

    const token =
      authHeader.slice(7).trim();

    if (!token) {
      return sendError(
        res,
        401,
        "Authorization token is required"
      );
    }

    // ============================================
    // Get JWT secret
    // ============================================

    const secret =
      process.env.JWT_SECRET;

    if (!secret) {
      console.error(
        "JWT_SECRET is not configured"
      );

      return sendError(
        res,
        500,
        "Authentication service is not configured"
      );
    }

    // ============================================
    // Verify JWT
    // ============================================

    const decoded = jwt.verify(
      token,
      secret
    ) as {
      id: string;
      role: "ADMIN" | "EDITOR" | "REVIEWER";
    };

    // ============================================
    // Validate decoded payload
    // ============================================

    if (
      !decoded ||
      !decoded.id ||
      !decoded.role
    ) {
      return sendError(
        res,
        401,
        "Invalid authentication token"
      );
    }

    if (
      decoded.role !== "ADMIN" &&
      decoded.role !== "EDITOR" &&
      decoded.role !== "REVIEWER"
    ) {
      return sendError(
        res,
        401,
        "Invalid authentication role"
      );
    }

    // ============================================
    // Attach user to request
    // ============================================

    req.user = {
      id: decoded.id,
      role: decoded.role,
    };

    // ============================================
    // Continue request
    // ============================================

    next();
  } catch (error) {
    console.error(
      "========== AUTHENTICATION ERROR =========="
    );

    console.error(error);

    return sendError(
      res,
      401,
      "Invalid or expired token"
    );
  }
}