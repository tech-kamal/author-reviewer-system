"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decideWithdrawalRequest = exports.getWithdrawalRequests = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const error_1 = require("../utils/error");
const getWithdrawalRequests = async (req, res) => {
    try {
        if (!req.user) {
            return (0, error_1.sendError)(res, 401, "Authentication required");
        }
        const requests = await prisma_1.default.withdrawalRequest.findMany({
            where: {
                status: {
                    in: ["PENDING", "REJECTED", "APPROVED"],
                },
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
                author: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        affiliation: true,
                        orcid: true,
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
            withdrawalRequests: requests,
        });
    }
    catch (error) {
        console.error("getWithdrawalRequests error:", error);
        return (0, error_1.handlePrismaError)(res, error);
    }
};
exports.getWithdrawalRequests = getWithdrawalRequests;
const decideWithdrawalRequest = async (req, res) => {
    try {
        if (!req.user) {
            return (0, error_1.sendError)(res, 401, "Authentication required");
        }
        const editorId = req.user.id;
        const { id } = req.params;
        const { decision, comment } = req.body;
        if (!id || typeof id !== "string") {
            return (0, error_1.sendError)(res, 400, "Withdrawal request ID is required");
        }
        if (!["APPROVED", "REJECTED"].includes(decision)) {
            return (0, error_1.sendError)(res, 400, "Decision must be APPROVED or REJECTED");
        }
        if (!comment || typeof comment !== "string" || comment.trim() === "") {
            return (0, error_1.sendError)(res, 400, "Editor comment is required before making a decision");
        }
        if (comment.trim().length < 10) {
            return (0, error_1.sendError)(res, 400, "Editor comment must be at least 10 characters");
        }
        const request = await prisma_1.default.withdrawalRequest.findUnique({
            where: {
                id,
            },
            include: {
                paper: {
                    select: {
                        id: true,
                        manuscriptId: true,
                        title: true,
                        withdrawnAt: true,
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
        });
        if (!request) {
            return (0, error_1.sendError)(res, 404, "Withdrawal request not found");
        }
        if (request.status !== "PENDING") {
            return (0, error_1.sendError)(res, 400, "This withdrawal request has already been decided");
        }
        if (request.paper.withdrawnAt) {
            return (0, error_1.sendError)(res, 400, "This manuscript has already been withdrawn");
        }
        const cleanComment = comment.trim();
        const result = await prisma_1.default.$transaction(async (tx) => {
            const updatedRequest = await tx.withdrawalRequest.update({
                where: {
                    id: request.id,
                },
                data: {
                    status: decision,
                    editorComment: cleanComment,
                    decidedById: editorId,
                    decidedAt: new Date(),
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
            });
            if (decision === "APPROVED") {
                await tx.paper.update({
                    where: {
                        id: request.paperId,
                    },
                    data: {
                        withdrawnAt: new Date(),
                    },
                });
            }
            return updatedRequest;
        });
        return res.status(200).json({
            success: true,
            message: decision === "APPROVED"
                ? "Withdrawal request approved successfully"
                : "Withdrawal request rejected successfully",
            withdrawalRequest: result,
        });
    }
    catch (error) {
        console.error("decideWithdrawalRequest error:", error);
        return (0, error_1.handlePrismaError)(res, error);
    }
};
exports.decideWithdrawalRequest = decideWithdrawalRequest;
