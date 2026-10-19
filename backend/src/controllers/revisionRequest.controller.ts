import { Response } from "express";
import prisma from "../prisma";
import { sendRevisionReminderEmail } from "../services/email.service";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { sendError, handlePrismaError } from "../utils/error";

import fs from "fs";
import path from "path";

// ============================================================
// 1. GET REVISION DATA

// ============================================================

export const getRevisionData = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const editorId = req.user?.id;
    const { paperId } = req.params;
    // ========================================================
    // Authentication
    // ========================================================
    if (!editorId) {
      return sendError(
        res,
        401,
        "Unauthorized"
      );
    }
    // ========================================================
    // Validate paper ID
    // ========================================================
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
    // ========================================================
    // Get paper
    // ========================================================
    const paper =
      await prisma.paper.findUnique({
        where: {
          id: paperId,
        },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
          reviewRequests: {
            where: {
              status: "REVIEW_SUBMITTED",
            },
            include: {
              reviewer: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
              review: true,
            },
            orderBy: {
              respondedAt: "desc",
            },
          },
        },
      });
    // ========================================================
    // Paper not found
    // ========================================================
    if (!paper) {
      return sendError(
        res,
        404,
        "Paper not found"
      );
    }
    // ========================================================
    // Check that logged-in editor owns this paper
    // ========================================================
   const isPaperOwner = paper.createdById === editorId;

  const isAuthorSubmittedPaper =
    paper.createdBy.role === "REVIEWER";

  if (!isPaperOwner && !isAuthorSubmittedPaper) {
    return sendError(
      res,
      403,
      "You are not authorized to manage this paper"
    );
  }
    // ========================================================
    // Keep only requests having an actual review report
    // ========================================================
    const reviewReports =
      paper.reviewRequests
        .filter(
          (request) =>
            request.review !== null
        )
        .map((request) => ({
          reviewRequestId: request.id,
          reviewer: {
            id: request.reviewer.id,
            name: request.reviewer.name,
            email: request.reviewer.email,
          },
          recommendation:
            request.review?.recommendation ?? null,
          commentsToAuthor:
            request.review?.commentsToAuthor ?? "",
          commentsToEditor:
            request.review?.commentsToEditor ?? null,
          attachmentPath:
            request.review?.attachmentPath ?? null,
          attachmentName:
            request.review?.attachmentName ?? null,
          submittedAt:
            request.review?.submittedAt ?? null,
        }));
    // ========================================================
    // No review report received
    // ========================================================
    if (reviewReports.length === 0) {
      return sendError(
        res,
        404,
        "No submitted review report is available for this paper"
      );
    }
    const activeRevisionRequest =
    await prisma.revisionRequest.findFirst({
      where: {
        paperId,
        status: {
          in: ["SENT", "RECEIVED", "SUBMITTED"],
        },
      },
      select: {
        id: true,
        revisionType: true,
        status: true,
      },
    });
    // ========================================================
    // Success
    // ========================================================
    return res.status(200).json({
      success: true,
      paper: {
        id: paper.id,
        manuscriptId: paper.manuscriptId,
        title: paper.title,
        authors: paper.authors,
        abstract: paper.abstract,
        keywords: paper.keywords,
      },
      author: {
        id: paper.createdBy.id,
        name: paper.createdBy.name,
        email: paper.createdBy.email,
      },
      reviewReports,
      activeRevisionRequest,
    });
  } catch (error) {
    console.error(
      "getRevisionData error:",
      error
    );
    return handlePrismaError(
      res,
      error
    );
  }
};

// ============================================================
// 2. SEND REVISION TO AUTHOR

// ============================================================

export const sendRevisionToAuthor = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const editorId = req.user?.id;
    const { paperId } = req.params;
    // ========================================================
    // Request body
    // ========================================================
    const {
      reviewRequestId,
      revisionType,
      reviewReport,
      commentsToAuthor,
    } = req.body;
    // ========================================================
    // Uploaded file
    // ========================================================
    const uploadedFile = req.file;
    // ========================================================
    // Authentication
    // ========================================================
    if (!editorId) {
      return sendError(
        res,
        401,
        "Unauthorized"
      );
    }
    // ========================================================
    // Validate paper ID
    // ========================================================
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
    // ========================================================
    // Validate review request
    // ========================================================
    if (
      !reviewRequestId ||
      typeof reviewRequestId !== "string" ||
      reviewRequestId.trim() === ""
    ) {
      return sendError(
        res,
        400,
        "Review request ID is required"
      );
    }
    // ========================================================
    // Validate revision type
    // ========================================================
    if (
      revisionType !== "MAJOR_REVISION" &&
      revisionType !== "MINOR_REVISION"
    ) {
      return sendError(
        res,
        400,
        "Revision type must be MAJOR_REVISION or MINOR_REVISION"
      );
    }
    // ========================================================
    // Validate reviewer report
    // ========================================================
    if (
      !reviewReport ||
      typeof reviewReport !== "string" ||
      reviewReport.trim() === ""
    ) {
      return sendError(
        res,
        400,
        "Reviewer report is required"
      );
    }
    // ========================================================
    // Validate comments to author
    //
    // Optional field.
    //
    // Editor's comments are NOT accepted here.
    // ========================================================
    if (
      commentsToAuthor !== undefined &&
      commentsToAuthor !== null &&
      typeof commentsToAuthor !== "string"
    ) {
      return sendError(
        res,
        400,
        "Invalid comments to author"
      );
    }
    // ========================================================
    // Get paper
    // ========================================================
    const paper =
      await prisma.paper.findUnique({
        where: {
          id: paperId,
        },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
      });
    // ========================================================
    // Paper not found
    // ========================================================
    if (!paper) {
      return sendError(
        res,
        404,
        "Paper not found"
      );
    }
    // ========================================================
    // Verify editor owns the paper
    // ========================================================
   const isPaperOwner = paper.createdById === editorId;
    const isAuthorSubmittedPaper =
      paper.createdBy.role === "REVIEWER";
    if (!isPaperOwner && !isAuthorSubmittedPaper) {
      return sendError(
        res,
        403,
        "You are not authorized to send revision for this paper"
      );
    }
    // ========================================================
    // Get submitted review
    // ========================================================
    // Prevent sending another revision while one is active.
    const existingActiveRevision =
      await prisma.revisionRequest.findFirst({
        where: {
          paperId,
          status: {
             in: ["SENT", "RECEIVED", "SUBMITTED"],
          },
        },
        select: {
          id: true,
          revisionType: true,
        },
      });
    if (existingActiveRevision) {
      return sendError(
        res,
        409,
        `A ${existingActiveRevision.revisionType === "MAJOR_REVISION" ? "Major Revision" : "Minor Revision"} request has already been sent for this manuscript. Send a reminder instead.`
      );
    }
    const reviewRequest =
      await prisma.reviewRequest.findFirst({
        where: {
          id: reviewRequestId,
          paperId,
          status: "REVIEW_SUBMITTED",
        },
        include: {
          review: true,
        },
      });
    // ========================================================
    // Review not found
    // ========================================================
    if (!reviewRequest) {
      return sendError(
        res,
        404,
        "Submitted review report not found"
      );
    }
    // ========================================================
    // Make sure review exists
    // ========================================================
    if (!reviewRequest.review) {
      return sendError(
        res,
        404,
        "Review report has not been submitted"
      );
    }
    // Otherwise:
    // use the original reviewer attachment.
    // ========================================================
    let revisionFilePath: string | null = null;
    let revisionFileName: string | null = null;
    if (uploadedFile) {
      revisionFilePath =
        `uploads/reviews/${uploadedFile.filename}`;
      revisionFileName =
        uploadedFile.originalname;
    } else if (
      reviewRequest.review.attachmentPath
    ) {
      revisionFilePath =
        reviewRequest.review.attachmentPath;
      revisionFileName =
        reviewRequest.review.attachmentName ??
        null;
    }
    // ========================================================
    const revisionRequest =
      await prisma.revisionRequest.create({
        data: {
          paperId,
          authorId:
            paper.createdById,
          editorId,
          revisionType,
          reviewReport:
            reviewReport.trim(),
          commentsToAuthor:
            commentsToAuthor?.trim() || null,
          status: "SENT",
          revisionFilePath,
          revisionFileName,
        },
        include: {
          paper: {
            select: {
              id: true,
              manuscriptId: true,
              title: true,
            },
          },
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          editor: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
    // ========================================================
    // Update Paper Editorial Decision
    //
    // Example:
    // MAJOR_REVISION
    // MINOR_REVISION
    // ========================================================
    await prisma.paper.update({
      where: {
        id: paperId,
      },
      data: {
        editorialDecision:
          revisionType,
        decisionAt:
          new Date(),
      },
    });
    // ========================================================
    // Create notification for author
    // ========================================================
    const revisionLabel =
      revisionType === "MAJOR_REVISION"
        ? "Major Revision"
        : "Minor Revision";
    await prisma.notification.create({
      data: {
        userId:
          paper.createdById,
        type:
          "REVISION_REQUEST",
        title:
          `${revisionLabel} Received`,
        message:
          `A ${revisionLabel.toLowerCase()} has been requested for manuscript ${paper.manuscriptId ?? paper.id}.`,
        relatedId:
          revisionRequest.id,
        relatedType:
          "REVISION_REQUEST",
      },
    });
    // ========================================================
    // Success
    // ========================================================
    return res.status(201).json({
      success: true,
      message:
        `${revisionLabel} sent to author successfully`,
      revisionRequest,
    });
  } catch (error) {
    console.error(
      "sendRevisionToAuthor error:",
      error
    );
    return handlePrismaError(
      res,
      error
    );
  }
};
// /\*\*
//  \* GET /api/editor/revision-requests/tracking
//  \* Get active revision requests sent by the logged-in editor.
//  \* SUBMITTED requests remain in the database but are excluded here.
//  \*/

export const getRevisionTracking = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const editorId = req.user?.id;
    if (!editorId) {
      return sendError(res, 401, "Unauthorized");
    }
    const revisionRequests = await prisma.revisionRequest.findMany({
      where: {
        editorId,
        status: {
          in: ["SENT", "RECEIVED", "SUBMITTED"],
        },
      },
      include: {
        paper: {
          select: {
            id: true,
            manuscriptId: true,
            title: true,
          },
        },
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        sentAt: "desc",
      },
    });
    return res.status(200).json({
      success: true,
      count: revisionRequests.length,
      revisionRequests,
    });
  } catch (error) {
    console.error("getRevisionTracking error:", error);
    return handlePrismaError(res, error);
  }
};


export const acknowledgeRevisionRequest = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const authorId = req.user?.id;
    const { revisionRequestId } = req.params;

    if (!authorId) {
      return sendError(res, 401, "Unauthorized");
    }

    if (
      !revisionRequestId ||
      typeof revisionRequestId !== "string" ||
      revisionRequestId.trim() === ""
    ) {
      return sendError(res, 400, "Revision request ID is required");
    }

    // Only the intended author can acknowledge their request.
    const revisionRequest = await prisma.revisionRequest.findUnique({
      where: { id: revisionRequestId },
      select: {
        id: true,
        authorId: true,
        status: true,
      },
    });

    if (!revisionRequest || revisionRequest.authorId !== authorId) {
      return sendError(res, 404, "Revision request not found");
    }

    if (revisionRequest.status === "RECEIVED") {
      return res.status(200).json({
        success: true,
        message: "Revision request has already been acknowledged.",
      });
    }

    if (revisionRequest.status !== "SENT") {
      return sendError(
        res,
        409,
        "Only a sent revision request can be acknowledged."
      );
    }

    // Conditional update prevents acknowledging an already changed request.
    const result = await prisma.revisionRequest.updateMany({
      where: {
        id: revisionRequestId,
        authorId,
        status: "SENT",
      },
      data: {
        status: "RECEIVED",
      },
    });

    if (result.count !== 1) {
      return sendError(
        res,
        409,
        "The revision request status has changed. Please refresh and try again."
      );
    }

    return res.status(200).json({
      success: true,
      message: "Revision request acknowledged successfully.",
      status: "RECEIVED",
    });
  } catch (error) {
    console.error("acknowledgeRevisionRequest error:", error);
    return handlePrismaError(res, error);
  }
};


export const sendRevisionReminder = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const editorId = req.user?.id;
    const rawRevisionRequestId = req.params.revisionRequestId;
    const revisionRequestId = Array.isArray(rawRevisionRequestId)
      ? rawRevisionRequestId[0]
      : rawRevisionRequestId;

    if (!editorId) {
      return sendError(res, 401, "Unauthorized");
    }

    if (
      !revisionRequestId ||
      typeof revisionRequestId !== "string" ||
      revisionRequestId.trim() === ""
    ) {
      return sendError(res, 400, "Revision request ID is required");
    }

    const revisionRequest = await prisma.revisionRequest.findUnique({
      where: {
        id: revisionRequestId,
      },
    });

    if (!revisionRequest) {
      return sendError(res, 404, "Revision request not found");
    }

    if (revisionRequest.editorId !== editorId) {
      return sendError(
        res,
        403,
        "You are not authorized to send this reminder"
      );
    }

    if (
      revisionRequest.status !== "SENT" &&
      revisionRequest.status !== "RECEIVED"
    ) {
      return sendError(
        res,
        409,
        "A reminder cannot be sent for a submitted revision"
      );
    }

    const [author, paper] = await Promise.all([
      prisma.user.findUnique({
        where: {
          id: revisionRequest.authorId,
        },
        select: {
          name: true,
          email: true,
        },
      }),
      prisma.paper.findUnique({
        where: {
          id: revisionRequest.paperId,
        },
        select: {
          manuscriptId: true,
          title: true,
        },
      }),
    ]);

    if (!author) {
      return sendError(res, 404, "Author not found");
    }

    if (!paper) {
      return sendError(res, 404, "Paper not found");
    }

    await sendRevisionReminderEmail({
      authorName: author.name,
      authorEmail: author.email,
      manuscriptId: paper.manuscriptId,
      paperTitle: paper.title,
      revisionType: revisionRequest.revisionType,
    });

    return res.status(200).json({
      success: true,
      message: "Revision reminder email sent successfully.",
    });
  } catch (error) {
    console.error("sendRevisionReminder error:", error);
    return handlePrismaError(res, error);
  }
};


export const getMyRevisionRequests = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const authorId = req.user?.id;

    if (!authorId) {
      return sendError(res, 401, "Unauthorized");
    }

    const revisionRequests = await prisma.revisionRequest.findMany({
      where: {
        authorId,
      },
      include: {
        paper: {
          select: {
            id: true,
            manuscriptId: true,
            title: true,
          },
        },
        editor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        sentAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      revisionRequests,
    });
  } catch (error) {
    console.error("getMyRevisionRequests error:", error);
    return handlePrismaError(res, error);
  }
};



// Download a revision attachment for its intended author.
export const downloadRevisionAttachment = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const authorId = req.user?.id;
    const { revisionRequestId } = req.params;

    if (!authorId) {
      return sendError(res, 401, "Unauthorized");
    }

    const revisionRequest = await prisma.revisionRequest.findFirst({
      where: {
        id: revisionRequestId,
        authorId,
      },
      select: {
        revisionFilePath: true,
        revisionFileName: true,
      },
    });

    if (!revisionRequest?.revisionFilePath) {
      return sendError(res, 404, "Attachment not found");
    }

    const filename = path.basename(
      revisionRequest.revisionFilePath
    );

    const filePath = path.resolve(
      process.cwd(),
      "uploads",
      "reviews",
      filename
    );

    const uploadsDirectory = path.resolve(
      process.cwd(),
      "uploads",
      "reviews"
    );

    if (!filePath.startsWith(uploadsDirectory + path.sep)) {
      return sendError(res, 400, "Invalid attachment path");
    }

    if (!fs.existsSync(filePath)) {
      return sendError(res, 404, "Attachment file not found");
    }

    res.download(
      filePath,
      revisionRequest.revisionFileName || "reviewer-attachment.pdf"
    );
  } catch (error) {
    console.error("downloadRevisionAttachment error:", error);
    return handlePrismaError(res, error);
  }
};