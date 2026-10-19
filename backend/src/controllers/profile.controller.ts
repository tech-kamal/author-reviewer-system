import { Response } from "express";
import bcrypt from "bcryptjs";

import prisma from "../prisma";
import { AuthenticatedRequest } from "../middleware/auth.middleware";

import {
  sendError,
  handlePrismaError,
} from "../utils/error";

// =====================================================
// GET PROFILE
// GET /api/profile
// =====================================================

export const getProfile = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    console.log("========== GET PROFILE ==========");

    const userId = req.user?.id;

    // ---------------------------------------------
    // 1. Authentication check
    // ---------------------------------------------

    if (!userId) {
      return sendError(
        res,
        401,
        "Unauthorized"
      );
    }

    // ---------------------------------------------
    // 2. Find current user
    // ---------------------------------------------

    const user =
      await prisma.user.findUnique({
        where: {
          id: userId,
        },

        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          affiliation: true,
          orcid: true,
          country: true,
          profilePhoto: true,
          createdAt: true,
          updatedAt: true,
        },
      });

    // ---------------------------------------------
    // 3. User not found
    // ---------------------------------------------

    if (!user) {
      return sendError(
        res,
        404,
        "User not found"
      );
    }

    // ---------------------------------------------
    // 4. Success response
    // ---------------------------------------------

    return res.status(200).json({
      success: true,
      profile: user,
    });
  } catch (error) {
    console.error(
      "========== GET PROFILE ERROR =========="
    );

    console.error(error);

    return handlePrismaError(
      res,
      error
    );
  }
};

// =====================================================
// UPDATE PROFILE
// PATCH /api/profile
// =====================================================

export const updateProfile = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    console.log("========== UPDATE PROFILE ==========");

    const userId = req.user?.id;

    // ---------------------------------------------
    // 1. Authentication check
    // ---------------------------------------------

    if (!userId) {
      return sendError(
        res,
        401,
        "Unauthorized"
      );
    }

    // ---------------------------------------------
    // 2. Get form fields
    // ---------------------------------------------

    const {
      name,
      affiliation,
      orcid,
      country,
    } = req.body;

    // ---------------------------------------------
    // 3. Name validation
    // ---------------------------------------------

    if (
      !name ||
      typeof name !== "string" ||
      name.trim() === ""
    ) {
      return sendError(
        res,
        400,
        "Name is required"
      );
    }

    // ---------------------------------------------
    // 4. Update profile
    // ---------------------------------------------

    const user =
      await prisma.user.update({
        where: {
          id: userId,
        },

        data: {
          name: name.trim(),

          affiliation:
            affiliation &&
            typeof affiliation === "string" &&
            affiliation.trim() !== ""
              ? affiliation.trim()
              : null,

          orcid:
            orcid &&
            typeof orcid === "string" &&
            orcid.trim() !== ""
              ? orcid.trim()
              : null,

          country:
            country &&
            typeof country === "string" &&
            country.trim() !== ""
              ? country.trim()
              : null,
        },

        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          affiliation: true,
          orcid: true,
          country: true,
          profilePhoto: true,
          createdAt: true,
          updatedAt: true,
        },
      });

    // ---------------------------------------------
    // 5. Success response
    // ---------------------------------------------

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      profile: user,
    });
  } catch (error) {
    console.error(
      "========== UPDATE PROFILE ERROR =========="
    );

    console.error(error);

    return handlePrismaError(
      res,
      error
    );
  }
};

// =====================================================
// CHANGE PASSWORD
// PATCH /api/profile/password
// =====================================================

export const changePassword = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    console.log(
      "========== CHANGE PASSWORD =========="
    );

    const userId = req.user?.id;

    // ---------------------------------------------
    // 1. Authentication check
    // ---------------------------------------------

    if (!userId) {
      return sendError(
        res,
        401,
        "Unauthorized"
      );
    }

    // ---------------------------------------------
    // 2. Get password fields
    // ---------------------------------------------

    const {
      currentPassword,
      newPassword,
    } = req.body;

    // ---------------------------------------------
    // 3. Validation
    // ---------------------------------------------

    if (
      !currentPassword ||
      !newPassword
    ) {
      return sendError(
        res,
        400,
        "Current password and new password are required"
      );
    }

    if (
      typeof newPassword !== "string" ||
      newPassword.length < 6
    ) {
      return sendError(
        res,
        400,
        "New password must be at least 6 characters"
      );
    }

    // ---------------------------------------------
    // 4. Find current user
    // ---------------------------------------------

    const user =
      await prisma.user.findUnique({
        where: {
          id: userId,
        },

        select: {
          id: true,
          passwordHash: true,
        },
      });

    // ---------------------------------------------
    // 5. User not found
    // ---------------------------------------------

    if (!user) {
      return sendError(
        res,
        404,
        "User not found"
      );
    }

    // ---------------------------------------------
    // 6. Verify current password
    // ---------------------------------------------

    const passwordMatches =
      await bcrypt.compare(
        currentPassword,
        user.passwordHash
      );

    if (!passwordMatches) {
      return sendError(
        res,
        400,
        "Current password is incorrect"
      );
    }

    // ---------------------------------------------
    // 7. Hash new password
    // ---------------------------------------------

    const newPasswordHash =
      await bcrypt.hash(
        newPassword,
        12
      );

    // ---------------------------------------------
    // 8. Update password
    // ---------------------------------------------

    await prisma.user.update({
      where: {
        id: userId,
      },

      data: {
        passwordHash:
          newPasswordHash,
      },
    });

    // ---------------------------------------------
    // 9. Success response
    // ---------------------------------------------

    return res.status(200).json({
      success: true,
      message:
        "Password changed successfully",
    });
  } catch (error) {
    console.error(
      "========== CHANGE PASSWORD ERROR =========="
    );

    console.error(error);

    return handlePrismaError(
      res,
      error
    );
  }
};

// =====================================================
// UPDATE PROFILE PHOTO
// PATCH /api/profile/photo
// =====================================================

export const updateProfilePhoto = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    console.log(
      "========== UPDATE PROFILE PHOTO =========="
    );

    const userId = req.user?.id;

    // ---------------------------------------------
    // 1. Authentication check
    // ---------------------------------------------

    if (!userId) {
      return sendError(
        res,
        401,
        "Unauthorized"
      );
    }

    // ---------------------------------------------
    // 2. Check uploaded file
    // ---------------------------------------------

    if (!req.file) {
      return sendError(
        res,
        400,
        "Profile photo is required"
      );
    }

    // ---------------------------------------------
    // 3. Create profile photo path
    // ---------------------------------------------

    const profilePhotoPath =
      `/uploads/${req.file.filename}`;

    // ---------------------------------------------
    // 4. Update user profile photo
    // ---------------------------------------------

    const user =
      await prisma.user.update({
        where: {
          id: userId,
        },

        data: {
          profilePhoto:
            profilePhotoPath,
        },

        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          affiliation: true,
          orcid: true,
          country: true,
          profilePhoto: true,
          createdAt: true,
          updatedAt: true,
        },
      });

    // ---------------------------------------------
    // 5. Success response
    // ---------------------------------------------

    return res.status(200).json({
      success: true,
      message:
        "Profile photo updated successfully",
      profile: user,
    });
  } catch (error) {
    console.error(
      "========== UPDATE PROFILE PHOTO ERROR =========="
    );

    console.error(error);

    return handlePrismaError(
      res,
      error
    );
  }
};