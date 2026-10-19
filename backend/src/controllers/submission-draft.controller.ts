import { Response } from "express";
import prisma from "../prisma";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { sendError, handlePrismaError } from "../utils/error";
import { generateManuscriptId } from "../utils/manuscript-id";
import { generateContributorInitials } from "../utils/contributor-initials";


export const createDraft = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return sendError(res, 401, "Authentication required");
    }

    const { revisionRequestId } = req.body;

    /*
     * NORMAL NEW SUBMISSION
     */
    if (!revisionRequestId) {
      const draft = await prisma.submissionDraft.create({
        data: {
          authorId: req.user.id,
          currentStep: 1,
        },
      });

      return res.status(201).json({
        message: "Submission draft created successfully",
        draft,
      });
    }

    /*
     * REVISION SUBMISSION
     */

    const revisionRequest =
      await prisma.revisionRequest.findFirst({
        where: {
          id: String(revisionRequestId),
          authorId: req.user.id,
          status: "RECEIVED",
        },
        include: {
          paper: true,
        },
      });

    if (!revisionRequest) {
      return sendError(
        res,
        404,
        "Revision request not found or is no longer available"
      );
    }

    /*
     * Prevent creating multiple active drafts
     * for the same revision request.
     */
    const existingRevisionDraft =
      await prisma.submissionDraft.findFirst({
        where: {
          authorId: req.user.id,
          revisionRequestId: revisionRequest.id,
          status: "DRAFT",
        },
      });

    if (existingRevisionDraft) {
      return res.status(200).json({
        message: "Existing revision draft loaded successfully",
        draft: existingRevisionDraft,
      });
    }

    /*
     * Create a revision draft using the
     * existing manuscript information.
     */
    const draft = await prisma.submissionDraft.create({
      data: {
        authorId: req.user.id,

        revisionRequestId: revisionRequest.id,

        manuscriptId:
          revisionRequest.paper.manuscriptId,

        title: revisionRequest.paper.title,

        abstract: revisionRequest.paper.abstract,

        keywords: revisionRequest.paper.keywords,

        contributors:
          revisionRequest.paper.authors,

        currentStep: 2,
      },
    });

    return res.status(201).json({
      message: "Revision submission draft created successfully",
      draft,
    });
  } catch (error) {
    console.error("createDraft error:", error);
    return handlePrismaError(res, error);
  }
};

/**
 * GET LATEST DRAFT OF LOGGED-IN AUTHOR
 * GET /api/author/drafts/current
 */
export const getCurrentDraft = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return sendError(res, 401, "Authentication required");
    }

    const draft = await prisma.submissionDraft.findFirst({
      where: {
        authorId: req.user.id,
        status: "DRAFT",
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return res.json({
      draft: draft ?? null,
    });
  } catch (error) {
    console.error("getCurrentDraft error:", error);
    return handlePrismaError(res, error);
  }
};

/**
 * GET ALL DRAFTS OF LOGGED-IN AUTHOR
 * GET /api/author/drafts
 */
export const getMyDrafts = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return sendError(res, 401, "Authentication required");
    }

    const drafts = await prisma.submissionDraft.findMany({
      where: {
        authorId: req.user.id,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return res.json({
      drafts,
    });
  } catch (error) {
    console.error("getMyDrafts error:", error);
    return handlePrismaError(res, error);
  }
};

/**
 * GET ALL SUBMITTED MANUSCRIPTS OF LOGGED-IN AUTHOR
 * GET /api/author/submissions
 */
export const getMySubmissions = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return sendError(res, 401, "Authentication required");
    }

    const papers = await prisma.paper.findMany({
      where: {
        createdById: req.user.id,
      },
      select: {
        id: true,
        manuscriptId: true,
        title: true,
        abstract: true,
        keywords: true,
        authors: true,
        editorialDecision: true,
        decisionAt: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.json({
      submissions: papers,
    });
  } catch (error) {
    console.error("getMySubmissions error:", error);
    return handlePrismaError(res, error);
  }
};

/**
 * GET SINGLE DRAFT
 * GET /api/author/drafts/:id
 */
export const getDraftById = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return sendError(res, 401, "Authentication required");
    }

    const id = String(req.params.id);

    const draft = await prisma.submissionDraft.findFirst({
      where: {
        id,
        authorId: req.user.id,
      },
    });

    if (!draft) {
      return sendError(res, 404, "Submission draft not found");
    }

    return res.json({
      draft,
    });
  } catch (error) {
    console.error("getDraftById error:", error);
    return handlePrismaError(res, error);
  }
};

/**
 * UPDATE / SAVE DRAFT
 * PATCH /api/author/drafts/:id
 */
export const updateDraft = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return sendError(res, 401, "Authentication required");
    }

    const id = String(req.params.id);

    const existingDraft = await prisma.submissionDraft.findFirst({
      where: {
        id,
        authorId: req.user.id,
      },
    });

    if (!existingDraft) {
      return sendError(res, 404, "Submission draft not found");
    }

    const {
      manuscriptId,
      title,
      abstract,
      keywords,
      mainFilePath,
      supplementaryFilePath,
      contributors,
      editorMessage,
      conflictOfInterest,
      reviewerSuggestions,
      currentStep,
      revisionRequestId,
    } = req.body;

    const updateData: {
      manuscriptId?: string | null;
      title?: string | null;
      abstract?: string | null;
      keywords?: string | null;
      mainFilePath?: string | null;
      supplementaryFilePath?: string | null;
      contributors?: string | null;
      editorMessage?: string | null;
      conflictOfInterest?: string | null;
      reviewerSuggestions?: string | null;
      currentStep?: number;
      revisionRequestId?: string | null;
    } = {};

    if (manuscriptId !== undefined) {
      updateData.manuscriptId = manuscriptId || null;
    }

    if (title !== undefined) {
      updateData.title = title || null;
    }

    if (abstract !== undefined) {
      updateData.abstract = abstract || null;
    }

    if (keywords !== undefined) {
      updateData.keywords = keywords || null;
    }

    if (mainFilePath !== undefined) {
      updateData.mainFilePath = mainFilePath || null;
    }

    if (supplementaryFilePath !== undefined) {
      updateData.supplementaryFilePath =
        supplementaryFilePath || null;
    }

    if (contributors !== undefined) {
      updateData.contributors = contributors || null;
    }

    if (editorMessage !== undefined) {
      updateData.editorMessage = editorMessage || null;
    }

    if (conflictOfInterest !== undefined) {
      updateData.conflictOfInterest =
        conflictOfInterest || null;
    }

    if (reviewerSuggestions !== undefined) {
      updateData.reviewerSuggestions =
        reviewerSuggestions || null;
    }

    if (revisionRequestId !== undefined) {
      if (revisionRequestId) {
        const revisionRequest =
          await prisma.revisionRequest.findFirst({
            where: {
              id: String(revisionRequestId),
              authorId: req.user.id,
            },
          });

        if (!revisionRequest) {
          return sendError(
            res,
            404,
            "Revision request not found"
          );
        }

        updateData.revisionRequestId =
          revisionRequest.id;
      } else {
        updateData.revisionRequestId = null;
      }
    }

    if (currentStep !== undefined) {
      const step = Number(currentStep);

      if (!Number.isInteger(step) || step < 1 || step > 6) {
        return sendError(
          res,
          400,
          "Current step must be between 1 and 6"
        );
      }

      updateData.currentStep = step;
    }

    const draft = await prisma.submissionDraft.update({
      where: {
        id,
      },
      data: updateData,
    });

    return res.json({
      message: "Submission draft saved successfully",
      draft,
    });
  } catch (error) {
    console.error("updateDraft error:", error);
    return handlePrismaError(res, error);
  }
};

/**
 * DELETE DRAFT
 * DELETE /api/author/drafts/:id
 */
export const deleteDraft = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return sendError(res, 401, "Authentication required");
    }

    const id = String(req.params.id);

    const existingDraft = await prisma.submissionDraft.findFirst({
      where: {
        id,
        authorId: req.user.id,
      },
    });

    if (!existingDraft) {
      return sendError(res, 404, "Submission draft not found");
    }

    await prisma.submissionDraft.delete({
      where: {
        id,
      },
    });

    return res.json({
      message: "Submission draft deleted successfully",
    });
  } catch (error) {
    console.error("deleteDraft error:", error);
    return handlePrismaError(res, error);
  }
};


/**
 * SUBMIT SUBMISSION DRAFT
 *
 * Normal submission:
 *   Creates a new Paper and generates a new manuscript ID.
 *
 * Revision submission:
 *   Updates the existing Paper and marks the RevisionRequest
 *   as SUBMITTED.
 *
 * POST /api/author/drafts/:id/submit
 */
export const submitSubmissionDraft = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return sendError(
        res,
        401,
        "Authentication required"
      );
    }

    const draftId = String(req.params.id);

    const result = await prisma.$transaction(
      async (tx) => {
        /*
         * -------------------------------------------------------
         * 1. FIND AUTHOR'S DRAFT
         * -------------------------------------------------------
         */
        const draft =
          await tx.submissionDraft.findFirst({
            where: {
              id: draftId,
              authorId: req.user!.id,
              status: "DRAFT",
            },
          });

        if (!draft) {
          throw new Error(
            "Submission draft not found"
          );
        }

        /*
         * -------------------------------------------------------
         * 2. COMMON VALIDATION
         * -------------------------------------------------------
         */

        if (!draft.title?.trim()) {
          throw new Error(
            "Manuscript title is required"
          );
        }

        if (!draft.abstract?.trim()) {
          throw new Error(
            "Manuscript abstract is required"
          );
        }

        if (!draft.keywords?.trim()) {
          throw new Error(
            "At least one keyword is required"
          );
        }

        if (!draft.mainFilePath) {
          throw new Error(
            "Main manuscript file is required"
          );
        }

        if (!draft.contributors?.trim()) {
          throw new Error(
            "At least one contributor is required"
          );
        }

        /*
         * -------------------------------------------------------
         * 3. VALIDATE CONTRIBUTORS
         * -------------------------------------------------------
         */

        let contributors: Array<{
          name?: string;
          email?: string;
          affiliation?: string;
          role?: string;
        }>;

        try {
          contributors = JSON.parse(
            draft.contributors
          );
        } catch {
          throw new Error(
            "Invalid contributor information"
          );
        }

        const hasInvalidContributor =
          contributors.some(
            (contributor) =>
              !contributor.name?.trim() ||
              !contributor.email?.trim()
          );

        if (hasInvalidContributor) {
          throw new Error(
            "Please complete all required contributor information"
          );
        }

        /*
         * =======================================================
         * 4. REVISION SUBMISSION
         * =======================================================
         *
         * If this draft belongs to a RevisionRequest,
         * update the existing Paper.
         *
         * DO NOT create a new Paper.
         *
         * DO NOT generate a new manuscript ID.
         */
        if (draft.revisionRequestId) {
          /*
           * -----------------------------------------------------
           * 4.1 FIND REVISION REQUEST
           * -----------------------------------------------------
           */
          const revisionRequest =
            await tx.revisionRequest.findFirst({
              where: {
                id: draft.revisionRequestId,
                authorId: req.user!.id,
              },
              include: {
                paper: true,
              },
            });

          if (!revisionRequest) {
            throw new Error(
              "Revision request not found"
            );
          }

          /*
           * -----------------------------------------------------
           * 4.2 CHECK REVISION REQUEST STATUS
           * -----------------------------------------------------
           *
           * SENT means the editor has sent the revision
           * request and the author can submit the revision.
           */
          if (revisionRequest.status !== "RECEIVED") {
            throw new Error(
              "Please acknowledge the revision request before submitting the revised manuscript"
            );
          }

          /*
           * -----------------------------------------------------
           * 4.3 FIND EXISTING PAPER
           * -----------------------------------------------------
           */
          const paper =
            revisionRequest.paper;

          if (!paper) {
            throw new Error(
              "Original manuscript not found"
            );
          }

          /*
           * Security check:
           * The paper must belong to the logged-in author.
           */
          if (
            paper.createdById !==
            req.user!.id
          ) {
            throw new Error(
              "You are not authorized to submit this revision"
            );
          }

          /*
           * -----------------------------------------------------
           * 4.4 DETERMINE RECEIVED REVISION STATUS
           * -----------------------------------------------------
           */
          const receivedDecision =
            revisionRequest.revisionType ===
            "MAJOR_REVISION"
              ? "RECEIVED_MAJOR_REVISION"
              : "RECEIVED_MINOR_REVISION";

          /*
           * -----------------------------------------------------
           * 4.5 UPDATE EXISTING PAPER
           * -----------------------------------------------------
           *
           * IMPORTANT:
           *
           * manuscriptId stays unchanged.
           *
           * We only replace the manuscript file and update
           * the editorial decision/status.
           */
          const updatedPaper =
            await tx.paper.update({
              where: {
                id: paper.id,
              },
              data: {
                pdfPath:
                  draft.mainFilePath,

                editorialDecision:
                  receivedDecision,

                decisionAt:
                  new Date(),
              },
            });

          /*
           * -----------------------------------------------------
           * 4.6 UPDATE REVISION REQUEST
           * -----------------------------------------------------
           */
          await tx.revisionRequest.update({
            where: {
              id: revisionRequest.id,
            },
            data: {
              status: "SUBMITTED",

              submittedAt:
                new Date(),

              revisionFilePath:
                draft.mainFilePath,

              revisionFileName:
                draft.mainFileName ??
                null,
            },
          });

          /*
           * -----------------------------------------------------
           * 4.7 MARK DRAFT AS SUBMITTED
           * -----------------------------------------------------
           */
          await tx.submissionDraft.update({
            where: {
              id: draft.id,
            },
            data: {
              status: "SUBMITTED",
            },
          });

          /*
           * -----------------------------------------------------
           * 4.8 RETURN REVISION RESULT
           * -----------------------------------------------------
           */
          return {
            type: "REVISION" as const,

            paper: updatedPaper,

            manuscriptId:
              paper.manuscriptId,
          };
        }

        /*
         * =======================================================
         * 5. NORMAL NEW SUBMISSION
         * =======================================================
         *
         * Existing normal-submission behavior.
         */
        const initials =
          generateContributorInitials(
            contributors
          );

        if (!initials) {
          throw new Error(
            "Unable to generate contributor initials"
          );
        }

        const now = new Date();

        const sequenceId = 1;

        let sequence =
          await tx.manuscriptSequence.findUnique({
            where: {
              id: sequenceId,
            },
          });

        if (!sequence) {
          sequence =
            await tx.manuscriptSequence.create({
              data: {
                id: sequenceId,
                nextValue: 970,
              },
            });
        }

        const sequenceNumber =
          sequence.nextValue;

        const manuscriptId =
          generateManuscriptId(
            now,
            initials,
            sequenceNumber
          );

        /*
         * -------------------------------------------------------
         * 5.1 CREATE NEW PAPER
         * -------------------------------------------------------
         */
        const paper =
          await tx.paper.create({
            data: {
              manuscriptId,

              authors:
                draft.contributors,

              title:
                draft.title.trim(),

              abstract:
                draft.abstract.trim(),

              keywords:
                draft.keywords.trim(),

              reviewerSuggestions:
                draft.reviewerSuggestions,

              pdfPath:
                draft.mainFilePath,

              createdById:
                req.user!.id,
            },
          });

        /*
         * -------------------------------------------------------
         * 5.2 MARK NORMAL DRAFT AS SUBMITTED
         * -------------------------------------------------------
         */
        await tx.submissionDraft.update({
          where: {
            id: draft.id,
          },
          data: {
            status: "SUBMITTED",
          },
        });

        /*
         * -------------------------------------------------------
         * 5.3 INCREMENT MANUSCRIPT SEQUENCE
         * -------------------------------------------------------
         */
        await tx.manuscriptSequence.update({
          where: {
            id: sequenceId,
          },
          data: {
            nextValue:
              sequenceNumber + 1,
          },
        });

        return {
          type:
            "NEW_SUBMISSION" as const,

          paper,

          manuscriptId,
        };
      }
    );

    /*
     * =========================================================
     * 6. RESPONSE
     * =========================================================
     */

    if (
      result.type === "REVISION"
    ) {
      return res.status(200).json({
        message:
          "Manuscript revision submitted successfully",

        manuscriptId:
          result.manuscriptId,

        paper: {
          id:
            result.paper.id,

          manuscriptId:
            result.paper.manuscriptId,

          title:
            result.paper.title,
        },
      });
    }

    /*
     * Normal new manuscript submission
     */
    return res.status(201).json({
      message:
        "Manuscript submitted successfully",

      manuscriptId:
        result.manuscriptId,

      paper: {
        id:
          result.paper.id,

        manuscriptId:
          result.paper.manuscriptId,

        title:
          result.paper.title,
      },
    });
  } catch (error) {
    console.error(
      "submitSubmissionDraft error:",
      error
    );

    if (
      error instanceof Error &&
      !("code" in error)
    ) {
      return sendError(
        res,
        400,
        error.message
      );
    }

    return handlePrismaError(
      res,
      error
    );
  }
};