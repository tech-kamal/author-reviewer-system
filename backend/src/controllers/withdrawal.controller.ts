import { Response } from "express";
import prisma from "../prisma";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { sendError, handlePrismaError } from "../utils/error";

/**
 * =====================================================
 * CREATE WITHDRAWAL REQUEST
 * POST /api/author/withdrawals
 * =====================================================
 */
export const createWithdrawalRequest = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return sendError(res, 401, "Authentication required");
    }

    const authorId = req.user.id;

    const { paperId, reason } = req.body;

    // -------------------------------------------------
    // 1. Validate paper ID
    // -------------------------------------------------

    if (
      !paperId ||
      typeof paperId !== "string" ||
      paperId.trim() === ""
    ) {
      return sendError(res, 400, "Paper ID is required");
    }

    // -------------------------------------------------
    // 2. Validate withdrawal reason
    // -------------------------------------------------

    if (
      !reason ||
      typeof reason !== "string" ||
      reason.trim() === ""
    ) {
      return sendError(
        res,
        400,
        "Withdrawal reason is required"
      );
    }

    if (reason.trim().length < 10) {
      return sendError(
        res,
        400,
        "Withdrawal reason must be at least 10 characters"
      );
    }

    const cleanPaperId = paperId.trim();
    const cleanReason = reason.trim();

    // -------------------------------------------------
    // 3. Find manuscript owned by author
    // -------------------------------------------------

    const paper = await prisma.paper.findFirst({
      where: {
        id: cleanPaperId,
        createdById: authorId,
      },
      select: {
        id: true,
        manuscriptId: true,
        title: true,
        withdrawnAt: true,
      },
    });

    if (!paper) {
      return sendError(
        res,
        404,
        "Manuscript not found"
      );
    }

    // -------------------------------------------------
    // 4. Check if manuscript is already withdrawn
    // -------------------------------------------------

    if (paper.withdrawnAt) {
      return sendError(
        res,
        400,
        "This manuscript has already been withdrawn"
      );
    }

    // -------------------------------------------------
    // 5. Check for an existing pending request
    // -------------------------------------------------

    const pendingRequest =
      await prisma.withdrawalRequest.findFirst({
        where: {
          paperId: paper.id,
          authorId,
          status: "PENDING",
        },
      });

    if (pendingRequest) {
      return sendError(
        res,
        400,
        "A withdrawal request for this manuscript is already pending"
      );
    }

    // -------------------------------------------------
    // 6. Create new withdrawal request
    //
    // Rejected requests are NOT reused.
    // A new request is created every time.
    // -------------------------------------------------

    const withdrawalRequest =
      await prisma.withdrawalRequest.create({
        data: {
          paperId: paper.id,
          authorId,
          reason: cleanReason,
          status: "PENDING",
        },
        include: {
          paper: {
            select: {
              id: true,
              manuscriptId: true,
              title: true,
            },
          },
        },
      });


      // =====================================================
// CREATE NOTIFICATIONS FOR ALL EDITORS
// =====================================================

const editors = await prisma.user.findMany({
  where: {
    role: "EDITOR",
  },
  select: {
    id: true,
  },
});

if (editors.length > 0) {
  await prisma.notification.createMany({
    data: editors.map((editor) => ({
      userId: editor.id,

      type: "WITHDRAWAL_REQUEST",

      title: "New Withdrawal Request",

      message: `A new withdrawal request has been submitted for manuscript ${
        paper.manuscriptId || paper.id
      }.`,

      relatedId: withdrawalRequest.id,

      relatedType: "WITHDRAWAL_REQUEST",

      isRead: false,
    })),
  });
}

    // -------------------------------------------------
    // 7. Success response
    // -------------------------------------------------

    return res.status(201).json({
      success: true,
      message:
        "Withdrawal request submitted successfully",
      withdrawalRequest,
    });
  } catch (error) {
    console.error(
      "createWithdrawalRequest error:",
      error
    );

    return handlePrismaError(res, error);
  }
};


/**
 * =====================================================
 * GET AUTHOR WITHDRAWAL REQUESTS
 * GET /api/author/withdrawals
 * =====================================================
 */
export const getMyWithdrawalRequests = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return sendError(res, 401, "Authentication required");
    }

    const authorId = req.user.id;

    // -------------------------------------------------
    // Get all withdrawal requests made by author
    // -------------------------------------------------

    const withdrawalRequests =
      await prisma.withdrawalRequest.findMany({
        where: {
          authorId,
        },
        include: {
          paper: {
            select: {
              id: true,
              manuscriptId: true,
              title: true,
              authors: true,
              editorialDecision: true,
              decisionAt: true,
              withdrawnAt: true,
            },
          },
          decidedBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          requestedAt: "desc",
        },
      });

    return res.status(200).json({
      success: true,
      withdrawalRequests,
    });
  } catch (error) {
    console.error(
      "getMyWithdrawalRequests error:",
      error
    );

    return handlePrismaError(res, error);
  }
};



/**
 * =====================================================
 * DELETE WITHDRAWN MANUSCRIPT
 * DELETE /api/author/withdrawals/:paperId
 * =====================================================
 */
export const deleteWithdrawnManuscript = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return sendError(res, 401, "Authentication required");
    }

    const authorId = req.user.id;
    const paperId = req.params.paperId;

    // -------------------------------------------------
    // 1. Validate paper ID
    // -------------------------------------------------

    if (
      !paperId ||
      typeof paperId !== "string" ||
      paperId.trim() === ""
    ) {
      return sendError(res, 400, "Paper ID is required");
    }

    const cleanPaperId = paperId.trim();

    // -------------------------------------------------
    // 2. Find manuscript owned by author
    //    and verify withdrawal was APPROVED
    // -------------------------------------------------

    const paper = await prisma.paper.findFirst({
      where: {
        id: cleanPaperId,
        createdById: authorId,
        withdrawnAt: {
          not: null,
        },
        withdrawalRequests: {
          some: {
            authorId,
            status: "APPROVED",
          },
        },
      },
      select: {
        id: true,
        manuscriptId: true,
        title: true,
      },
    });

    if (!paper) {
      return sendError(
        res,
        404,
        "Withdrawn manuscript not found"
      );
    }

    // -------------------------------------------------
    // 3. Permanently delete manuscript
    //
    // Prisma schema has Cascade relations, so related
    // withdrawal requests/reviews etc. are removed
    // according to the existing schema relations.
    // -------------------------------------------------

    await prisma.paper.delete({
      where: {
        id: paper.id,
      },
    });

    // -------------------------------------------------
    // 4. Success response
    // -------------------------------------------------

    return res.status(200).json({
      success: true,
      message:
        "Withdrawn manuscript deleted successfully",
      paperId: paper.id,
      manuscriptId: paper.manuscriptId,
    });
  } catch (error) {
    console.error(
      "deleteWithdrawnManuscript error:",
      error
    );

    return handlePrismaError(res, error);
  }
};