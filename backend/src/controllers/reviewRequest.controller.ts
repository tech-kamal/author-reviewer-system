import { Request, Response } from "express";
import { randomBytes } from "crypto";

import prisma from "../prisma";

import {
  AuthenticatedRequest,
} from "../middleware/auth.middleware";

import {
  sendError,
  handlePrismaError,
} from "../utils/error";
import {
  sendReviewerInvitationEmail,
} from "../services/email.service";

// ============================================
// 1. Editor invites a reviewer
// POST /api/editor/review-requests
// ============================================

export const createReviewRequest = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const editorId = req.user?.id;

    // ============================================
    // Check authentication
    // ============================================

    if (!editorId) {
      return sendError(
        res,
        401,
        "Unauthorized"
      );
    }

    const {
      paperId,
      reviewerId,
      dueDate,
    } = req.body;

    // ============================================
    // Validate paper ID
    // ============================================

    if (
      !paperId ||
      typeof paperId !== "string" ||
      paperId.trim() === ""
    ) {
      return sendError(
        res,
        400,
        "Paper ID is required"
      );
    }

    // ============================================
    // Validate reviewer ID
    // ============================================

    if (
      !reviewerId ||
      typeof reviewerId !== "string" ||
      reviewerId.trim() === ""
    ) {
      return sendError(
        res,
        400,
        "Reviewer ID is required"
      );
    }

    // ============================================
    // Validate due date if provided
    // ============================================

    let parsedDueDate: Date | null = null;

    if (dueDate) {
      parsedDueDate = new Date(dueDate);

      if (
        isNaN(parsedDueDate.getTime())
      ) {
        return sendError(
          res,
          400,
          "Invalid due date"
        );
      }
    }

    // ============================================
    // Check paper belongs to logged-in editor
    // ============================================

    const paper =
      await prisma.paper.findUnique({
        where: {
          id: paperId,
        },
      });

    if (!paper) {
      return sendError(
        res,
        404,
        "Paper not found"
      );
    }


    

    // ============================================
    // Check reviewer exists and has REVIEWER role
    // ============================================

    const reviewer =
      await prisma.user.findFirst({
        where: {
          id: reviewerId,
          role: "REVIEWER",
        },
      });

    if (!reviewer) {
      return sendError(
        res,
        404,
        "Reviewer not found"
      );
    }
    // ============================================
    // Prevent author from reviewing their own paper
    // ============================================

    if (reviewer.id === paper.createdById) {
      return sendError(
        res,
        400,
        "The author of this manuscript cannot be invited as a reviewer"
      );
    }
    // ============================================
    // Check if reviewer is already invited
    // ============================================

    const existingRequest =
      await prisma.reviewRequest.findUnique({
        where: {
          paperId_reviewerId: {
            paperId,
            reviewerId,
          },
        },
      });

    if (existingRequest) {
      return sendError(
        res,
        409,
        "Review request already exists"
      );
    }

    // ============================================
    // Generate secure token
    // ============================================

    const tokenHash =
      randomBytes(32).toString("hex");

    // ============================================
    // Create review request
    // ============================================

    const reviewRequest =
      await prisma.reviewRequest.create({
        data: {
          paperId,
          reviewerId,
          dueDate: parsedDueDate,
          tokenHash,
        },

        include: {
          paper: {
            select: {
              id: true,
              manuscriptId: true,
              authors: true,
              title: true,
              abstract: true,
              keywords: true,
              pdfPath: true,
            },
          },

          reviewer: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },

          review: true,
        },
      });

      // ============================================
      // Send reviewer invitation email
      // ============================================

      await sendReviewerInvitationEmail({
        reviewerName: reviewer.name,
        reviewerEmail: reviewer.email,
        editorName: "Editor",
        manuscriptId: paper.manuscriptId,
        authors: paper.authors,
        paperTitle: paper.title,
        dueDate: parsedDueDate,
        token: tokenHash,
      });

    // ============================================
    // Success response
    // ============================================

    return res.status(201).json({
      success: true,
      message:
        "Reviewer invited successfully",
      reviewRequest,
    });
  } catch (error) {
    

    console.error(error);

    return handlePrismaError(
      res,
      error
    );
  }
};

// ============================================
// 2. Editor gets review requests for a paper
// GET /api/editor/papers/:paperId/review-requests
// ============================================

export const getPaperReviewRequests = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const editorId = req.user?.id;
    const { paperId } = req.params;

    // ============================================
    // Check authentication
    // ============================================

    if (!editorId) {
      return sendError(
        res,
        401,
        "Unauthorized"
      );
    }

    // ============================================
    // Validate paper ID
    // ============================================

    if (
      !paperId ||
      typeof paperId !== "string" ||
      paperId.trim() === ""
    ) {
      return sendError(
        res,
        400,
        "Paper ID is required"
      );
    }

    // ============================================
    // Check paper belongs to logged-in editor
    // ============================================

    const paper =
      await prisma.paper.findFirst({
        where: {
          id: paperId,
          createdById: editorId,
        },
      });

    if (!paper) {
      return sendError(
        res,
        404,
        "Paper not found"
      );
    }

    // ============================================
    // Get all review requests
    // ============================================

    const reviewRequests =
      await prisma.reviewRequest.findMany({
        where: {
          paperId,
        },

        include: {
          reviewer: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },

          review: true,
        },

        orderBy: {
          invitedAt: "desc",
        },
      });

    // ============================================
    // Success response
    // ============================================

    return res.status(200).json({
      success: true,

      paper: {
        id: paper.id,
        manuscriptId: paper.manuscriptId,
        authors: paper.authors,
        title: paper.title,
      },

      reviewRequests,
    });
  } catch (error) {
   

    return handlePrismaError(
      res,
      error
    );
  }
};