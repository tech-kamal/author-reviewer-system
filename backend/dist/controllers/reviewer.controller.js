"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMySubmittedReview = exports.submitReview = exports.declineReviewInvitationByToken = exports.acceptReviewInvitationByToken = exports.declineReviewRequest = exports.acceptReviewRequest = exports.getMyReviewRequests = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const error_1 = require("../utils/error");
// ============================================
// 1. Reviewer gets all assigned review requests
// GET /api/reviewer/review-requests
// ============================================
const getMyReviewRequests = async (req, res) => {
    try {
        const reviewerId = req.user?.id;
        // ============================================
        // Check authentication
        // ============================================
        if (!reviewerId) {
            return (0, error_1.sendError)(res, 401, "Unauthorized");
        }
        // ============================================
        // Get review requests assigned to reviewer
        // ============================================
        const reviewRequests = await prisma_1.default.reviewRequest.findMany({
            where: {
                reviewerId,
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
                        createdAt: true,
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
            reviewRequests,
        });
    }
    catch (error) {
        console.error("========== GET MY REVIEW REQUESTS ERROR ==========");
        console.error(error);
        return (0, error_1.handlePrismaError)(res, error);
    }
};
exports.getMyReviewRequests = getMyReviewRequests;
// ============================================
// 2. Reviewer accepts review request
// PATCH /api/reviewer/review-requests/:id/accept
// ============================================
const acceptReviewRequest = async (req, res) => {
    try {
        const reviewerId = req.user?.id;
        const { id } = req.params;
        // ============================================
        // Check authentication
        // ============================================
        if (!reviewerId) {
            return (0, error_1.sendError)(res, 401, "Unauthorized");
        }
        // ============================================
        // Validate request ID
        // ============================================
        if (!id ||
            typeof id !== "string" ||
            id.trim() === "") {
            return (0, error_1.sendError)(res, 400, "Review request ID is required");
        }
        // ============================================
        // Find review request
        // ============================================
        const reviewRequest = await prisma_1.default.reviewRequest.findFirst({
            where: {
                id,
                reviewerId,
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
                    },
                },
                review: true,
            },
        });
        // ============================================
        // Request not found
        // ============================================
        if (!reviewRequest) {
            return (0, error_1.sendError)(res, 404, "Review request not found");
        }
        // ============================================
        // Check current status
        // ============================================
        if (reviewRequest.status !== "INVITED") {
            return (0, error_1.sendError)(res, 400, `Review request cannot be accepted because its current status is ${reviewRequest.status}`);
        }
        // ============================================
        // Accept request
        // ============================================
        const updatedRequest = await prisma_1.default.reviewRequest.update({
            where: {
                id: reviewRequest.id,
            },
            data: {
                status: "ACCEPTED",
                respondedAt: new Date(),
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
                    },
                },
                review: true,
            },
        });
        // ============================================
        // Success response
        // ============================================
        return res.status(200).json({
            success: true,
            message: "Review request accepted successfully",
            reviewRequest: updatedRequest,
        });
    }
    catch (error) {
        console.error("========== ACCEPT REVIEW REQUEST ERROR ==========");
        console.error(error);
        return (0, error_1.handlePrismaError)(res, error);
    }
};
exports.acceptReviewRequest = acceptReviewRequest;
// ============================================
// 3. Reviewer declines review request
// PATCH /api/reviewer/review-requests/:id/decline
// ============================================
const declineReviewRequest = async (req, res) => {
    try {
        const reviewerId = req.user?.id;
        const { id } = req.params;
        const { declineReason, } = req.body;
        // ============================================
        // Check authentication
        // ============================================
        if (!reviewerId) {
            return (0, error_1.sendError)(res, 401, "Unauthorized");
        }
        // ============================================
        // Validate request ID
        // ============================================
        if (!id ||
            typeof id !== "string" ||
            id.trim() === "") {
            return (0, error_1.sendError)(res, 400, "Review request ID is required");
        }
        // ============================================
        // Find review request
        // ============================================
        const reviewRequest = await prisma_1.default.reviewRequest.findFirst({
            where: {
                id,
                reviewerId,
            },
        });
        // ============================================
        // Request not found
        // ============================================
        if (!reviewRequest) {
            return (0, error_1.sendError)(res, 404, "Review request not found");
        }
        // ============================================
        // Check current status
        // ============================================
        if (reviewRequest.status !== "INVITED") {
            return (0, error_1.sendError)(res, 400, `Review request cannot be declined because its current status is ${reviewRequest.status}`);
        }
        // ============================================
        // Validate decline reason if provided
        // ============================================
        if (declineReason !== undefined &&
            declineReason !== null &&
            typeof declineReason !== "string") {
            return (0, error_1.sendError)(res, 400, "Decline reason must be a string");
        }
        // ============================================
        // Decline request
        // ============================================
        const updatedRequest = await prisma_1.default.reviewRequest.update({
            where: {
                id: reviewRequest.id,
            },
            data: {
                status: "DECLINED",
                respondedAt: new Date(),
                declineReason: typeof declineReason === "string" &&
                    declineReason.trim() !== ""
                    ? declineReason.trim()
                    : null,
            },
            include: {
                paper: {
                    select: {
                        id: true,
                        manuscriptId: true,
                        authors: true,
                        title: true,
                    },
                },
                reviewer: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
        // ============================================
        // Success response
        // ============================================
        return res.status(200).json({
            success: true,
            message: "Review request declined successfully",
            reviewRequest: updatedRequest,
        });
    }
    catch (error) {
        console.error("========== DECLINE REVIEW REQUEST ERROR ==========");
        console.error(error);
        return (0, error_1.handlePrismaError)(res, error);
    }
};
exports.declineReviewRequest = declineReviewRequest;
// ============================================
// Accept review invitation using email token
// ============================================
const acceptReviewInvitationByToken = async (req, res) => {
    try {
        const { token } = req.params;
        // ============================================
        // Validate token
        // ============================================
        if (!token ||
            typeof token !== "string" ||
            token.trim() === "") {
            return (0, error_1.sendError)(res, 400, "Invitation token is required");
        }
        // ============================================
        // Find invitation
        // ============================================
        const reviewRequest = await prisma_1.default.reviewRequest.findFirst({
            where: {
                tokenHash: token,
            },
        });
        // ============================================
        // Invalid token
        // ============================================
        if (!reviewRequest) {
            return (0, error_1.sendError)(res, 404, "Invalid or expired invitation");
        }
        // ============================================
        // Already accepted
        // ============================================
        if (reviewRequest.status === "ACCEPTED") {
            return res.status(200).json({
                success: true,
                message: "Review invitation has already been accepted",
                reviewRequest,
            });
        }
        // ============================================
        // Already declined
        // ============================================
        if (reviewRequest.status === "DECLINED") {
            return (0, error_1.sendError)(res, 400, "This invitation has already been declined");
        }
        // ============================================
        // Only INVITED can be accepted
        // ============================================
        if (reviewRequest.status !== "INVITED") {
            return (0, error_1.sendError)(res, 400, `Review invitation cannot be accepted because its current status is ${reviewRequest.status}`);
        }
        // ============================================
        // Accept invitation
        // ============================================
        const updatedRequest = await prisma_1.default.reviewRequest.update({
            where: {
                id: reviewRequest.id,
            },
            data: {
                status: "ACCEPTED",
                respondedAt: new Date(),
            },
            include: {
                paper: {
                    select: {
                        id: true,
                        manuscriptId: true,
                        authors: true,
                        title: true,
                    },
                },
                reviewer: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
        // ============================================
        // Success
        // ============================================
        return res.status(200).json({
            success: true,
            message: "Review invitation accepted successfully",
            reviewRequest: updatedRequest,
        });
    }
    catch (error) {
        console.error("========== ACCEPT INVITATION BY TOKEN ERROR ==========");
        console.error(error);
        return (0, error_1.handlePrismaError)(res, error);
    }
};
exports.acceptReviewInvitationByToken = acceptReviewInvitationByToken;
// ============================================
// Decline review invitation using email token
// ============================================
const declineReviewInvitationByToken = async (req, res) => {
    try {
        const { token } = req.params;
        // ============================================
        // Validate token
        // ============================================
        if (!token ||
            typeof token !== "string" ||
            token.trim() === "") {
            return (0, error_1.sendError)(res, 400, "Invitation token is required");
        }
        // ============================================
        // Find invitation
        // ============================================
        const reviewRequest = await prisma_1.default.reviewRequest.findFirst({
            where: {
                tokenHash: token,
            },
        });
        // ============================================
        // Invalid token
        // ============================================
        if (!reviewRequest) {
            return (0, error_1.sendError)(res, 404, "Invalid or expired invitation");
        }
        // ============================================
        // Already declined
        // ============================================
        if (reviewRequest.status === "DECLINED") {
            return res.status(200).json({
                success: true,
                message: "Review invitation has already been declined",
                reviewRequest,
            });
        }
        // ============================================
        // Already accepted
        // ============================================
        if (reviewRequest.status === "ACCEPTED") {
            return (0, error_1.sendError)(res, 400, "This invitation has already been accepted");
        }
        // ============================================
        // Only INVITED can be declined
        // ============================================
        if (reviewRequest.status !== "INVITED") {
            return (0, error_1.sendError)(res, 400, `Review invitation cannot be declined because its current status is ${reviewRequest.status}`);
        }
        // ============================================
        // Decline invitation
        // ============================================
        const updatedRequest = await prisma_1.default.reviewRequest.update({
            where: {
                id: reviewRequest.id,
            },
            data: {
                status: "DECLINED",
                respondedAt: new Date(),
            },
            include: {
                paper: {
                    select: {
                        id: true,
                        manuscriptId: true,
                        authors: true,
                        title: true,
                    },
                },
                reviewer: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
        // ============================================
        // Success
        // ============================================
        return res.status(200).json({
            success: true,
            message: "Review invitation declined successfully",
            reviewRequest: updatedRequest,
        });
    }
    catch (error) {
        console.error("========== DECLINE INVITATION BY TOKEN ERROR ==========");
        console.error(error);
        return (0, error_1.handlePrismaError)(res, error);
    }
};
exports.declineReviewInvitationByToken = declineReviewInvitationByToken;
// ============================================
// 4. Reviewer submits review
// POST /api/reviewer/review-requests/:id/submit
// ============================================
const submitReview = async (req, res) => {
    try {
        const reviewerId = req.user?.id;
        const { id } = req.params;
        const { recommendation, commentsToAuthor, commentsToEditor, } = req.body;
        const uploadedFile = req.file;
        // ============================================
        // Check authentication
        // ============================================
        if (!reviewerId) {
            return (0, error_1.sendError)(res, 401, "Unauthorized");
        }
        // ============================================
        // Validate request ID
        // ============================================
        if (!id ||
            typeof id !== "string" ||
            id.trim() === "") {
            return (0, error_1.sendError)(res, 400, "Review request ID is required");
        }
        // ============================================
        // Validate comments to author
        // ============================================
        if (!commentsToAuthor ||
            typeof commentsToAuthor !== "string" ||
            commentsToAuthor.trim() === "") {
            return (0, error_1.sendError)(res, 400, "Comments to author are required");
        }
        // ============================================
        // Validate optional recommendation
        // ============================================
        if (recommendation !== undefined &&
            recommendation !== null &&
            typeof recommendation !== "string") {
            return (0, error_1.sendError)(res, 400, "Recommendation must be a string");
        }
        // ============================================
        // Validate optional comments to editor
        // ============================================
        if (commentsToEditor !== undefined &&
            commentsToEditor !== null &&
            typeof commentsToEditor !== "string") {
            return (0, error_1.sendError)(res, 400, "Comments to editor must be a string");
        }
        // ============================================
        // Find review request
        // ============================================
        const reviewRequest = await prisma_1.default.reviewRequest.findFirst({
            where: {
                id,
                reviewerId,
            },
        });
        // ============================================
        // Request not found
        // ============================================
        if (!reviewRequest) {
            return (0, error_1.sendError)(res, 404, "Review request not found");
        }
        // ============================================
        // Check current status
        // ============================================
        if (reviewRequest.status !== "ACCEPTED") {
            return (0, error_1.sendError)(res, 400, `Review cannot be submitted because the current status is ${reviewRequest.status}`);
        }
        // ============================================
        // Create review and update request
        // ============================================
        const result = await prisma_1.default.$transaction(async (tx) => {
            const review = await tx.review.create({
                data: {
                    reviewRequestId: reviewRequest.id,
                    recommendation: typeof recommendation ===
                        "string" &&
                        recommendation.trim() !== ""
                        ? recommendation.trim()
                        : null,
                    commentsToAuthor: commentsToAuthor.trim(),
                    commentsToEditor: typeof commentsToEditor ===
                        "string" &&
                        commentsToEditor.trim() !== ""
                        ? commentsToEditor.trim()
                        : null,
                    attachmentPath: uploadedFile
                        ? `/uploads/reviews/${uploadedFile.filename}`
                        : null,
                    attachmentName: uploadedFile?.originalname || null,
                },
            });
            const updatedRequest = await tx.reviewRequest.update({
                where: {
                    id: reviewRequest.id,
                },
                data: {
                    status: "REVIEW_SUBMITTED",
                    respondedAt: reviewRequest.respondedAt ||
                        new Date(),
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
                        },
                    },
                    review: true,
                },
            });
            return {
                review,
                reviewRequest: updatedRequest,
            };
        });
        // ============================================
        // Success response
        // ============================================
        return res.status(201).json({
            success: true,
            message: "Review submitted successfully",
            review: result.review,
            reviewRequest: result.reviewRequest,
        });
    }
    catch (error) {
        console.error("========== SUBMIT REVIEW ERROR ==========");
        console.error(error);
        return (0, error_1.handlePrismaError)(res, error);
    }
};
exports.submitReview = submitReview;
// ============================================
// 5. Reviewer views own submitted review
// GET /api/reviewer/review-requests/:id/review
// ============================================
const getMySubmittedReview = async (req, res) => {
    try {
        const reviewerId = req.user?.id;
        const { id } = req.params;
        // ============================================
        // Check authentication
        // ============================================
        if (!reviewerId) {
            return (0, error_1.sendError)(res, 401, "Unauthorized");
        }
        // ============================================
        // Validate request ID
        // ============================================
        if (!id ||
            typeof id !== "string" ||
            id.trim() === "") {
            return (0, error_1.sendError)(res, 400, "Review request ID is required");
        }
        // ============================================
        // Find review request belonging to reviewer
        // ============================================
        const reviewRequest = await prisma_1.default.reviewRequest.findFirst({
            where: {
                id,
                reviewerId,
            },
            include: {
                paper: {
                    select: {
                        id: true,
                        manuscriptId: true,
                        authors: true,
                        title: true,
                    },
                },
                review: true,
            },
        });
        // ============================================
        // Request not found
        // ============================================
        if (!reviewRequest) {
            return (0, error_1.sendError)(res, 404, "Review request not found");
        }
        // ============================================
        // Check review submission status
        // ============================================
        if (reviewRequest.status !==
            "REVIEW_SUBMITTED") {
            return (0, error_1.sendError)(res, 400, "Review has not been submitted yet");
        }
        // ============================================
        // Check review exists
        // ============================================
        if (!reviewRequest.review) {
            return (0, error_1.sendError)(res, 404, "Submitted review not found");
        }
        // ============================================
        // Success response
        // ============================================
        return res.status(200).json({
            success: true,
            reviewRequest: {
                id: reviewRequest.id,
                status: reviewRequest.status,
                respondedAt: reviewRequest.respondedAt,
                paper: reviewRequest.paper,
                review: reviewRequest.review,
            },
        });
    }
    catch (error) {
        console.error("========== GET MY SUBMITTED REVIEW ERROR ==========");
        console.error(error);
        return (0, error_1.handlePrismaError)(res, error);
    }
};
exports.getMySubmittedReview = getMySubmittedReview;
