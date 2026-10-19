"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPaperReviewRequests = exports.createReviewRequest = void 0;
const crypto_1 = require("crypto");
const prisma_1 = __importDefault(require("../prisma"));
const error_1 = require("../utils/error");
const email_service_1 = require("../services/email.service");
// ============================================
// 1. Editor invites a reviewer
// POST /api/editor/review-requests
// ============================================
const createReviewRequest = async (req, res) => {
    try {
        const editorId = req.user?.id;
        // ============================================
        // Check authentication
        // ============================================
        if (!editorId) {
            return (0, error_1.sendError)(res, 401, "Unauthorized");
        }
        const { paperId, reviewerId, dueDate, } = req.body;
        // ============================================
        // Validate paper ID
        // ============================================
        if (!paperId ||
            typeof paperId !== "string" ||
            paperId.trim() === "") {
            return (0, error_1.sendError)(res, 400, "Paper ID is required");
        }
        // ============================================
        // Validate reviewer ID
        // ============================================
        if (!reviewerId ||
            typeof reviewerId !== "string" ||
            reviewerId.trim() === "") {
            return (0, error_1.sendError)(res, 400, "Reviewer ID is required");
        }
        // ============================================
        // Validate due date if provided
        // ============================================
        let parsedDueDate = null;
        if (dueDate) {
            parsedDueDate = new Date(dueDate);
            if (isNaN(parsedDueDate.getTime())) {
                return (0, error_1.sendError)(res, 400, "Invalid due date");
            }
        }
        // ============================================
        // Check paper belongs to logged-in editor
        // ============================================
        const paper = await prisma_1.default.paper.findUnique({
            where: {
                id: paperId,
            },
        });
        if (!paper) {
            return (0, error_1.sendError)(res, 404, "Paper not found");
        }
        // ============================================
        // Check reviewer exists and has REVIEWER role
        // ============================================
        const reviewer = await prisma_1.default.user.findFirst({
            where: {
                id: reviewerId,
                role: "REVIEWER",
            },
        });
        if (!reviewer) {
            return (0, error_1.sendError)(res, 404, "Reviewer not found");
        }
        // ============================================
        // Prevent author from reviewing their own paper
        // ============================================
        if (reviewer.id === paper.createdById) {
            return (0, error_1.sendError)(res, 400, "The author of this manuscript cannot be invited as a reviewer");
        }
        // ============================================
        // Check if reviewer is already invited
        // ============================================
        const existingRequest = await prisma_1.default.reviewRequest.findUnique({
            where: {
                paperId_reviewerId: {
                    paperId,
                    reviewerId,
                },
            },
        });
        if (existingRequest) {
            return (0, error_1.sendError)(res, 409, "Review request already exists");
        }
        // ============================================
        // Generate secure token
        // ============================================
        const tokenHash = (0, crypto_1.randomBytes)(32).toString("hex");
        // ============================================
        // Create review request
        // ============================================
        const reviewRequest = await prisma_1.default.reviewRequest.create({
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
        await (0, email_service_1.sendReviewerInvitationEmail)({
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
            message: "Reviewer invited successfully",
            reviewRequest,
        });
    }
    catch (error) {
        console.error(error);
        return (0, error_1.handlePrismaError)(res, error);
    }
};
exports.createReviewRequest = createReviewRequest;
// ============================================
// 2. Editor gets review requests for a paper
// GET /api/editor/papers/:paperId/review-requests
// ============================================
const getPaperReviewRequests = async (req, res) => {
    try {
        const editorId = req.user?.id;
        const { paperId } = req.params;
        // ============================================
        // Check authentication
        // ============================================
        if (!editorId) {
            return (0, error_1.sendError)(res, 401, "Unauthorized");
        }
        // ============================================
        // Validate paper ID
        // ============================================
        if (!paperId ||
            typeof paperId !== "string" ||
            paperId.trim() === "") {
            return (0, error_1.sendError)(res, 400, "Paper ID is required");
        }
        // ============================================
        // Check paper belongs to logged-in editor
        // ============================================
        const paper = await prisma_1.default.paper.findFirst({
            where: {
                id: paperId,
                createdById: editorId,
            },
        });
        if (!paper) {
            return (0, error_1.sendError)(res, 404, "Paper not found");
        }
        // ============================================
        // Get all review requests
        // ============================================
        const reviewRequests = await prisma_1.default.reviewRequest.findMany({
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
    }
    catch (error) {
        return (0, error_1.handlePrismaError)(res, error);
    }
};
exports.getPaperReviewRequests = getPaperReviewRequests;
