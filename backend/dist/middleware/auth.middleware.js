"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const error_1 = require("../utils/error");
// ============================================
// Require Authentication
// ============================================
function requireAuth(req, res, next) {
    try {
        // ============================================
        // Get Authorization header
        // ============================================
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return (0, error_1.sendError)(res, 401, "Authorization token is required");
        }
        // ============================================
        // Validate Bearer format
        // ============================================
        if (!authHeader.startsWith("Bearer ")) {
            return (0, error_1.sendError)(res, 401, "Invalid authorization format");
        }
        // ============================================
        // Extract token
        // ============================================
        const token = authHeader.slice(7).trim();
        if (!token) {
            return (0, error_1.sendError)(res, 401, "Authorization token is required");
        }
        // ============================================
        // Get JWT secret
        // ============================================
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            console.error("JWT_SECRET is not configured");
            return (0, error_1.sendError)(res, 500, "Authentication service is not configured");
        }
        // ============================================
        // Verify JWT
        // ============================================
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        // ============================================
        // Validate decoded payload
        // ============================================
        if (!decoded ||
            !decoded.id ||
            !decoded.role) {
            return (0, error_1.sendError)(res, 401, "Invalid authentication token");
        }
        if (decoded.role !== "ADMIN" &&
            decoded.role !== "EDITOR" &&
            decoded.role !== "REVIEWER") {
            return (0, error_1.sendError)(res, 401, "Invalid authentication role");
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
    }
    catch (error) {
        console.error("========== AUTHENTICATION ERROR ==========");
        console.error(error);
        return (0, error_1.sendError)(res, 401, "Invalid or expired token");
    }
}
