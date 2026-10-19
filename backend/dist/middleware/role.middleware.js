"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = void 0;
const error_1 = require("../utils/error");
// ============================================
// Require Specific User Role
// ============================================
const requireRole = (role) => {
    return (req, res, next) => {
        // ============================================
        // Check authentication
        // ============================================
        if (!req.user) {
            return (0, error_1.sendError)(res, 401, "Unauthorized");
        }
        // ============================================
        // Check user role
        // ============================================
        if (req.user.role !== role) {
            return (0, error_1.sendError)(res, 403, "Forbidden");
        }
        // ============================================
        // Continue request
        // ============================================
        next();
    };
};
exports.requireRole = requireRole;
