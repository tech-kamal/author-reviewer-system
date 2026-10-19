"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const paper_controller_1 = require("../controllers/paper.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.get("/:paperId/pdf", auth_middleware_1.requireAuth, paper_controller_1.getPaperPdf);
exports.default = router;
