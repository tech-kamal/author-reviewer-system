import {
  Request,
  Response,
  NextFunction,
} from "express";

import multer from "multer";

// ============================================
// Global Error Handler
// ============================================

export const errorHandler = (
  error: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(
    "========== GLOBAL ERROR =========="
  );

  console.error(error);

  // ============================================
  // Multer file size error
  // ============================================

  if (
    error instanceof multer.MulterError &&
    error.code === "LIMIT_FILE_SIZE"
  ) {
    return res.status(400).json({
      success: false,
      message: "File size must not exceed 10 MB",
    });
  }

  // ============================================
  // Multer upload error
  // ============================================

  if (error instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  // ============================================
  // PDF validation error
  // ============================================

  if (
    error instanceof Error &&
    error.message ===
      "Only PDF files are allowed"
  ) {
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