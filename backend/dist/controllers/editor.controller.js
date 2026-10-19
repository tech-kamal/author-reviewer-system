"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReviewDetails = exports.getPaperReviews = exports.makeFinalDecision = exports.deletePaper = exports.updatePaper = exports.getReviewers = exports.getPaperById = exports.getMyPapers = exports.createPaper = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const error_1 = require("../utils/error");
// =====================================================
// CREATE / UPLOAD PAPER
// POST /api/editor/papers
// =====================================================
const createPaper = async (req, res) => {
    try {
        console.log("========== CREATE PAPER ==========");
        // ---------------------------------------------
        // 1. Authentication check
        // ---------------------------------------------
        const userId = req.user?.id;
        if (!userId) {
            return (0, error_1.sendError)(res, 401, "Unauthorized");
        }
        // ---------------------------------------------
        // 2. Get form fields
        // ---------------------------------------------
        const { manuscriptId, authors, title, abstract, keywords, } = req.body;
        // ---------------------------------------------
        // 3. Manuscript ID validation
        // ---------------------------------------------
        if (!manuscriptId ||
            typeof manuscriptId !== "string" ||
            manuscriptId.trim() === "") {
            return (0, error_1.sendError)(res, 400, "Manuscript ID is required");
        }
        // ---------------------------------------------
        // 4. Author(s) validation
        // ---------------------------------------------
        if (!authors ||
            typeof authors !== "string" ||
            authors.trim() === "") {
            return (0, error_1.sendError)(res, 400, "Author(s) name is required");
        }
        // ---------------------------------------------
        // 5. Check duplicate Manuscript ID
        // ---------------------------------------------
        const existingPaper = await prisma_1.default.paper.findUnique({
            where: {
                manuscriptId: manuscriptId.trim(),
            },
        });
        if (existingPaper) {
            return (0, error_1.sendError)(res, 409, "Manuscript ID already exists");
        }
        // ---------------------------------------------
        // 6. Title validation
        // ---------------------------------------------
        if (!title ||
            typeof title !== "string" ||
            title.trim() === "") {
            return (0, error_1.sendError)(res, 400, "Paper title is required");
        }
        // ---------------------------------------------
        // 7. PDF validation
        // ---------------------------------------------
        if (!req.file) {
            return (0, error_1.sendError)(res, 400, "PDF file is required");
        }
        // ---------------------------------------------
        // 8. Create paper in database
        // ---------------------------------------------
        const paper = await prisma_1.default.paper.create({
            data: {
                manuscriptId: manuscriptId.trim(),
                authors: authors.trim(),
                title: title.trim(),
                abstract: abstract &&
                    typeof abstract === "string" &&
                    abstract.trim() !== ""
                    ? abstract.trim()
                    : null,
                keywords: keywords &&
                    typeof keywords === "string" &&
                    keywords.trim() !== ""
                    ? keywords.trim()
                    : null,
                pdfPath: `/uploads/papers/${req.file.filename}`,
                createdById: userId,
            },
        });
        // ---------------------------------------------
        // 9. Success response
        // ---------------------------------------------
        console.log("PAPER CREATED:", paper);
        return res.status(201).json({
            success: true,
            message: "Paper uploaded successfully",
            paper,
        });
    }
    catch (error) {
        console.error("========== CREATE PAPER ERROR ==========");
        console.error(error);
        return (0, error_1.handlePrismaError)(res, error);
    }
};
exports.createPaper = createPaper;
// =====================================================
// GET MY PAPERS
// GET /api/editor/papers
// =====================================================
const getMyPapers = async (req, res) => {
    try {
        console.log("========== GET MY PAPERS ==========");
        const userId = req.user?.id;
        // ---------------------------------------------
        // 1. Authentication check
        // ---------------------------------------------
        if (!userId) {
            return (0, error_1.sendError)(res, 401, "Unauthorized");
        }
        // ---------------------------------------------
        // 2. Get papers created by this editor
        // ---------------------------------------------
        const papers = await prisma_1.default.paper.findMany({
            where: {
                OR: [
                    // Papers uploaded directly by this editor
                    {
                        createdById: userId,
                    },
                    // Manuscripts submitted through Author workspace
                    {
                        createdBy: {
                            role: "REVIEWER",
                        },
                    },
                ],
            },
            include: {
                reviewRequests: {
                    select: {
                        id: true,
                        status: true,
                        invitedAt: true,
                        dueDate: true,
                        respondedAt: true,
                        reviewer: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });
        // ---------------------------------------------
        // 3. Success response
        // ---------------------------------------------
        return res.status(200).json({
            success: true,
            papers,
        });
    }
    catch (error) {
        console.error("========== GET PAPERS ERROR ==========");
        console.error(error);
        return (0, error_1.handlePrismaError)(res, error);
    }
};
exports.getMyPapers = getMyPapers;
// =====================================================
// GET SINGLE PAPER
// GET /api/editor/papers/:id
// =====================================================
const getPaperById = async (req, res) => {
    try {
        console.log("========== GET PAPER BY ID ==========");
        const userId = req.user?.id;
        const rawId = req.params.id;
        // ---------------------------------------------
        // 1. Authentication check
        // ---------------------------------------------
        if (!userId) {
            return (0, error_1.sendError)(res, 401, "Unauthorized");
        }
        // ---------------------------------------------
        // 2. Validate paper ID
        // ---------------------------------------------
        if (!rawId ||
            typeof rawId !== "string" ||
            rawId.trim() === "") {
            return (0, error_1.sendError)(res, 400, "Paper ID is required");
        }
        const id = rawId.trim();
        // ---------------------------------------------
        // 3. Find paper owned by editor
        // ---------------------------------------------
        const paper = await prisma_1.default.paper.findFirst({
            where: {
                id,
                OR: [
                    // Paper uploaded by this editor
                    {
                        createdById: userId,
                    },
                    // Manuscript submitted through Author workspace
                    {
                        createdBy: {
                            role: "REVIEWER",
                        },
                    },
                ],
            },
            include: {
                reviewRequests: {
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
                        invitedAt: "desc",
                    },
                },
            },
        });
        // ---------------------------------------------
        // 4. Paper not found
        // ---------------------------------------------
        if (!paper) {
            return (0, error_1.sendError)(res, 404, "Paper not found");
        }
        // ---------------------------------------------
        // 5. Success response
        // ---------------------------------------------
        return res.status(200).json({
            success: true,
            paper,
        });
    }
    catch (error) {
        console.error("========== GET PAPER ERROR ==========");
        console.error(error);
        return (0, error_1.handlePrismaError)(res, error);
    }
};
exports.getPaperById = getPaperById;
// =====================================================
// GET ALL REVIEWERS
// GET /api/editor/reviewers
// =====================================================
const getReviewers = async (req, res) => {
    try {
        const userId = req.user?.id;
        // ---------------------------------------------
        // 1. Authentication check
        // ---------------------------------------------
        if (!userId) {
            return (0, error_1.sendError)(res, 401, "Unauthorized");
        }
        // ---------------------------------------------
        // 2. Get reviewers
        // ---------------------------------------------
        const reviewers = await prisma_1.default.user.findMany({
            where: {
                role: "REVIEWER",
            },
            select: {
                id: true,
                name: true,
                email: true,
            },
            orderBy: {
                name: "asc",
            },
        });
        // ---------------------------------------------
        // 3. Success response
        // ---------------------------------------------
        return res.status(200).json({
            success: true,
            reviewers,
        });
    }
    catch (error) {
        console.error("========== GET REVIEWERS ERROR ==========");
        console.error(error);
        return (0, error_1.handlePrismaError)(res, error);
    }
};
exports.getReviewers = getReviewers;
// =====================================================
// UPDATE PAPER
// PATCH /api/editor/papers/:id
// =====================================================
const updatePaper = async (req, res) => {
    try {
        console.log("========== UPDATE PAPER ==========");
        const userId = req.user?.id;
        const { id } = req.params;
        // ---------------------------------------------
        // 1. Authentication check
        // ---------------------------------------------
        if (!userId) {
            return (0, error_1.sendError)(res, 401, "Unauthorized");
        }
        // ---------------------------------------------
        // 2. Validate paper ID
        // ---------------------------------------------
        if (!id ||
            typeof id !== "string" ||
            id.trim() === "") {
            return (0, error_1.sendError)(res, 400, "Paper ID is required");
        }
        const paperId = id.trim();
        // ---------------------------------------------
        // 3. Get form fields
        // ---------------------------------------------
        const { manuscriptId, authors, title, abstract, keywords, } = req.body;
        // ---------------------------------------------
        // 4. Manuscript ID validation
        // ---------------------------------------------
        if (!manuscriptId ||
            typeof manuscriptId !== "string" ||
            manuscriptId.trim() === "") {
            return (0, error_1.sendError)(res, 400, "Manuscript ID is required");
        }
        // ---------------------------------------------
        // 5. Author(s) validation
        // ---------------------------------------------
        if (!authors ||
            typeof authors !== "string" ||
            authors.trim() === "") {
            return (0, error_1.sendError)(res, 400, "Author(s) name is required");
        }
        // ---------------------------------------------
        // 6. Title validation
        // ---------------------------------------------
        if (!title ||
            typeof title !== "string" ||
            title.trim() === "") {
            return (0, error_1.sendError)(res, 400, "Paper title is required");
        }
        // ---------------------------------------------
        // 7. Find paper owned by logged-in editor
        // ---------------------------------------------
        const existingPaper = await prisma_1.default.paper.findFirst({
            where: {
                id: paperId,
                createdById: userId,
            },
        });
        // ---------------------------------------------
        // 8. Paper not found / ownership failed
        // ---------------------------------------------
        if (!existingPaper) {
            return (0, error_1.sendError)(res, 404, "Paper not found");
        }
        // ---------------------------------------------
        // 9. Check duplicate Manuscript ID
        // ---------------------------------------------
        const duplicatePaper = await prisma_1.default.paper.findFirst({
            where: {
                manuscriptId: manuscriptId.trim(),
                NOT: {
                    id: paperId,
                },
            },
        });
        if (duplicatePaper) {
            return (0, error_1.sendError)(res, 409, "Manuscript ID already exists");
        }
        // ---------------------------------------------
        // 10. Prepare update data
        // ---------------------------------------------
        const updateData = {
            manuscriptId: manuscriptId.trim(),
            authors: authors.trim(),
            title: title.trim(),
            abstract: abstract &&
                typeof abstract === "string" &&
                abstract.trim() !== ""
                ? abstract.trim()
                : null,
            keywords: keywords &&
                typeof keywords === "string" &&
                keywords.trim() !== ""
                ? keywords.trim()
                : null,
        };
        // ---------------------------------------------
        // 11. Replace PDF only if new PDF uploaded
        // ---------------------------------------------
        if (req.file) {
            updateData.pdfPath =
                `/uploads/papers/${req.file.filename}`;
        }
        // ---------------------------------------------
        // 12. Update paper
        // ---------------------------------------------
        const updatedPaper = await prisma_1.default.paper.update({
            where: {
                id: existingPaper.id,
            },
            data: updateData,
        });
        // ---------------------------------------------
        // 13. Success response
        // ---------------------------------------------
        console.log("PAPER UPDATED:", updatedPaper);
        return res.status(200).json({
            success: true,
            message: "Paper updated successfully",
            paper: updatedPaper,
        });
    }
    catch (error) {
        console.error("========== UPDATE PAPER ERROR ==========");
        console.error(error);
        return (0, error_1.handlePrismaError)(res, error);
    }
};
exports.updatePaper = updatePaper;
// =====================================================
// DELETE PAPER
// DELETE /api/editor/papers/:id
// =====================================================
const deletePaper = async (req, res) => {
    try {
        console.log("========== DELETE PAPER ==========");
        const userId = req.user?.id;
        const { id } = req.params;
        // ---------------------------------------------
        // 1. Authentication check
        // ---------------------------------------------
        if (!userId) {
            return (0, error_1.sendError)(res, 401, "Unauthorized");
        }
        // ---------------------------------------------
        // 2. Validate paper ID
        // ---------------------------------------------
        if (!id ||
            typeof id !== "string" ||
            id.trim() === "") {
            return (0, error_1.sendError)(res, 400, "Paper ID is required");
        }
        const paperId = id.trim();
        // ---------------------------------------------
        // 3. Find paper owned by logged-in editor
        // ---------------------------------------------
        const paper = await prisma_1.default.paper.findFirst({
            where: {
                id: paperId,
                createdById: userId,
            },
        });
        // ---------------------------------------------
        // 4. Paper not found / ownership failed
        // ---------------------------------------------
        if (!paper) {
            return (0, error_1.sendError)(res, 404, "Paper not found");
        }
        // ---------------------------------------------
        // 5. Delete paper
        //
        // Related ReviewRequests and Reviews are
        // removed through Prisma relation cascade.
        // ---------------------------------------------
        await prisma_1.default.paper.delete({
            where: {
                id: paper.id,
            },
        });
        // ---------------------------------------------
        // 6. Success response
        // ---------------------------------------------
        console.log("PAPER DELETED:", paper.id);
        return res.status(200).json({
            success: true,
            message: "Paper deleted successfully",
        });
    }
    catch (error) {
        console.error("========== DELETE PAPER ERROR ==========");
        console.error(error);
        return (0, error_1.handlePrismaError)(res, error);
    }
};
exports.deletePaper = deletePaper;
// =====================================================
// EDITOR MAKES FINAL DECISION
// PATCH /api/editor/papers/:paperId/decision
// =====================================================
const makeFinalDecision = async (req, res) => {
    try {
        const editorId = req.user?.id;
        const rawPaperId = req.params.paperId;
        const { decision } = req.body;
        // ---------------------------------------------
        // 1. Authentication check
        // ---------------------------------------------
        if (!editorId) {
            return (0, error_1.sendError)(res, 401, "Unauthorized");
        }
        // ---------------------------------------------
        // 2. Validate paper ID
        // ---------------------------------------------
        if (!rawPaperId ||
            typeof rawPaperId !== "string" ||
            rawPaperId.trim() === "") {
            return (0, error_1.sendError)(res, 400, "Paper ID is required");
        }
        const paperId = rawPaperId.trim();
        // ---------------------------------------------
        // 3. Validate decision
        // ---------------------------------------------
        const allowedDecisions = [
            "Submitted_To_Journal",
            "With_Editor",
            "Technical_Check",
            "Awaiting_Reviewer",
            "Under_Review",
            "MAJOR_REVISION",
            "MINOR_REVISION",
            "RECEIVED_MAJOR_REVISION",
            "RECEIVED_MINOR_REVISION",
            "ACCEPTED_FOR_PUBLICATION",
            "Under_Production",
            "GALLEY_PROOFS",
            "AUTHOR_CORRECTIONS_GALLEY_PROOFS",
            "FINAL_PUBLISHED_VERSION",
            "WITHDRAW",
        ];
        if (!decision ||
            !allowedDecisions.includes(decision)) {
            return (0, error_1.sendError)(res, 400, `Invalid decision. Allowed values are: ${allowedDecisions.join(", ")}`);
        }
        // ---------------------------------------------
        // 4. Find paper owned by editor
        // ---------------------------------------------
        const paper = await prisma_1.default.paper.findFirst({
            where: {
                id: paperId,
                OR: [
                    {
                        createdById: editorId,
                    },
                    {
                        createdBy: {
                            role: "REVIEWER",
                        },
                    },
                ],
            },
            include: {
                reviewRequests: {
                    where: {
                        status: "REVIEW_SUBMITTED",
                    },
                },
            },
        });
        // ---------------------------------------------
        // 5. Paper not found
        // ---------------------------------------------
        if (!paper) {
            return (0, error_1.sendError)(res, 404, "Paper not found");
        }
        // ---------------------------------------------
        // 6. Check submitted review
        // ---------------------------------------------
        if (paper.reviewRequests.length === 0) {
            return (0, error_1.sendError)(res, 400, "Final decision cannot be made because no review has been submitted");
        }
        // ---------------------------------------------
        // 7. Save final decision
        // ---------------------------------------------
        const updatedPaper = await prisma_1.default.paper.update({
            where: {
                id: paper.id,
            },
            data: {
                editorialDecision: decision,
                decisionAt: new Date(),
            },
            select: {
                id: true,
                title: true,
                editorialDecision: true,
                decisionAt: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        // ---------------------------------------------
        // 8. Success response
        // ---------------------------------------------
        return res.status(200).json({
            success: true,
            message: "Final decision saved successfully",
            paper: updatedPaper,
        });
    }
    catch (error) {
        console.error("========== MAKE FINAL DECISION ERROR ==========");
        console.error(error);
        return (0, error_1.handlePrismaError)(res, error);
    }
};
exports.makeFinalDecision = makeFinalDecision;
// =====================================================
// GET SUBMITTED REVIEWS FOR A PAPER
// GET /api/editor/papers/:paperId/reviews
// =====================================================
const getPaperReviews = async (req, res) => {
    try {
        const editorId = req.user?.id;
        const rawPaperId = req.params.paperId;
        // ---------------------------------------------
        // 1. Authentication check
        // ---------------------------------------------
        if (!editorId) {
            return (0, error_1.sendError)(res, 401, "Unauthorized");
        }
        // ---------------------------------------------
        // 2. Validate paper ID
        // ---------------------------------------------
        if (!rawPaperId ||
            typeof rawPaperId !== "string" ||
            rawPaperId.trim() === "") {
            return (0, error_1.sendError)(res, 400, "Paper ID is required");
        }
        const paperId = rawPaperId.trim();
        // ---------------------------------------------
        // 3. Check paper belongs to editor
        // ---------------------------------------------
        const paper = await prisma_1.default.paper.findFirst({
            where: {
                id: paperId,
                OR: [
                    {
                        createdById: editorId,
                    },
                    {
                        createdBy: {
                            role: "REVIEWER",
                        },
                    },
                ],
            },
            select: {
                id: true,
                manuscriptId: true,
                authors: true,
                title: true,
            },
        });
        // ---------------------------------------------
        // 4. Paper not found
        // ---------------------------------------------
        if (!paper) {
            return (0, error_1.sendError)(res, 404, "Paper not found");
        }
        // ---------------------------------------------
        // 5. Get submitted reviews
        // ---------------------------------------------
        const reviewRequests = await prisma_1.default.reviewRequest.findMany({
            where: {
                paperId,
                status: "REVIEW_SUBMITTED",
            },
            select: {
                id: true,
                status: true,
                invitedAt: true,
                respondedAt: true,
                dueDate: true,
                reviewer: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                review: {
                    select: {
                        id: true,
                        recommendation: true,
                        commentsToAuthor: true,
                        commentsToEditor: true,
                        submittedAt: true,
                    },
                },
            },
            orderBy: {
                respondedAt: "desc",
            },
        });
        // ---------------------------------------------
        // 6. Success response
        // ---------------------------------------------
        return res.status(200).json({
            success: true,
            paper,
            reviewRequests,
        });
    }
    catch (error) {
        console.error("========== GET PAPER REVIEWS ERROR ==========");
        console.error(error);
        return (0, error_1.handlePrismaError)(res, error);
    }
};
exports.getPaperReviews = getPaperReviews;
// =====================================================
// GET SINGLE REVIEW DETAILS
// GET /api/editor/reviews/:reviewRequestId
// =====================================================
const getReviewDetails = async (req, res) => {
    try {
        const editorId = req.user?.id;
        const rawReviewRequestId = req.params.reviewRequestId;
        // ---------------------------------------------
        // 1. Authentication check
        // ---------------------------------------------
        if (!editorId) {
            return (0, error_1.sendError)(res, 401, "Unauthorized");
        }
        // ---------------------------------------------
        // 2. Validate review request ID
        // ---------------------------------------------
        if (!rawReviewRequestId ||
            typeof rawReviewRequestId !== "string" ||
            rawReviewRequestId.trim() === "") {
            return (0, error_1.sendError)(res, 400, "Review request ID is required");
        }
        const reviewRequestId = rawReviewRequestId.trim();
        // ---------------------------------------------
        // 3. Find review request
        // ---------------------------------------------
        const reviewRequest = await prisma_1.default.reviewRequest.findUnique({
            where: {
                id: reviewRequestId,
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
                        createdById: true,
                    },
                },
                reviewer: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                review: true,
            },
        });
        // ---------------------------------------------
        // 4. Review request not found
        // ---------------------------------------------
        if (!reviewRequest) {
            return (0, error_1.sendError)(res, 404, "Review request not found");
        }
        // ---------------------------------------------
        // 5. Check paper ownership
        // ---------------------------------------------
        if (reviewRequest.paper.createdById !== editorId) {
            const paperOwner = await prisma_1.default.user.findUnique({
                where: {
                    id: reviewRequest.paper.createdById,
                },
                select: {
                    role: true,
                },
            });
            if (paperOwner?.role !== "REVIEWER") {
                return (0, error_1.sendError)(res, 403, "You are not allowed to view this review");
            }
        }
        // ---------------------------------------------
        // 6. Check review submitted
        // ---------------------------------------------
        if (reviewRequest.status !==
            "REVIEW_SUBMITTED") {
            return (0, error_1.sendError)(res, 400, `Review is not available because the current status is ${reviewRequest.status}`);
        }
        // ---------------------------------------------
        // 7. Check review exists
        // ---------------------------------------------
        if (!reviewRequest.review) {
            return (0, error_1.sendError)(res, 404, "Review not found");
        }
        // ---------------------------------------------
        // 8. Success response
        // ---------------------------------------------
        return res.status(200).json({
            success: true,
            reviewRequest: {
                id: reviewRequest.id,
                status: reviewRequest.status,
                invitedAt: reviewRequest.invitedAt,
                respondedAt: reviewRequest.respondedAt,
                dueDate: reviewRequest.dueDate,
            },
            paper: reviewRequest.paper,
            reviewer: reviewRequest.reviewer,
            review: reviewRequest.review,
        });
    }
    catch (error) {
        console.error("========== GET REVIEW DETAILS ERROR ==========");
        console.error(error);
        return (0, error_1.handlePrismaError)(res, error);
    }
};
exports.getReviewDetails = getReviewDetails;
