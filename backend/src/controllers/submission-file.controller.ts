import { Response } from "express";
import path from "path";
import fs from "fs";

import prisma from "../prisma";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { sendError, handlePrismaError } from "../utils/error";

/**
 * UPLOAD FILES FOR SUBMISSION DRAFT
 * POST /api/author/drafts/:id/files
 */
export const uploadSubmissionFiles = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return sendError(res, 401, "Authentication required");
    }

    const draftId = String(req.params.id);

    const draft = await prisma.submissionDraft.findFirst({
      where: {
        id: draftId,
        authorId: req.user.id,
      },
    });

    if (!draft) {
      return sendError(res, 404, "Submission draft not found");
    }

    const files = req.files as {
      [fieldname: string]: Express.Multer.File[];
    };

    const mainFile = files?.mainFile?.[0];
    const supplementaryFile = files?.supplementaryFile?.[0];

    if (!mainFile && !supplementaryFile) {
      return sendError(res, 400, "No file uploaded");
    }

    const updateData: {
    mainFilePath?: string;
    mainFileName?: string;
    supplementaryFilePath?: string;
    supplementaryFileName?: string;
    } = {};
    if (mainFile) {
    updateData.mainFilePath = path
        .join("uploads", "submissions", mainFile.filename)
        .replace(/\\/g, "/");

    updateData.mainFileName = mainFile.originalname;
    }

    if (supplementaryFile) {
    updateData.supplementaryFilePath = path
        .join("uploads", "submissions", supplementaryFile.filename)
        .replace(/\\/g, "/");

    updateData.supplementaryFileName =
        supplementaryFile.originalname;
    }

    const updatedDraft = await prisma.submissionDraft.update({
      where: {
        id: draftId,
      },
      data: updateData,
    });

    return res.json({
      message: "File uploaded successfully",
      draft: updatedDraft,
      files: {
        mainFile: mainFile
          ? {
              originalName: mainFile.originalname,
              filename: mainFile.filename,
              size: mainFile.size,
              path: updateData.mainFilePath,
            }
          : null,

        supplementaryFile: supplementaryFile
          ? {
              originalName: supplementaryFile.originalname,
              filename: supplementaryFile.filename,
              size: supplementaryFile.size,
              path: updateData.supplementaryFilePath,
            }
          : null,
      },
    });
  } catch (error) {
    console.error("uploadSubmissionFiles error:", error);

    // Remove uploaded files if database update fails
    const files = req.files as {
      [fieldname: string]: Express.Multer.File[];
    };

    const uploadedFiles = [
      ...(files?.mainFile || []),
      ...(files?.supplementaryFile || []),
    ];

    for (const file of uploadedFiles) {
      try {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      } catch (cleanupError) {
        console.error(
          "Failed to remove uploaded file:",
          cleanupError
        );
      }
    }

    return handlePrismaError(res, error);
  }
};