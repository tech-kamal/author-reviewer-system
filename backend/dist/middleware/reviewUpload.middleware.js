"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reviewUpload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// ============================================
// Upload directory
// ============================================
const uploadDirectory = path_1.default.join(process.cwd(), "uploads", "reviews");
// ============================================
// Create directory if it does not exist
// ============================================
if (!fs_1.default.existsSync(uploadDirectory)) {
    fs_1.default.mkdirSync(uploadDirectory, {
        recursive: true,
    });
}
// ============================================
// Storage
// ============================================
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDirectory);
    },
    filename: (req, file, cb) => {
        const extension = path_1.default.extname(file.originalname);
        const uniqueName = `review-${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;
        cb(null, uniqueName);
    },
});
// ============================================
// Allowed file types
// ============================================
const allowedMimeTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
// ============================================
// File filter
// ============================================
const fileFilter = (req, file, cb) => {
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error("Only PDF, DOC, and DOCX files are allowed."));
    }
};
// ============================================
// Multer upload
// ============================================
exports.reviewUpload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024,
    },
});
