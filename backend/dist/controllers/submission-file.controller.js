"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadSubmissionFiles = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const prisma_1 = __importDefault(require("../prisma"));
const error_1 = require("../utils/error");
/**
 * UPLOAD FILES FOR SUBMISSION DRAFT
 * POST /api/author/drafts/:id/files
 */
const uploadSubmissionFiles = async (req, res) => {
    try {
        if (!req.user) {
            return (0, error_1.sendError)(res, 401, "Authentication required");
        }
        const draftId = String(req.params.id);
        const draft = await prisma_1.default.submissionDraft.findFirst({
            where: {
                id: draftId,
                authorId: req.user.id,
            },
        });
        if (!draft) {
            return (0, error_1.sendError)(res, 404, "Submission draft not found");
        }
        const files = req.files;
        const mainFile = files?.mainFile?.[0];
        const supplementaryFile = files?.supplementaryFile?.[0];
        if (!mainFile && !supplementaryFile) {
            return (0, error_1.sendError)(res, 400, "No file uploaded");
        }
        const updateData = {};
        if (mainFile) {
            updateData.mainFilePath = path_1.default
                .join("uploads", "submissions", mainFile.filename)
                .replace(/\\/g, "/");
            updateData.mainFileName = mainFile.originalname;
        }
        if (supplementaryFile) {
            updateData.supplementaryFilePath = path_1.default
                .join("uploads", "submissions", supplementaryFile.filename)
                .replace(/\\/g, "/");
            updateData.supplementaryFileName =
                supplementaryFile.originalname;
        }
        const updatedDraft = await prisma_1.default.submissionDraft.update({
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
    }
    catch (error) {
        console.error("uploadSubmissionFiles error:", error);
        // Remove uploaded files if database update fails
        const files = req.files;
        const uploadedFiles = [
            ...(files?.mainFile || []),
            ...(files?.supplementaryFile || []),
        ];
        for (const file of uploadedFiles) {
            try {
                if (fs_1.default.existsSync(file.path)) {
                    fs_1.default.unlinkSync(file.path);
                }
            }
            catch (cleanupError) {
                console.error("Failed to remove uploaded file:", cleanupError);
            }
        }
        return (0, error_1.handlePrismaError)(res, error);
    }
};
exports.uploadSubmissionFiles = uploadSubmissionFiles;
