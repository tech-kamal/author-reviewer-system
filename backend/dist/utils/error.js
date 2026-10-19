"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handlePrismaError = exports.sendError = void 0;
const client_1 = require("@prisma/client");
// ============================================
// Common Error Response
// ============================================
const sendError = (res, statusCode, message, error) => {
    return res.status(statusCode).json({
        success: false,
        message,
        ...(error instanceof Error
            ? {
                error: error.message,
            }
            : {}),
    });
};
exports.sendError = sendError;
// ============================================
// Prisma Error Handler
// ============================================
const handlePrismaError = (res, error) => {
    // ============================================
    // P2002 - Unique constraint violation
    // ============================================
    if (error instanceof
        client_1.Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002") {
        return (0, exports.sendError)(res, 409, "A record with this value already exists");
    }
    // ============================================
    // P2025 - Record not found
    // ============================================
    if (error instanceof
        client_1.Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025") {
        return (0, exports.sendError)(res, 404, "Requested record was not found");
    }
    // ============================================
    // P2003 - Foreign key constraint
    // ============================================
    if (error instanceof
        client_1.Prisma.PrismaClientKnownRequestError &&
        error.code === "P2003") {
        return (0, exports.sendError)(res, 400, "Related record does not exist");
    }
    // ============================================
    // P2014 - Required relation violation
    // ============================================
    if (error instanceof
        client_1.Prisma.PrismaClientKnownRequestError &&
        error.code === "P2014") {
        return (0, exports.sendError)(res, 400, "Required related record is missing");
    }
    // ============================================
    // P2000 - Value too long
    // ============================================
    if (error instanceof
        client_1.Prisma.PrismaClientKnownRequestError &&
        error.code === "P2000") {
        return (0, exports.sendError)(res, 400, "One of the provided values is too long");
    }
    // ============================================
    // Prisma validation error
    // ============================================
    if (error instanceof
        client_1.Prisma.PrismaClientValidationError) {
        console.error("========== PRISMA VALIDATION ERROR ==========");
        console.error(error);
        return (0, exports.sendError)(res, 400, "Invalid database request");
    }
    // ============================================
    // Prisma initialization error
    // ============================================
    if (error instanceof
        client_1.Prisma.PrismaClientInitializationError) {
        console.error("========== PRISMA INITIALIZATION ERROR ==========");
        console.error(error);
        return (0, exports.sendError)(res, 500, "Database connection failed");
    }
    // ============================================
    // Other Prisma errors
    // ============================================
    if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
        console.error("========== PRISMA DATABASE ERROR ==========");
        console.error(error);
        return (0, exports.sendError)(res, 500, "Database operation failed");
    }
    // ============================================
    // Non-Prisma error
    // ============================================
    console.error("========== APPLICATION ERROR ==========");
    console.error(error);
    return (0, exports.sendError)(res, 500, "Internal server error");
};
exports.handlePrismaError = handlePrismaError;
