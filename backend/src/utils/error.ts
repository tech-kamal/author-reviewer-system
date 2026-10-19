import { Response } from "express";
import { Prisma } from "@prisma/client";

// ============================================
// Common Error Response
// ============================================

export const sendError = (
  res: Response,
  statusCode: number,
  message: string,
  error?: unknown
) => {
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

// ============================================
// Prisma Error Handler
// ============================================

export const handlePrismaError = (
  res: Response,
  error: unknown
) => {
  // ============================================
  // P2002 - Unique constraint violation
  // ============================================

  if (
    error instanceof
      Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    return sendError(
      res,
      409,
      "A record with this value already exists"
    );
  }

  // ============================================
  // P2025 - Record not found
  // ============================================

  if (
    error instanceof
      Prisma.PrismaClientKnownRequestError &&
    error.code === "P2025"
  ) {
    return sendError(
      res,
      404,
      "Requested record was not found"
    );
  }

  // ============================================
  // P2003 - Foreign key constraint
  // ============================================

  if (
    error instanceof
      Prisma.PrismaClientKnownRequestError &&
    error.code === "P2003"
  ) {
    return sendError(
      res,
      400,
      "Related record does not exist"
    );
  }

  // ============================================
  // P2014 - Required relation violation
  // ============================================

  if (
    error instanceof
      Prisma.PrismaClientKnownRequestError &&
    error.code === "P2014"
  ) {
    return sendError(
      res,
      400,
      "Required related record is missing"
    );
  }

  // ============================================
  // P2000 - Value too long
  // ============================================

  if (
    error instanceof
      Prisma.PrismaClientKnownRequestError &&
    error.code === "P2000"
  ) {
    return sendError(
      res,
      400,
      "One of the provided values is too long"
    );
  }

  // ============================================
  // Prisma validation error
  // ============================================

  if (
    error instanceof
    Prisma.PrismaClientValidationError
  ) {
    console.error(
      "========== PRISMA VALIDATION ERROR =========="
    );

    console.error(error);

    return sendError(
      res,
      400,
      "Invalid database request"
    );
  }

  // ============================================
  // Prisma initialization error
  // ============================================

  if (
    error instanceof
    Prisma.PrismaClientInitializationError
  ) {
    console.error(
      "========== PRISMA INITIALIZATION ERROR =========="
    );

    console.error(error);

    return sendError(
      res,
      500,
      "Database connection failed"
    );
  }

  // ============================================
  // Other Prisma errors
  // ============================================

  if (
    error instanceof Prisma.PrismaClientKnownRequestError
  ) {
    console.error(
      "========== PRISMA DATABASE ERROR =========="
    );

    console.error(error);

    return sendError(
      res,
      500,
      "Database operation failed"
    );
  }

  // ============================================
  // Non-Prisma error
  // ============================================

  console.error(
    "========== APPLICATION ERROR =========="
  );

  console.error(error);

  return sendError(
    res,
    500,
    "Internal server error"
  );
};