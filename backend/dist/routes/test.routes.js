"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const role_middleware_1 = require("../middleware/role.middleware");
const router = (0, express_1.Router)();
router.get("/editor-only", auth_middleware_1.requireAuth, (0, role_middleware_1.requireRole)("EDITOR"), (req, res) => {
    res.json({
        success: true,
        message: "You are an authenticated editor",
        user: req.user,
    });
});
router.get("/reviewer-only", auth_middleware_1.requireAuth, (0, role_middleware_1.requireRole)("REVIEWER"), (req, res) => {
    res.json({
        success: true,
        message: "You are an authenticated reviewer",
        user: req.user,
    });
});
exports.default = router;
