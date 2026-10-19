import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";

import prisma from "../prisma";
import { AuthenticatedRequest } from "../middleware/auth.middleware";

import {
  sendPasswordResetEmail,
} from "../services/email.service";

import {
  sendError,
  handlePrismaError,
} from "../utils/error";

// ============================================
// Validation Schemas
// ============================================

const registerSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters"),

  email: z
    .string()
    .email("Please enter a valid email"),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters"),

  // role: z.enum(["EDITOR", "REVIEWER"]),
});

const loginSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email"),

  password: z
    .string()
    .min(1, "Password is required"),
});

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email"),
});

const resetPasswordSchema = z
  .object({
    token: z
      .string()
      .min(1, "Reset token is required"),

    password: z
      .string()
      .min(6, "Password must be at least 6 characters"),

    confirmPassword: z
      .string()
      .min(6, "Please confirm your password"),
  })
  .refine(
    (data) => data.password === data.confirmPassword,
    {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    }
  );

// ============================================
// Create JWT Token
// ============================================

function createToken(user: {
  id: string;
  role: "ADMIN" | "EDITOR" | "REVIEWER";
}) {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error(
      "JWT_SECRET is not configured"
    );
  }

  return jwt.sign(
    {
      id: user.id,
      role: user.role,
    },
    secret,
    {
      expiresIn: "7d",
    }
  );
}

// ============================================
// POST /api/auth/register
// ============================================

export async function register(
  req: Request,
  res: Response
) {
  try {
    // --------------------------------------------
    // Validate request body
    // --------------------------------------------

    const result = registerSchema.safeParse(
      req.body
    );

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors:
          result.error.flatten().fieldErrors,
      });
    }

    const {
      name,
      email,
      password,
      // role,
    } = result.data;

    const normalizedEmail =
      email.toLowerCase().trim();

    // --------------------------------------------
    // Check existing user
    // --------------------------------------------

    const existingUser =
      await prisma.user.findUnique({
        where: {
          email: normalizedEmail,
        },
      });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message:
          "An account with this email already exists",
      });
    }

    // --------------------------------------------
    // Hash password
    // --------------------------------------------

    const passwordHash =
      await bcrypt.hash(password, 12);

    // --------------------------------------------
    // Create user
    // --------------------------------------------

    const user = await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        passwordHash,
        role: "REVIEWER",
      },
    });

    // --------------------------------------------
    // Create token
    // --------------------------------------------

    const token = createToken({
      id: user.id,
      role: user.role,
    });

    // --------------------------------------------
    // Success
    // --------------------------------------------

    return res.status(201).json({
      success: true,
      message: "Registration successful",

      token,

      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(
      "========== REGISTER ERROR =========="
    );

    console.error(error);

    // --------------------------------------------
    // Handle Prisma errors
    // --------------------------------------------

    return handlePrismaError(
      res,
      error
    );
  }
}

// ============================================
// POST /api/auth/login
// ============================================

export async function login(
  req: Request,
  res: Response
) {
  try {
    // --------------------------------------------
    // Validate request body
    // --------------------------------------------

    const result = loginSchema.safeParse(
      req.body
    );

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors:
          result.error.flatten().fieldErrors,
      });
    }

    const {
      email,
      password,
    } = result.data;

    const normalizedEmail =
      email.toLowerCase().trim();

    // --------------------------------------------
    // Find user
    // --------------------------------------------

    const user =
      await prisma.user.findUnique({
        where: {
          email: normalizedEmail,
        },
      });

    if (!user) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password",
      });
    }

    // --------------------------------------------
    // Compare password
    // --------------------------------------------

    const passwordMatches =
      await bcrypt.compare(
        password,
        user.passwordHash
      );

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password",
      });
    }

    // --------------------------------------------
    // Create token
    // --------------------------------------------

    const token = createToken({
      id: user.id,
      role: user.role,
    });

    // --------------------------------------------
    // Success
    // --------------------------------------------

    return res.json({
      success: true,
      message: "Login successful",

      token,

      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(
      "========== LOGIN ERROR =========="
    );

    console.error(error);

    return handlePrismaError(
      res,
      error
    );
  }
}

// ============================================
// GET /api/auth/me
// ============================================

export async function me(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    // --------------------------------------------
    // Check authentication
    // --------------------------------------------

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required",
      });
    }

    // --------------------------------------------
    // Find current user
    // --------------------------------------------

    const user =
      await prisma.user.findUnique({
        where: {
          id: req.user.id,
        },

        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
      });

    // --------------------------------------------
    // User not found
    // --------------------------------------------

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // --------------------------------------------
    // Success
    // --------------------------------------------

    return res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error(
      "========== GET ME ERROR =========="
    );

    console.error(error);

    return handlePrismaError(
      res,
      error
    );
  }
}



// ============================================
// POST /api/auth/forgot-password
// ============================================

export async function forgotPassword(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    // --------------------------------------------
    // Validate request
    // --------------------------------------------

    const result =
      forgotPasswordSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address",
      });
    }

    const normalizedEmail =
      result.data.email.toLowerCase().trim();

    // --------------------------------------------
    // Find user
    // --------------------------------------------

    const user =
      await prisma.user.findUnique({
        where: {
          email: normalizedEmail,
        },
      });

    // --------------------------------------------
    // Do not reveal whether email exists
    // --------------------------------------------

    if (!user) {
      return res.json({
        success: true,
        message:
          "If an account with this email exists, a password reset link has been generated.",
      });
    }

    // --------------------------------------------
    // Password reset secret
    // --------------------------------------------

    const resetSecret =
      process.env.PASSWORD_RESET_SECRET;

    if (!resetSecret) {
      throw new Error(
        "PASSWORD_RESET_SECRET is not configured"
      );
    }

    // --------------------------------------------
    // Create reset token
    // --------------------------------------------

    const resetToken = jwt.sign(
      {
        id: user.id,
        type: "PASSWORD_RESET",
      },
      resetSecret,
      {
        expiresIn: "15m",
      }
    );

    // --------------------------------------------
    // Temporary development reset link
    // --------------------------------------------

    const frontendUrl =
      process.env.FRONTEND_URL ||
      "http://localhost:5173";

    const resetLink =
      `${frontendUrl}/reset-password?token=${encodeURIComponent(
        resetToken
      )}`;

    await sendPasswordResetEmail({
    email: user.email,
    resetLink,
    });
    // --------------------------------------------
    // Success
    // --------------------------------------------

    return res.json({
      success: true,
      message:
        "If an account with this email exists, a password reset link has been generated.",
    });
  } catch (error) {
    console.error(
      "========== FORGOT PASSWORD ERROR =========="
    );

    console.error(error);

    return handlePrismaError(
      res,
      error
    );
  }
}


// ============================================
// POST /api/auth/reset-password
// ============================================

export async function resetPassword(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    // --------------------------------------------
    // Validate request
    // --------------------------------------------

    const result =
      resetPasswordSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors:
          result.error.flatten().fieldErrors,
      });
    }

    const {
      token,
      password,
    } = result.data;

    // --------------------------------------------
    // Password reset secret
    // --------------------------------------------

    const resetSecret =
      process.env.PASSWORD_RESET_SECRET;

    if (!resetSecret) {
      throw new Error(
        "PASSWORD_RESET_SECRET is not configured"
      );
    }

    // --------------------------------------------
    // Verify reset token
    // --------------------------------------------

    let decoded: {
      id: string;
      type: string;
    };

    try {
      decoded = jwt.verify(
        token,
        resetSecret
      ) as {
        id: string;
        type: string;
      };
    } catch {
      return res.status(400).json({
        success: false,
        message:
          "This password reset link is invalid or has expired.",
      });
    }

    // --------------------------------------------
    // Check token type
    // --------------------------------------------

    if (
      decoded.type !== "PASSWORD_RESET"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid password reset token.",
      });
    }

    // --------------------------------------------
    // Find user
    // --------------------------------------------

    const user =
      await prisma.user.findUnique({
        where: {
          id: decoded.id,
        },
      });

    if (!user) {
      return res.status(400).json({
        success: false,
        message:
          "This password reset link is invalid or has expired.",
      });
    }

    // --------------------------------------------
    // Hash new password
    // --------------------------------------------

    const passwordHash =
      await bcrypt.hash(password, 12);

    // --------------------------------------------
    // Update password
    // --------------------------------------------

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        passwordHash,
      },
    });

    // --------------------------------------------
    // Success
    // --------------------------------------------

    return res.json({
      success: true,
      message:
        "Password has been reset successfully. Please login with your new password.",
    });
  } catch (error) {
    console.error(
      "========== RESET PASSWORD ERROR =========="
    );

    console.error(error);

    return handlePrismaError(
      res,
      error
    );
  }
}