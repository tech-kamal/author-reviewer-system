"use strict";
// import multer from "multer";
// import path from "path";
// import fs from "fs";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadPaper = void 0;
// const uploadDir = path.join(
//   process.cwd(),
//   "uploads",
//   "papers"
// );
// console.log("UPLOAD DIRECTORY:", uploadDir);
// if (!fs.existsSync(uploadDir)) {
//   fs.mkdirSync(uploadDir, {
//     recursive: true,
//   });
// }
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     console.log("MULTER DESTINATION CALLED");
//     console.log("FILE RECEIVED:", file);
//     cb(null, uploadDir);
//   },
//   filename: function (req, file, cb) {
//     console.log("MULTER FILENAME CALLED");
//     console.log("ORIGINAL FILE:", file.originalname);
//     const uniqueName =
//       Date.now() +
//       "-" +
//       Math.round(Math.random() * 1e9) +
//       path.extname(file.originalname);
//     cb(null, uniqueName);
//   },
// });
// const fileFilter = (
//   req: Express.Request,
//   file: Express.Multer.File,
//   cb: multer.FileFilterCallback
// ) => {
//   console.log("MULTER FILE FILTER CALLED");
//   console.log("MIME TYPE:", file.mimetype);
//   console.log("FIELD NAME:", file.fieldname);
//   if (file.mimetype === "application/pdf") {
//     cb(null, true);
//   } else {
//     cb(new Error("Only PDF files are allowed"));
//   }
// };
// export const uploadPaper = multer({
//   storage,
//   fileFilter,
//   limits: {
//     fileSize: 10 * 1024 * 1024,
//   },
// });
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// ============================================
// Upload directory
// ============================================
const uploadDir = path_1.default.join(process.cwd(), "uploads", "papers");
console.log("UPLOAD DIRECTORY:", uploadDir);
// ============================================
// Create upload directory if it does not exist
// ============================================
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir, {
        recursive: true,
    });
}
// ============================================
// Multer storage
// ============================================
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        console.log("MULTER DESTINATION CALLED");
        console.log("FILE RECEIVED:", file.originalname);
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        console.log("MULTER FILENAME CALLED");
        console.log("ORIGINAL FILE:", file.originalname);
        const extension = path_1.default.extname(file.originalname);
        const uniqueName = Date.now() +
            "-" +
            Math.round(Math.random() * 1e9) +
            extension;
        cb(null, uniqueName);
    },
});
// ============================================
// PDF file filter
// ============================================
const fileFilter = (req, file, cb) => {
    console.log("MULTER FILE FILTER CALLED");
    console.log("MIME TYPE:", file.mimetype);
    console.log("FIELD NAME:", file.fieldname);
    // --------------------------------------------
    // Allow PDF only
    // --------------------------------------------
    if (file.mimetype ===
        "application/pdf") {
        cb(null, true);
        return;
    }
    // --------------------------------------------
    // Reject non-PDF files
    // --------------------------------------------
    cb(new Error("Only PDF files are allowed"));
};
// ============================================
// Multer upload configuration
// ============================================
exports.uploadPaper = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        // Maximum file size: 10 MB
        fileSize: 10 * 1024 * 1024,
    },
});
