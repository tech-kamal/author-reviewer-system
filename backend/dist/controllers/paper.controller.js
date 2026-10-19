"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPaperPdf = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const prisma_1 = __importDefault(require("../prisma"));
const getPaperPdf = async (req, res) => {
    try {
        const userId = req.user?.id;
        // const { paperId } = req.params;
        const paperId = req.params.paperId;
        // 1. Check authentication
        if (!userId) {
            return res.status(401).json({
                message: "Unauthorized",
            });
        }
        // 2. Validate paper ID
        if (!paperId || paperId.trim() === "") {
            return res.status(400).json({
                message: "Paper ID is required",
            });
        }
        // 2. Find the paper
        const paper = await prisma_1.default.paper.findUnique({
            where: {
                id: paperId,
            },
            include: {
                reviewRequests: {
                    where: {
                        reviewerId: userId,
                    },
                    select: {
                        status: true,
                    },
                },
            },
        });
        // 3. Paper not found
        if (!paper) {
            return res.status(404).json({
                message: "Paper not found",
            });
        }
        // 4. Check whether user is the editor who created the paper
        const isOwner = paper.createdById === userId;
        // 5. Check whether reviewer has accepted the paper
        const reviewerRequest = paper.reviewRequests[0];
        const isAcceptedReviewer = reviewerRequest?.status === "ACCEPTED" ||
            reviewerRequest?.status === "REVIEW_SUBMITTED";
        // 6. Allow only:
        //    - Paper owner/editor
        //    - Accepted reviewer
        if (!isOwner && !isAcceptedReviewer) {
            return res.status(403).json({
                message: "You are not allowed to access this paper",
            });
        }
        // 7. Get the PDF path
        let filePath = paper.pdfPath;
        // Support both:
        // /uploads/papers/file.pdf
        // C:\...\uploads\papers\file.pdf
        if (filePath.startsWith("/uploads/")) {
            filePath = path_1.default.join(process.cwd(), filePath.substring(1));
        }
        // 8. Check if physical file exists
        if (!fs_1.default.existsSync(filePath)) {
            return res.status(404).json({
                message: "PDF file not found",
            });
        }
        // 9. Send PDF
        res.setHeader("Content-Type", "application/pdf");
        return res.sendFile(path_1.default.resolve(filePath));
    }
    catch (error) {
        console.error("Get PDF error:", error);
        return res.status(500).json({
            message: "Failed to open PDF",
            error: error instanceof Error
                ? error.message
                : String(error),
        });
    }
};
exports.getPaperPdf = getPaperPdf;
