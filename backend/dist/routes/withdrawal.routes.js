"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const withdrawal_controller_1 = require("../controllers/withdrawal.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const role_middleware_1 = require("../middleware/role.middleware");
const router = (0, express_1.Router)();
/**
 * =====================================================
 * AUTHOR WITHDRAWAL REQUESTS
 * =====================================================
 */
// Create withdrawal request
router.post("/", auth_middleware_1.requireAuth, (0, role_middleware_1.requireRole)("REVIEWER"), withdrawal_controller_1.createWithdrawalRequest);
// Get my withdrawal requests/history
router.get("/", auth_middleware_1.requireAuth, (0, role_middleware_1.requireRole)("REVIEWER"), withdrawal_controller_1.getMyWithdrawalRequests);
// Permanently delete approved withdrawn manuscript
router.delete("/:paperId", auth_middleware_1.requireAuth, (0, role_middleware_1.requireRole)("REVIEWER"), withdrawal_controller_1.deleteWithdrawnManuscript);
exports.default = router;
