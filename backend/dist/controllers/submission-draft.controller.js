"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitSubmissionDraft = exports.deleteDraft = exports.updateDraft = exports.getDraftById = exports.getMySubmissions = exports.getMyDrafts = exports.getCurrentDraft = exports.createDraft = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const error_1 = require("../utils/error");
const manuscript_id_1 = require("../utils/manuscript-id");
const contributor_initials_1 = require("../utils/contributor-initials");
const createDraft = async (req, res) => {
    try {
        if (!req.user) {
            return (0, error_1.sendError)(res, 401, "Authentication required");
        }
        const { revisionRequestId } = req.body;
        /*
         * NORMAL NEW SUBMISSION
         */
        if (!revisionRequestId) {
            const draft = await prisma_1.default.submissionDraft.create({
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
        const revisionRequest = await prisma_1.default.revisionRequest.findFirst({
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
            return (0, error_1.sendError)(res, 404, "Revision request not found or is no longer available");
        }
        /*
         * Prevent creating multiple active drafts
         * for the same revision request.
         */
        const existingRevisionDraft = await prisma_1.default.submissionDraft.findFirst({
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
        const draft = await prisma_1.default.submissionDraft.create({
            data: {
                authorId: req.user.id,
                revisionRequestId: revisionRequest.id,
                manuscriptId: revisionRequest.paper.manuscriptId,
                title: revisionRequest.paper.title,
                abstract: revisionRequest.paper.abstract,
                keywords: revisionRequest.paper.keywords,
                contributors: revisionRequest.paper.authors,
                currentStep: 2,
            },
        });
        return res.status(201).json({
            message: "Revision submission draft created successfully",
            draft,
        });
    }
    catch (error) {
        console.error("createDraft error:", error);
        return (0, error_1.handlePrismaError)(res, error);
    }
};
exports.createDraft = createDraft;
/**
 * GET LATEST DRAFT OF LOGGED-IN AUTHOR
 * GET /api/author/drafts/current
 */
const getCurrentDraft = async (req, res) => {
    try {
        if (!req.user) {
            return (0, error_1.sendError)(res, 401, "Authentication required");
        }
        const draft = await prisma_1.default.submissionDraft.findFirst({
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
    }
    catch (error) {
        console.error("getCurrentDraft error:", error);
        return (0, error_1.handlePrismaError)(res, error);
    }
};
exports.getCurrentDraft = getCurrentDraft;
/**
 * GET ALL DRAFTS OF LOGGED-IN AUTHOR
 * GET /api/author/drafts
 */
const getMyDrafts = async (req, res) => {
    try {
        if (!req.user) {
            return (0, error_1.sendError)(res, 401, "Authentication required");
        }
        const drafts = await prisma_1.default.submissionDraft.findMany({
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
    }
    catch (error) {
        console.error("getMyDrafts error:", error);
        return (0, error_1.handlePrismaError)(res, error);
    }
};
exports.getMyDrafts = getMyDrafts;
/**
 * GET ALL SUBMITTED MANUSCRIPTS OF LOGGED-IN AUTHOR
 * GET /api/author/submissions
 */
const getMySubmissions = async (req, res) => {
    try {
        if (!req.user) {
            return (0, error_1.sendError)(res, 401, "Authentication required");
        }
        const papers = await prisma_1.default.paper.findMany({
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
    }
    catch (error) {
        console.error("getMySubmissions error:", error);
        return (0, error_1.handlePrismaError)(res, error);
    }
};
exports.getMySubmissions = getMySubmissions;
/**
 * GET SINGLE DRAFT
 * GET /api/author/drafts/:id
 */
const getDraftById = async (req, res) => {
    try {
        if (!req.user) {
            return (0, error_1.sendError)(res, 401, "Authentication required");
        }
        const id = String(req.params.id);
        const draft = await prisma_1.default.submissionDraft.findFirst({
            where: {
                id,
                authorId: req.user.id,
            },
        });
        if (!draft) {
            return (0, error_1.sendError)(res, 404, "Submission draft not found");
        }
        return res.json({
            draft,
        });
    }
    catch (error) {
        console.error("getDraftById error:", error);
        return (0, error_1.handlePrismaError)(res, error);
    }
};
exports.getDraftById = getDraftById;
/**
 * UPDATE / SAVE DRAFT
 * PATCH /api/author/drafts/:id
 */
const updateDraft = async (req, res) => {
    try {
        if (!req.user) {
            return (0, error_1.sendError)(res, 401, "Authentication required");
        }
        const id = String(req.params.id);
        const existingDraft = await prisma_1.default.submissionDraft.findFirst({
            where: {
                id,
                authorId: req.user.id,
            },
        });
        if (!existingDraft) {
            return (0, error_1.sendError)(res, 404, "Submission draft not found");
        }
        const { manuscriptId, title, abstract, keywords, mainFilePath, supplementaryFilePath, contributors, editorMessage, conflictOfInterest, reviewerSuggestions, currentStep, revisionRequestId, } = req.body;
        const updateData = {};
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
                const revisionRequest = await prisma_1.default.revisionRequest.findFirst({
                    where: {
                        id: String(revisionRequestId),
                        authorId: req.user.id,
                    },
                });
                if (!revisionRequest) {
                    return (0, error_1.sendError)(res, 404, "Revision request not found");
                }
                updateData.revisionRequestId =
                    revisionRequest.id;
            }
            else {
                updateData.revisionRequestId = null;
            }
        }
        if (currentStep !== undefined) {
            const step = Number(currentStep);
            if (!Number.isInteger(step) || step < 1 || step > 6) {
                return (0, error_1.sendError)(res, 400, "Current step must be between 1 and 6");
            }
            updateData.currentStep = step;
        }
        const draft = await prisma_1.default.submissionDraft.update({
            where: {
                id,
            },
            data: updateData,
        });
        return res.json({
            message: "Submission draft saved successfully",
            draft,
        });
    }
    catch (error) {
        console.error("updateDraft error:", error);
        return (0, error_1.handlePrismaError)(res, error);
    }
};
exports.updateDraft = updateDraft;
/**
 * DELETE DRAFT
 * DELETE /api/author/drafts/:id
 */
const deleteDraft = async (req, res) => {
    try {
        if (!req.user) {
            return (0, error_1.sendError)(res, 401, "Authentication required");
        }
        const id = String(req.params.id);
        const existingDraft = await prisma_1.default.submissionDraft.findFirst({
            where: {
                id,
                authorId: req.user.id,
            },
        });
        if (!existingDraft) {
            return (0, error_1.sendError)(res, 404, "Submission draft not found");
        }
        await prisma_1.default.submissionDraft.delete({
            where: {
                id,
            },
        });
        return res.json({
            message: "Submission draft deleted successfully",
        });
    }
    catch (error) {
        console.error("deleteDraft error:", error);
        return (0, error_1.handlePrismaError)(res, error);
    }
};
exports.deleteDraft = deleteDraft;
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
const submitSubmissionDraft = async (req, res) => {
    try {
        if (!req.user) {
            return (0, error_1.sendError)(res, 401, "Authentication required");
        }
        const draftId = String(req.params.id);
        const result = await prisma_1.default.$transaction(async (tx) => {
            /*
             * -------------------------------------------------------
             * 1. FIND AUTHOR'S DRAFT
             * -------------------------------------------------------
             */
            const draft = await tx.submissionDraft.findFirst({
                where: {
                    id: draftId,
                    authorId: req.user.id,
                    status: "DRAFT",
                },
            });
            if (!draft) {
                throw new Error("Submission draft not found");
            }
            /*
             * -------------------------------------------------------
             * 2. COMMON VALIDATION
             * -------------------------------------------------------
             */
            if (!draft.title?.trim()) {
                throw new Error("Manuscript title is required");
            }
            if (!draft.abstract?.trim()) {
                throw new Error("Manuscript abstract is required");
            }
            if (!draft.keywords?.trim()) {
                throw new Error("At least one keyword is required");
            }
            if (!draft.mainFilePath) {
                throw new Error("Main manuscript file is required");
            }
            if (!draft.contributors?.trim()) {
                throw new Error("At least one contributor is required");
            }
            /*
             * -------------------------------------------------------
             * 3. VALIDATE CONTRIBUTORS
             * -------------------------------------------------------
             */
            let contributors;
            try {
                contributors = JSON.parse(draft.contributors);
            }
            catch {
                throw new Error("Invalid contributor information");
            }
            const hasInvalidContributor = contributors.some((contributor) => !contributor.name?.trim() ||
                !contributor.email?.trim());
            if (hasInvalidContributor) {
                throw new Error("Please complete all required contributor information");
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
                const revisionRequest = await tx.revisionRequest.findFirst({
                    where: {
                        id: draft.revisionRequestId,
                        authorId: req.user.id,
                    },
                    include: {
                        paper: true,
                    },
                });
                if (!revisionRequest) {
                    throw new Error("Revision request not found");
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
                    throw new Error("Please acknowledge the revision request before submitting the revised manuscript");
                }
                /*
                 * -----------------------------------------------------
                 * 4.3 FIND EXISTING PAPER
                 * -----------------------------------------------------
                 */
                const paper = revisionRequest.paper;
                if (!paper) {
                    throw new Error("Original manuscript not found");
                }
                /*
                 * Security check:
                 * The paper must belong to the logged-in author.
                 */
                if (paper.createdById !==
                    req.user.id) {
                    throw new Error("You are not authorized to submit this revision");
                }
                /*
                 * -----------------------------------------------------
                 * 4.4 DETERMINE RECEIVED REVISION STATUS
                 * -----------------------------------------------------
                 */
                const receivedDecision = revisionRequest.revisionType ===
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
                const updatedPaper = await tx.paper.update({
                    where: {
                        id: paper.id,
                    },
                    data: {
                        pdfPath: draft.mainFilePath,
                        editorialDecision: receivedDecision,
                        decisionAt: new Date(),
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
                        submittedAt: new Date(),
                        revisionFilePath: draft.mainFilePath,
                        revisionFileName: draft.mainFileName ??
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
                    type: "REVISION",
                    paper: updatedPaper,
                    manuscriptId: paper.manuscriptId,
                };
            }
            /*
             * =======================================================
             * 5. NORMAL NEW SUBMISSION
             * =======================================================
             *
             * Existing normal-submission behavior.
             */
            const initials = (0, contributor_initials_1.generateContributorInitials)(contributors);
            if (!initials) {
                throw new Error("Unable to generate contributor initials");
            }
            const now = new Date();
            const sequenceId = 1;
            let sequence = await tx.manuscriptSequence.findUnique({
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
            const sequenceNumber = sequence.nextValue;
            const manuscriptId = (0, manuscript_id_1.generateManuscriptId)(now, initials, sequenceNumber);
            /*
             * -------------------------------------------------------
             * 5.1 CREATE NEW PAPER
             * -------------------------------------------------------
             */
            const paper = await tx.paper.create({
                data: {
                    manuscriptId,
                    authors: draft.contributors,
                    title: draft.title.trim(),
                    abstract: draft.abstract.trim(),
                    keywords: draft.keywords.trim(),
                    reviewerSuggestions: draft.reviewerSuggestions,
                    pdfPath: draft.mainFilePath,
                    createdById: req.user.id,
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
                    nextValue: sequenceNumber + 1,
                },
            });
            return {
                type: "NEW_SUBMISSION",
                paper,
                manuscriptId,
            };
        });
        /*
         * =========================================================
         * 6. RESPONSE
         * =========================================================
         */
        if (result.type === "REVISION") {
            return res.status(200).json({
                message: "Manuscript revision submitted successfully",
                manuscriptId: result.manuscriptId,
                paper: {
                    id: result.paper.id,
                    manuscriptId: result.paper.manuscriptId,
                    title: result.paper.title,
                },
            });
        }
        /*
         * Normal new manuscript submission
         */
        return res.status(201).json({
            message: "Manuscript submitted successfully",
            manuscriptId: result.manuscriptId,
            paper: {
                id: result.paper.id,
                manuscriptId: result.paper.manuscriptId,
                title: result.paper.title,
            },
        });
    }
    catch (error) {
        console.error("submitSubmissionDraft error:", error);
        if (error instanceof Error &&
            !("code" in error)) {
            return (0, error_1.sendError)(res, 400, error.message);
        }
        return (0, error_1.handlePrismaError)(res, error);
    }
};
exports.submitSubmissionDraft = submitSubmissionDraft;
