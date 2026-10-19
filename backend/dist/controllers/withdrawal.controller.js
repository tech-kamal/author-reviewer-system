"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteWithdrawnManuscript = exports.getMyWithdrawalRequests = exports.createWithdrawalRequest = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const error_1 = require("../utils/error");
/**
 * =====================================================
 * CREATE WITHDRAWAL REQUEST
 * POST /api/author/withdrawals
 * =====================================================
 */
const createWithdrawalRequest = async (req, res) => {
    try {
        if (!req.user) {
            return (0, error_1.sendError)(res, 401, "Authentication required");
        }
        const authorId = req.user.id;
        const { paperId, reason } = req.body;
        // -------------------------------------------------
        // 1. Validate paper ID
        // -------------------------------------------------
        if (!paperId ||
            typeof paperId !== "string" ||
            paperId.trim() === "") {
            return (0, error_1.sendError)(res, 400, "Paper ID is required");
        }
        // -------------------------------------------------
        // 2. Validate withdrawal reason
        // -------------------------------------------------
        if (!reason ||
            typeof reason !== "string" ||
            reason.trim() === "") {
            return (0, error_1.sendError)(res, 400, "Withdrawal reason is required");
        }
        if (reason.trim().length < 10) {
            return (0, error_1.sendError)(res, 400, "Withdrawal reason must be at least 10 characters");
        }
        const cleanPaperId = paperId.trim();
        const cleanReason = reason.trim();
        // -------------------------------------------------
        // 3. Find manuscript owned by author
        // -------------------------------------------------
        const paper = await prisma_1.default.paper.findFirst({
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
            return (0, error_1.sendError)(res, 404, "Manuscript not found");
        }
        // -------------------------------------------------
        // 4. Check if manuscript is already withdrawn
        // -------------------------------------------------
        if (paper.withdrawnAt) {
            return (0, error_1.sendError)(res, 400, "This manuscript has already been withdrawn");
        }
        // -------------------------------------------------
        // 5. Check for an existing pending request
        // -------------------------------------------------
        const pendingRequest = await prisma_1.default.withdrawalRequest.findFirst({
            where: {
                paperId: paper.id,
                authorId,
                status: "PENDING",
            },
        });
        if (pendingRequest) {
            return (0, error_1.sendError)(res, 400, "A withdrawal request for this manuscript is already pending");
        }
        // -------------------------------------------------
        // 6. Create new withdrawal request
        //
        // Rejected requests are NOT reused.
        // A new request is created every time.
        // -------------------------------------------------
        const withdrawalRequest = await prisma_1.default.withdrawalRequest.create({
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
        const editors = await prisma_1.default.user.findMany({
            where: {
                role: "EDITOR",
            },
            select: {
                id: true,
            },
        });
        if (editors.length > 0) {
            await prisma_1.default.notification.createMany({
                data: editors.map((editor) => ({
                    userId: editor.id,
                    type: "WITHDRAWAL_REQUEST",
                    title: "New Withdrawal Request",
                    message: `A new withdrawal request has been submitted for manuscript ${paper.manuscriptId || paper.id}.`,
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
            message: "Withdrawal request submitted successfully",
            withdrawalRequest,
        });
    }
    catch (error) {
        console.error("createWithdrawalRequest error:", error);
        return (0, error_1.handlePrismaError)(res, error);
    }
};
exports.createWithdrawalRequest = createWithdrawalRequest;
/**
 * =====================================================
 * GET AUTHOR WITHDRAWAL REQUESTS
 * GET /api/author/withdrawals
 * =====================================================
 */
const getMyWithdrawalRequests = async (req, res) => {
    try {
        if (!req.user) {
            return (0, error_1.sendError)(res, 401, "Authentication required");
        }
        const authorId = req.user.id;
        // -------------------------------------------------
        // Get all withdrawal requests made by author
        // -------------------------------------------------
        const withdrawalRequests = await prisma_1.default.withdrawalRequest.findMany({
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
    }
    catch (error) {
        console.error("getMyWithdrawalRequests error:", error);
        return (0, error_1.handlePrismaError)(res, error);
    }
};
exports.getMyWithdrawalRequests = getMyWithdrawalRequests;
/**
 * =====================================================
 * DELETE WITHDRAWN MANUSCRIPT
 * DELETE /api/author/withdrawals/:paperId
 * =====================================================
 */
const deleteWithdrawnManuscript = async (req, res) => {
    try {
        if (!req.user) {
            return (0, error_1.sendError)(res, 401, "Authentication required");
        }
        const authorId = req.user.id;
        const paperId = req.params.paperId;
        // -------------------------------------------------
        // 1. Validate paper ID
        // -------------------------------------------------
        if (!paperId ||
            typeof paperId !== "string" ||
            paperId.trim() === "") {
            return (0, error_1.sendError)(res, 400, "Paper ID is required");
        }
        const cleanPaperId = paperId.trim();
        // -------------------------------------------------
        // 2. Find manuscript owned by author
        //    and verify withdrawal was APPROVED
        // -------------------------------------------------
        const paper = await prisma_1.default.paper.findFirst({
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
            return (0, error_1.sendError)(res, 404, "Withdrawn manuscript not found");
        }
        // -------------------------------------------------
        // 3. Permanently delete manuscript
        //
        // Prisma schema has Cascade relations, so related
        // withdrawal requests/reviews etc. are removed
        // according to the existing schema relations.
        // -------------------------------------------------
        await prisma_1.default.paper.delete({
            where: {
                id: paper.id,
            },
        });
        // -------------------------------------------------
        // 4. Success response
        // -------------------------------------------------
        return res.status(200).json({
            success: true,
            message: "Withdrawn manuscript deleted successfully",
            paperId: paper.id,
            manuscriptId: paper.manuscriptId,
        });
    }
    catch (error) {
        console.error("deleteWithdrawnManuscript error:", error);
        return (0, error_1.handlePrismaError)(res, error);
    }
};
exports.deleteWithdrawnManuscript = deleteWithdrawnManuscript;
