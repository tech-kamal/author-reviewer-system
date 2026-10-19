"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfilePhoto = exports.changePassword = exports.updateProfile = exports.getProfile = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = __importDefault(require("../prisma"));
const error_1 = require("../utils/error");
// =====================================================
// GET PROFILE
// GET /api/profile
// =====================================================
const getProfile = async (req, res) => {
    try {
        console.log("========== GET PROFILE ==========");
        const userId = req.user?.id;
        // ---------------------------------------------
        // 1. Authentication check
        // ---------------------------------------------
        if (!userId) {
            return (0, error_1.sendError)(res, 401, "Unauthorized");
        }
        // ---------------------------------------------
        // 2. Find current user
        // ---------------------------------------------
        const user = await prisma_1.default.user.findUnique({
            where: {
                id: userId,
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                affiliation: true,
                orcid: true,
                country: true,
                profilePhoto: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        // ---------------------------------------------
        // 3. User not found
        // ---------------------------------------------
        if (!user) {
            return (0, error_1.sendError)(res, 404, "User not found");
        }
        // ---------------------------------------------
        // 4. Success response
        // ---------------------------------------------
        return res.status(200).json({
            success: true,
            profile: user,
        });
    }
    catch (error) {
        console.error("========== GET PROFILE ERROR ==========");
        console.error(error);
        return (0, error_1.handlePrismaError)(res, error);
    }
};
exports.getProfile = getProfile;
// =====================================================
// UPDATE PROFILE
// PATCH /api/profile
// =====================================================
const updateProfile = async (req, res) => {
    try {
        console.log("========== UPDATE PROFILE ==========");
        const userId = req.user?.id;
        // ---------------------------------------------
        // 1. Authentication check
        // ---------------------------------------------
        if (!userId) {
            return (0, error_1.sendError)(res, 401, "Unauthorized");
        }
        // ---------------------------------------------
        // 2. Get form fields
        // ---------------------------------------------
        const { name, affiliation, orcid, country, } = req.body;
        // ---------------------------------------------
        // 3. Name validation
        // ---------------------------------------------
        if (!name ||
            typeof name !== "string" ||
            name.trim() === "") {
            return (0, error_1.sendError)(res, 400, "Name is required");
        }
        // ---------------------------------------------
        // 4. Update profile
        // ---------------------------------------------
        const user = await prisma_1.default.user.update({
            where: {
                id: userId,
            },
            data: {
                name: name.trim(),
                affiliation: affiliation &&
                    typeof affiliation === "string" &&
                    affiliation.trim() !== ""
                    ? affiliation.trim()
                    : null,
                orcid: orcid &&
                    typeof orcid === "string" &&
                    orcid.trim() !== ""
                    ? orcid.trim()
                    : null,
                country: country &&
                    typeof country === "string" &&
                    country.trim() !== ""
                    ? country.trim()
                    : null,
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                affiliation: true,
                orcid: true,
                country: true,
                profilePhoto: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        // ---------------------------------------------
        // 5. Success response
        // ---------------------------------------------
        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            profile: user,
        });
    }
    catch (error) {
        console.error("========== UPDATE PROFILE ERROR ==========");
        console.error(error);
        return (0, error_1.handlePrismaError)(res, error);
    }
};
exports.updateProfile = updateProfile;
// =====================================================
// CHANGE PASSWORD
// PATCH /api/profile/password
// =====================================================
const changePassword = async (req, res) => {
    try {
        console.log("========== CHANGE PASSWORD ==========");
        const userId = req.user?.id;
        // ---------------------------------------------
        // 1. Authentication check
        // ---------------------------------------------
        if (!userId) {
            return (0, error_1.sendError)(res, 401, "Unauthorized");
        }
        // ---------------------------------------------
        // 2. Get password fields
        // ---------------------------------------------
        const { currentPassword, newPassword, } = req.body;
        // ---------------------------------------------
        // 3. Validation
        // ---------------------------------------------
        if (!currentPassword ||
            !newPassword) {
            return (0, error_1.sendError)(res, 400, "Current password and new password are required");
        }
        if (typeof newPassword !== "string" ||
            newPassword.length < 6) {
            return (0, error_1.sendError)(res, 400, "New password must be at least 6 characters");
        }
        // ---------------------------------------------
        // 4. Find current user
        // ---------------------------------------------
        const user = await prisma_1.default.user.findUnique({
            where: {
                id: userId,
            },
            select: {
                id: true,
                passwordHash: true,
            },
        });
        // ---------------------------------------------
        // 5. User not found
        // ---------------------------------------------
        if (!user) {
            return (0, error_1.sendError)(res, 404, "User not found");
        }
        // ---------------------------------------------
        // 6. Verify current password
        // ---------------------------------------------
        const passwordMatches = await bcryptjs_1.default.compare(currentPassword, user.passwordHash);
        if (!passwordMatches) {
            return (0, error_1.sendError)(res, 400, "Current password is incorrect");
        }
        // ---------------------------------------------
        // 7. Hash new password
        // ---------------------------------------------
        const newPasswordHash = await bcryptjs_1.default.hash(newPassword, 12);
        // ---------------------------------------------
        // 8. Update password
        // ---------------------------------------------
        await prisma_1.default.user.update({
            where: {
                id: userId,
            },
            data: {
                passwordHash: newPasswordHash,
            },
        });
        // ---------------------------------------------
        // 9. Success response
        // ---------------------------------------------
        return res.status(200).json({
            success: true,
            message: "Password changed successfully",
        });
    }
    catch (error) {
        console.error("========== CHANGE PASSWORD ERROR ==========");
        console.error(error);
        return (0, error_1.handlePrismaError)(res, error);
    }
};
exports.changePassword = changePassword;
// =====================================================
// UPDATE PROFILE PHOTO
// PATCH /api/profile/photo
// =====================================================
const updateProfilePhoto = async (req, res) => {
    try {
        console.log("========== UPDATE PROFILE PHOTO ==========");
        const userId = req.user?.id;
        // ---------------------------------------------
        // 1. Authentication check
        // ---------------------------------------------
        if (!userId) {
            return (0, error_1.sendError)(res, 401, "Unauthorized");
        }
        // ---------------------------------------------
        // 2. Check uploaded file
        // ---------------------------------------------
        if (!req.file) {
            return (0, error_1.sendError)(res, 400, "Profile photo is required");
        }
        // ---------------------------------------------
        // 3. Create profile photo path
        // ---------------------------------------------
        const profilePhotoPath = `/uploads/${req.file.filename}`;
        // ---------------------------------------------
        // 4. Update user profile photo
        // ---------------------------------------------
        const user = await prisma_1.default.user.update({
            where: {
                id: userId,
            },
            data: {
                profilePhoto: profilePhotoPath,
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                affiliation: true,
                orcid: true,
                country: true,
                profilePhoto: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        // ---------------------------------------------
        // 5. Success response
        // ---------------------------------------------
        return res.status(200).json({
            success: true,
            message: "Profile photo updated successfully",
            profile: user,
        });
    }
    catch (error) {
        console.error("========== UPDATE PROFILE PHOTO ERROR ==========");
        console.error(error);
        return (0, error_1.handlePrismaError)(res, error);
    }
};
exports.updateProfilePhoto = updateProfilePhoto;
