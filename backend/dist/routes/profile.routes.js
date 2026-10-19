"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const profile_controller_1 = require("../controllers/profile.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, path_1.default.join(process.cwd(), "uploads"));
    },
    filename: (_req, file, cb) => {
        const extension = path_1.default.extname(file.originalname);
        cb(null, `profile-${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`);
    },
});
const upload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
    fileFilter: (_req, file, cb) => {
        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
        ];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error("Only JPG, PNG and WebP images are allowed"));
        }
    },
});
router.get("/", auth_middleware_1.requireAuth, profile_controller_1.getProfile);
router.patch("/", auth_middleware_1.requireAuth, profile_controller_1.updateProfile);
router.patch("/photo", auth_middleware_1.requireAuth, upload.single("profilePhoto"), profile_controller_1.updateProfilePhoto);
router.patch("/password", auth_middleware_1.requireAuth, profile_controller_1.changePassword);
exports.default = router;
