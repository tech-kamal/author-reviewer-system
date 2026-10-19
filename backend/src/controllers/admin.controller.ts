import {
  Response,
} from "express";

import bcrypt from "bcryptjs";

import prisma from "../prisma";

import {
  AuthenticatedRequest,
} from "../middleware/auth.middleware";

import {
  sendError,
  handlePrismaError,
} from "../utils/error";

// ============================================
// Create Admin
// ============================================

export async function createAdmin(
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
    // Validate request
    // ============================================

    const {
      name,
      email,
      password,
    } = req.body;

    if (
      !name ||
      typeof name !== "string" ||
      name.trim().length < 2
    ) {
      return sendError(
        res,
        400,
        "Name must be at least 2 characters"
      );
    }

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

    if (
      !password ||
      typeof password !== "string" ||
      password.length < 6
    ) {
      return sendError(
        res,
        400,
        "Password must be at least 6 characters"
      );
    }

    // ============================================
    // Normalize email
    // ============================================

    const normalizedEmail =
      email.toLowerCase().trim();

    // ============================================
    // Check existing user
    // ============================================

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

    // ============================================
    // Hash password
    // ============================================

    const passwordHash =
      await bcrypt.hash(
        password,
        12
      );

    // ============================================
    // Create Admin
    // ============================================

    const admin =
      await prisma.user.create({
        data: {
          name: name.trim(),
          email: normalizedEmail,
          passwordHash,
          role: "ADMIN",
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
      });

    // ============================================
    // Success
    // ============================================

    return res.status(201).json({
      success: true,
      message: "Admin created successfully",
      admin,
    });
  } catch (error) {
    console.error(
      "========== CREATE ADMIN ERROR =========="
    );

    console.error(error);

    return handlePrismaError(
      res,
      error
    );
  }
}

// ============================================
// Get All Admins
// ============================================

export async function getAdmins(
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
    // Get admins
    // ============================================

    const admins =
      await prisma.user.findMany({
        where: {
          role: "ADMIN",
        },

        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },

        orderBy: {
          createdAt: "asc",
        },
      });

    // ============================================
    // Success
    // ============================================

    return res.json({
      success: true,
      admins,
    });
  } catch (error) {
    console.error(
      "========== GET ADMINS ERROR =========="
    );

    console.error(error);

    return handlePrismaError(
      res,
      error
    );
  }
}

// ============================================
// Delete Admin
// ============================================

export async function deleteAdmin(
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

    const { id } = req.params;

    // ============================================
    // Validate ID
    // ============================================

    if (
      !id ||
      typeof id !== "string" ||
      id.trim() === ""
    ) {
      return sendError(
        res,
        400,
        "Admin ID is required"
      );
    }

    // ============================================
    // Prevent self deletion
    // ============================================

    if (id === req.user.id) {
      return sendError(
        res,
        400,
        "You cannot delete your own admin account"
      );
    }

    // ============================================
    // Find admin
    // ============================================

    const admin =
      await prisma.user.findFirst({
        where: {
          id,
          role: "ADMIN",
        },
      });

    if (!admin) {
      return sendError(
        res,
        404,
        "Admin not found"
      );
    }

    // ============================================
    // Count admins
    // ============================================

    const adminCount =
      await prisma.user.count({
        where: {
          role: "ADMIN",
        },
      });

    // ============================================
    // Protect last admin
    // ============================================

    if (adminCount <= 1) {
      return sendError(
        res,
        400,
        "At least one admin account must remain"
      );
    }

    // ============================================
    // Delete admin
    // ============================================

    await prisma.user.delete({
      where: {
        id: admin.id,
      },
    });

    // ============================================
    // Success
    // ============================================

    return res.json({
      success: true,
      message: "Admin deleted successfully",
    });
  } catch (error) {
    console.error(
      "========== DELETE ADMIN ERROR =========="
    );

    console.error(error);

    return handlePrismaError(
      res,
      error
    );
  }
}




// ============================================
// Get Admin Dashboard Statistics
// GET /api/admin/stats
// ============================================

export async function getAdminStats(
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
    // Get counts
    // ============================================

    const [
      administrators,
      editors,
      reviewers,
      pendingInvitations,
    ] = await Promise.all([
      prisma.user.count({
        where: {
          role: "ADMIN",
        },
      }),

      prisma.user.count({
        where: {
          role: "EDITOR",
        },
      }),

      prisma.user.count({
        where: {
          role: "REVIEWER",
        },
      }),

      prisma.editorInvitation.count({
        where: {
          usedAt: null,
          expiresAt: {
            gt: new Date(),
          },
        },
      }),
    ]);

    // ============================================
    // Success
    // ============================================

    return res.json({
      success: true,
      stats: {
        administrators,
        editors,
        reviewers,
        pendingInvitations,
      },
    });
  } catch (error) {
    console.error(
      "========== GET ADMIN STATS ERROR =========="
    );

    console.error(error);

    return handlePrismaError(
      res,
      error
    );
  }
}


// ============================================
// Get Editors / Reviewers
// GET /api/admin/users?role=EDITOR
// GET /api/admin/users?role=REVIEWER
// ============================================

export async function getUsersByRole(
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

    const role = String(
      req.query.role ?? ""
    )
      .trim()
      .toUpperCase();

    if (
      role !== "EDITOR" &&
      role !== "REVIEWER"
    ) {
      return sendError(
        res,
        400,
        "Valid role is required"
      );
    }

    const users =
      await prisma.user.findMany({
        where: {
          role,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

    return res.json({
      success: true,
      users,
    });
  } catch (error) {
    console.error(
      "========== GET USERS BY ROLE ERROR =========="
    );

    console.error(error);

    return handlePrismaError(
      res,
      error
    );
  }
}


// ============================================
// Delete Editor / Reviewer
// DELETE /api/admin/users/:id
// ============================================

// export async function deleteUser(
//   req: AuthenticatedRequest,
//   res: Response
// ) {
//   try {
//     if (!req.user) {
//       return sendError(
//         res,
//         401,
//         "Unauthorized"
//       );
//     }

//     const id = String(
//       req.params.id ?? ""
//     ).trim();

//     if (!id) {
//       return sendError(
//         res,
//         400,
//         "User ID is required"
//       );
//     }

//     const user =
//       await prisma.user.findUnique({
//         where: {
//           id,
//         },
//         select: {
//           id: true,
//           name: true,
//           email: true,
//           role: true,
//         },
//       });

//     if (!user) {
//       return sendError(
//         res,
//         404,
//         "User not found"
//       );
//     }

//     // ============================================
//     // Admin cannot be deleted from this endpoint
//     // ============================================

//     if (user.role === "ADMIN") {
//       return sendError(
//         res,
//         403,
//         "Administrators must be managed from Admin Management"
//       );
//     }

//     // ============================================
//     // Check editor papers before deletion
//     // ============================================

//     // if (user.role === "EDITOR") {
//     //   const paperCount =
//     //     await prisma.paper.count({
//     //       where: {
//     //         createdById: user.id,
//     //       },
//     //     });

//     //   if (paperCount > 0) {
//         // return sendError(
//     //       res,
//     //       409,
//     //       "This editor cannot be deleted because they have created papers"
//     //     );
//     //   }
//     // }

//     // ============================================
//     // Delete user
//     // ============================================

//     await prisma.user.delete({
//       where: {
//         id: user.id,
//       },
//     });

//     return res.json({
//       success: true,
//       message: `${user.role} deleted successfully`,
//     });
//   } catch (error) {
//     console.error(
//       "========== DELETE USER ERROR =========="
//     );

//     console.error(error);

//     return handlePrismaError(
//       res,
//       error
//     );
//   }
// }

export const deleteUser = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return sendError(res, 401, "Unauthorized");
    }

    const id = String(req.params.id ?? "").trim();

    if (!id) {
      return sendError(res, 400, "User ID is required");
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      return sendError(res, 404, "User not found");
    }

    // Admins are managed separately.
    if (user.role === "ADMIN") {
      return sendError(
        res,
        400,
        "Administrators must be managed from Admin Management"
      );
    }

    // Delete everything created/associated with the user
    // before deleting the user itself.
    if (user.role === "EDITOR") {
      await prisma.paper.deleteMany({
        where: {
          createdById: id,
        },
      });
    }

    await prisma.user.delete({
      where: {
        id,
      },
    });

    return res.status(200).json({
      success: true,
      message: `${user.role} deleted successfully`,
    });
  } catch (error) {
    console.error("deleteUser error:", error);

    return handlePrismaError(res, error);
  }
};