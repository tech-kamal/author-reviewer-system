import { Request, Response } from "express";
import { randomBytes, createHash } from "crypto";

import bcrypt from "bcryptjs";

import prisma from "../prisma";

import {
  sendError,
  handlePrismaError,
} from "../utils/error";

import {
  sendEditorInvitationEmail,
} from "../services/email.service";

import {
  AuthenticatedRequest,
} from "../middleware/auth.middleware";

// ============================================
// Editor Invitation Expiry
// ============================================

const INVITATION_EXPIRY_DAYS = 7;

// ============================================
// Create Editor Invitation
// POST /api/admin/editor-invitations
// ============================================

export async function createEditorInvitation(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    // ============================================
    // Authentication
    // ============================================

    if (!req.user) {
      return sendError(
        res,
        401,
        "Unauthorized"
      );
    }

    // ============================================
    // Get request data
    // ============================================

    const { email } = req.body;

    // ============================================
    // Validate email
    // ============================================

    if (
      !email ||
      typeof email !== "string"
    ) {
      return sendError(
        res,
        400,
        "Valid email is required"
      );
    }

    const normalizedEmail =
      email.toLowerCase().trim();

    if (!normalizedEmail.includes("@")) {
      return sendError(
        res,
        400,
        "Valid email is required"
      );
    }

    // ============================================
    // Check if user already exists
    // ============================================

    const existingUser =
      await prisma.user.findUnique({
        where: {
          email: normalizedEmail,
        },
      });

    if (existingUser) {
      return sendError(
        res,
        409,
        "An account with this email already exists"
      );
    }

    // ============================================
    // Check existing unused invitation
    // ============================================

    const existingInvitation =
      await prisma.editorInvitation.findFirst({
        where: {
          email: normalizedEmail,
          usedAt: null,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

    // ============================================
    // Remove expired invitation
    // ============================================

    if (
      existingInvitation &&
      existingInvitation.expiresAt <= new Date()
    ) {
      await prisma.editorInvitation.delete({
        where: {
          id: existingInvitation.id,
        },
      });
    }

    // ============================================
    // Prevent duplicate active invitation
    // ============================================

    if (
      existingInvitation &&
      existingInvitation.expiresAt > new Date()
    ) {
      return sendError(
        res,
        409,
        "An active editor invitation already exists for this email"
      );
    }

    // ============================================
    // Generate secure invitation token
    // ============================================

    const rawToken =
      randomBytes(32).toString("hex");

    const tokenHash =
      createHash("sha256")
        .update(rawToken)
        .digest("hex");

    // ============================================
    // Calculate expiry
    // ============================================

    const expiresAt =
      new Date(
        Date.now() +
          INVITATION_EXPIRY_DAYS *
            24 *
            60 *
            60 *
            1000
      );

    // ============================================
    // Create invitation
    // ============================================

    const invitation =
      await prisma.editorInvitation.create({
        data: {
          email: normalizedEmail,
          tokenHash,
          expiresAt,
        },
        select: {
        id: true,
        email: true,
        expiresAt: true,
        usedAt: true,
        createdAt: true,
      },
      });

    // ============================================
    // Send invitation email
    // ============================================

    await sendEditorInvitationEmail({
      email: normalizedEmail,
      token: rawToken,
      expiresAt,
    });

    // ============================================
    // Success
    // ============================================

    return res.status(201).json({
      success: true,
      message:
        "Editor invitation sent successfully",
      invitation,
    });
  } catch (error) {
    console.error(
      "========== CREATE EDITOR INVITATION ERROR =========="
    );

    console.error(error);

    return handlePrismaError(
      res,
      error
    );
  }
}

// ============================================
// Get Editor Invitations
// GET /api/admin/editor-invitations
// ============================================

export async function getEditorInvitations(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    // ============================================
    // Authentication
    // ============================================

    if (!req.user) {
      return sendError(
        res,
        401,
        "Unauthorized"
      );
    }

    // ============================================
    // Get invitations
    // ============================================

    const invitations =
      await prisma.editorInvitation.findMany({
        select: {
          id: true,
          email: true,
          expiresAt: true,
          usedAt: true,
          createdAt: true,
        },

        orderBy: {
          createdAt: "desc",
        },
      });

    // ============================================
    // Success
    // ============================================

    return res.json({
      success: true,
      invitations,
    });
  } catch (error) {
    console.error(
      "========== GET EDITOR INVITATIONS ERROR =========="
    );

    console.error(error);

    return handlePrismaError(
      res,
      error
    );
  }
}

// ============================================
// Validate Editor Invitation
// GET /api/admin/editor-invitations/:token
// ============================================

export async function validateEditorInvitation(
  req: Request,
  res: Response
) {
  try {
    // ============================================
    // Get token
    // ============================================

    const token =
      String(req.params.token ?? "").trim();

    if (!token) {
      return sendError(
        res,
        400,
        "Invitation token is required"
      );
    }

    // ============================================
    // Hash token
    // ============================================

    const tokenHash =
      createHash("sha256")
        .update(token)
        .digest("hex");

    // ============================================
    // Find invitation
    // ============================================

    const invitation =
      await prisma.editorInvitation.findUnique({
        where: {
          tokenHash,
        },
      });

    if (!invitation) {
      return sendError(
        res,
        404,
        "Invalid invitation"
      );
    }

    // ============================================
    // Check if already used
    // ============================================

    if (invitation.usedAt) {
      return sendError(
        res,
        400,
        "This invitation has already been used"
      );
    }

    // ============================================
    // Check expiry
    // ============================================

    if (
      invitation.expiresAt <= new Date()
    ) {
      return sendError(
        res,
        400,
        "This invitation has expired"
      );
    }

    // ============================================
    // Success
    // ============================================

    return res.json({
      success: true,
      invitation: {
        email: invitation.email,
        expiresAt: invitation.expiresAt,
      },
    });
  } catch (error) {
    console.error(
      "========== VALIDATE EDITOR INVITATION ERROR =========="
    );

    console.error(error);

    return handlePrismaError(
      res,
      error
    );
  }
}


// ============================================
// Register Editor
// POST /api/admin/editor-invitations/:token/register
// ============================================

export async function registerEditor(
  req: Request,
  res: Response
) {
  try {
    // ============================================
    // Get token
    // ============================================

    const token =
      String(req.params.token ?? "").trim();

    if (!token) {
      return sendError(
        res,
        400,
        "Invitation token is required"
      );
    }

    // ============================================
    // Get registration data
    // ============================================

    const { name, password } = req.body;

    // ============================================
    // Validate name
    // ============================================

    if (
      !name ||
      typeof name !== "string"
    ) {
      return sendError(
        res,
        400,
        "Name is required"
      );
    }

    const normalizedName =
      name.trim();

    if (!normalizedName) {
      return sendError(
        res,
        400,
        "Name is required"
      );
    }

    // ============================================
    // Validate password
    // ============================================

    if (
      !password ||
      typeof password !== "string"
    ) {
      return sendError(
        res,
        400,
        "Password is required"
      );
    }

    if (password.length < 8) {
      return sendError(
        res,
        400,
        "Password must be at least 8 characters"
      );
    }

    // ============================================
    // Hash invitation token
    // ============================================

    const tokenHash =
      createHash("sha256")
        .update(token)
        .digest("hex");

    // ============================================
    // Find invitation
    // ============================================

    const invitation =
      await prisma.editorInvitation.findUnique({
        where: {
          tokenHash,
        },
      });

    if (!invitation) {
      return sendError(
        res,
        404,
        "Invalid invitation"
      );
    }

    // ============================================
    // Check if already used
    // ============================================

    if (invitation.usedAt) {
      return sendError(
        res,
        400,
        "This invitation has already been used"
      );
    }

    // ============================================
    // Check expiry
    // ============================================

    if (
      invitation.expiresAt <= new Date()
    ) {
      return sendError(
        res,
        400,
        "This invitation has expired"
      );
    }

    // ============================================
    // Check existing account
    // ============================================

    const existingUser =
      await prisma.user.findUnique({
        where: {
          email: invitation.email,
        },
      });

    if (existingUser) {
      return sendError(
        res,
        409,
        "An account with this email already exists"
      );
    }

    // ============================================
    // Hash password
    // ============================================

    const passwordHash =
      await bcrypt.hash(
        password,
        12
      );

    // ============================================
    // Create editor + mark invitation used
    // ============================================

    const editor =
      await prisma.$transaction(
        async (tx) => {
          const createdEditor =
            await tx.user.create({
              data: {
                name: normalizedName,
                email: invitation.email,
                passwordHash,
                role: "EDITOR",
              },
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
              },
            });

          await tx.editorInvitation.update({
            where: {
              id: invitation.id,
            },
            data: {
              usedAt: new Date(),
            },
          });

          return createdEditor;
        }
      );

    // ============================================
    // Success
    // ============================================

    return res.status(201).json({
      success: true,
      message:
        "Editor account created successfully",
      user: editor,
    });
  } catch (error) {
    console.error(
      "========== REGISTER EDITOR ERROR =========="
    );

    console.error(error);

    return handlePrismaError(
      res,
      error
    );
  }
}



// ============================================
// Delete Editor Invitation
// DELETE /api/admin/editor-invitations/:id
// ============================================

export async function deleteEditorInvitation(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return sendError(
        res,
        401,
        "Unauthorized"
      );
    }

    const id = String(
      req.params.id ?? ""
    ).trim();

    if (!id) {
      return sendError(
        res,
        400,
        "Invitation ID is required"
      );
    }

    const invitation =
      await prisma.editorInvitation.findUnique({
        where: {
          id,
        },
      });

    if (!invitation) {
      return sendError(
        res,
        404,
        "Invitation not found"
      );
    }

    if (invitation.usedAt) {
      return sendError(
        res,
        400,
        "A used invitation cannot be deleted"
      );
    }

    await prisma.editorInvitation.delete({
      where: {
        id,
      },
    });

    return res.json({
      success: true,
      message:
        "Editor invitation deleted successfully",
    });
  } catch (error) {
    console.error(
      "========== DELETE EDITOR INVITATION ERROR =========="
    );

    console.error(error);

    return handlePrismaError(
      res,
      error
    );
  }
}