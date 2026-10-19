"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
exports.me = me;
exports.forgotPassword = forgotPassword;
exports.resetPassword = resetPassword;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const zod_1 = require("zod");
const prisma_1 = __importDefault(require("../prisma"));
const email_service_1 = require("../services/email.service");
const error_1 = require("../utils/error");
// ============================================
// Validation Schemas
// ============================================
const registerSchema = zod_1.z.object({
    name: zod_1.z
        .string()
        .min(2, "Name must be at least 2 characters"),
    email: zod_1.z
        .string()
        .email("Please enter a valid email"),
    password: zod_1.z
        .string()
        .min(6, "Password must be at least 6 characters"),
    // role: z.enum(["EDITOR", "REVIEWER"]),
});
const loginSchema = zod_1.z.object({
    email: zod_1.z
        .string()
        .email("Please enter a valid email"),
    password: zod_1.z
        .string()
        .min(1, "Password is required"),
});
const forgotPasswordSchema = zod_1.z.object({
    email: zod_1.z
        .string()
        .email("Please enter a valid email"),
});
const resetPasswordSchema = zod_1.z
    .object({
    token: zod_1.z
        .string()
        .min(1, "Reset token is required"),
    password: zod_1.z
        .string()
        .min(6, "Password must be at least 6 characters"),
    confirmPassword: zod_1.z
        .string()
        .min(6, "Please confirm your password"),
})
    .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});
// ============================================
// Create JWT Token
// ============================================
function createToken(user) {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("JWT_SECRET is not configured");
    }
    return jsonwebtoken_1.default.sign({
        id: user.id,
        role: user.role,
    }, secret, {
        expiresIn: "7d",
    });
}
// ============================================
// POST /api/auth/register
// ============================================
async function register(req, res) {
    try {
        // --------------------------------------------
        // Validate request body
        // --------------------------------------------
        const result = registerSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: result.error.flatten().fieldErrors,
            });
        }
        const { name, email, password,
        // role,
         } = result.data;
        const normalizedEmail = email.toLowerCase().trim();
        // --------------------------------------------
        // Check existing user
        // --------------------------------------------
        const existingUser = await prisma_1.default.user.findUnique({
            where: {
                email: normalizedEmail,
            },
        });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "An account with this email already exists",
            });
        }
        // --------------------------------------------
        // Hash password
        // --------------------------------------------
        const passwordHash = await bcryptjs_1.default.hash(password, 12);
        // --------------------------------------------
        // Create user
        // --------------------------------------------
        const user = await prisma_1.default.user.create({
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
    }
    catch (error) {
        console.error("========== REGISTER ERROR ==========");
        console.error(error);
        // --------------------------------------------
        // Handle Prisma errors
        // --------------------------------------------
        return (0, error_1.handlePrismaError)(res, error);
    }
}
// ============================================
// POST /api/auth/login
// ============================================
async function login(req, res) {
    try {
        // --------------------------------------------
        // Validate request body
        // --------------------------------------------
        const result = loginSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: result.error.flatten().fieldErrors,
            });
        }
        const { email, password, } = result.data;
        const normalizedEmail = email.toLowerCase().trim();
        // --------------------------------------------
        // Find user
        // --------------------------------------------
        const user = await prisma_1.default.user.findUnique({
            where: {
                email: normalizedEmail,
            },
        });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }
        // --------------------------------------------
        // Compare password
        // --------------------------------------------
        const passwordMatches = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!passwordMatches) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
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
    }
    catch (error) {
        console.error("========== LOGIN ERROR ==========");
        console.error(error);
        return (0, error_1.handlePrismaError)(res, error);
    }
}
// ============================================
// GET /api/auth/me
// ============================================
async function me(req, res) {
    try {
        // --------------------------------------------
        // Check authentication
        // --------------------------------------------
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }
        // --------------------------------------------
        // Find current user
        // --------------------------------------------
        const user = await prisma_1.default.user.findUnique({
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
    }
    catch (error) {
        console.error("========== GET ME ERROR ==========");
        console.error(error);
        return (0, error_1.handlePrismaError)(res, error);
    }
}
// ============================================
// POST /api/auth/forgot-password
// ============================================
async function forgotPassword(req, res) {
    try {
        // --------------------------------------------
        // Validate request
        // --------------------------------------------
        const result = forgotPasswordSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid email address",
            });
        }
        const normalizedEmail = result.data.email.toLowerCase().trim();
        // --------------------------------------------
        // Find user
        // --------------------------------------------
        const user = await prisma_1.default.user.findUnique({
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
                message: "If an account with this email exists, a password reset link has been generated.",
            });
        }
        // --------------------------------------------
        // Password reset secret
        // --------------------------------------------
        const resetSecret = process.env.PASSWORD_RESET_SECRET;
        if (!resetSecret) {
            throw new Error("PASSWORD_RESET_SECRET is not configured");
        }
        // --------------------------------------------
        // Create reset token
        // --------------------------------------------
        const resetToken = jsonwebtoken_1.default.sign({
            id: user.id,
            type: "PASSWORD_RESET",
        }, resetSecret, {
            expiresIn: "15m",
        });
        // --------------------------------------------
        // Temporary development reset link
        // --------------------------------------------
        const frontendUrl = process.env.FRONTEND_URL ||
            "http://localhost:5173";
        const resetLink = `${frontendUrl}/reset-password?token=${encodeURIComponent(resetToken)}`;
        await (0, email_service_1.sendPasswordResetEmail)({
            email: user.email,
            resetLink,
        });
        // --------------------------------------------
        // Success
        // --------------------------------------------
        return res.json({
            success: true,
            message: "If an account with this email exists, a password reset link has been generated.",
        });
    }
    catch (error) {
        console.error("========== FORGOT PASSWORD ERROR ==========");
        console.error(error);
        return (0, error_1.handlePrismaError)(res, error);
    }
}
// ============================================
// POST /api/auth/reset-password
// ============================================
async function resetPassword(req, res) {
    try {
        // --------------------------------------------
        // Validate request
        // --------------------------------------------
        const result = resetPasswordSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: result.error.flatten().fieldErrors,
            });
        }
        const { token, password, } = result.data;
        // --------------------------------------------
        // Password reset secret
        // --------------------------------------------
        const resetSecret = process.env.PASSWORD_RESET_SECRET;
        if (!resetSecret) {
            throw new Error("PASSWORD_RESET_SECRET is not configured");
        }
        // --------------------------------------------
        // Verify reset token
        // --------------------------------------------
        let decoded;
        try {
            decoded = jsonwebtoken_1.default.verify(token, resetSecret);
        }
        catch {
            return res.status(400).json({
                success: false,
                message: "This password reset link is invalid or has expired.",
            });
        }
        // --------------------------------------------
        // Check token type
        // --------------------------------------------
        if (decoded.type !== "PASSWORD_RESET") {
            return res.status(400).json({
                success: false,
                message: "Invalid password reset token.",
            });
        }
        // --------------------------------------------
        // Find user
        // --------------------------------------------
        const user = await prisma_1.default.user.findUnique({
            where: {
                id: decoded.id,
            },
        });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "This password reset link is invalid or has expired.",
            });
        }
        // --------------------------------------------
        // Hash new password
        // --------------------------------------------
        const passwordHash = await bcryptjs_1.default.hash(password, 12);
        // --------------------------------------------
        // Update password
        // --------------------------------------------
        await prisma_1.default.user.update({
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
            message: "Password has been reset successfully. Please login with your new password.",
        });
    }
    catch (error) {
        console.error("========== RESET PASSWORD ERROR ==========");
        console.error(error);
        return (0, error_1.handlePrismaError)(res, error);
    }
}
