"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const multer_1 = __importDefault(require("multer"));
// ============================================
// Global Error Handler
// ============================================
const errorHandler = (error, req, res, next) => {
    console.error("========== GLOBAL ERROR ==========");
    console.error(error);
    // ============================================
    // Multer file size error
    // ============================================
    if (error instanceof multer_1.default.MulterError &&
        error.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
            success: false,
            message: "File size must not exceed 10 MB",
        });
    }
    // ============================================
    // Multer upload error
    // ============================================
    if (error instanceof multer_1.default.MulterError) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
    // ============================================
    // PDF validation error
    // ============================================
    if (error instanceof Error &&
        error.message ===
            "Only PDF files are allowed") {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
    // ============================================
    // Unknown error
    // ============================================
    return res.status(500).json({
        success: false,
        message: "Internal server error",
    });
};
exports.errorHandler = errorHandler;
