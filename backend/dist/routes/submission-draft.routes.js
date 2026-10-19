"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const submission_draft_controller_1 = require("../controllers/submission-draft.controller");
const submission_file_controller_1 = require("../controllers/submission-file.controller");
const upload_1 = __importDefault(require("../config/upload"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const role_middleware_1 = require("../middleware/role.middleware");
const router = (0, express_1.Router)();
// Create a new draft
router.post("/", auth_middleware_1.requireAuth, (0, role_middleware_1.requireRole)("REVIEWER"), submission_draft_controller_1.createDraft);
// Get latest/current draft of logged-in author
router.get("/current", auth_middleware_1.requireAuth, (0, role_middleware_1.requireRole)("REVIEWER"), submission_draft_controller_1.getCurrentDraft);
// Get all drafts of logged-in author
router.get("/", auth_middleware_1.requireAuth, (0, role_middleware_1.requireRole)("REVIEWER"), submission_draft_controller_1.getMyDrafts);
router.get("/submissions", auth_middleware_1.requireAuth, (0, role_middleware_1.requireRole)("REVIEWER"), submission_draft_controller_1.getMySubmissions);
// Get single draft
router.get("/:id", auth_middleware_1.requireAuth, (0, role_middleware_1.requireRole)("REVIEWER"), submission_draft_controller_1.getDraftById);
// Save / update draft
router.patch("/:id", auth_middleware_1.requireAuth, (0, role_middleware_1.requireRole)("REVIEWER"), submission_draft_controller_1.updateDraft);
// Delete draft
router.delete("/:id", auth_middleware_1.requireAuth, (0, role_middleware_1.requireRole)("REVIEWER"), submission_draft_controller_1.deleteDraft);
router.post("/:id/submit", auth_middleware_1.requireAuth, (0, role_middleware_1.requireRole)("REVIEWER"), submission_draft_controller_1.submitSubmissionDraft);
router.post("/:id/files", auth_middleware_1.requireAuth, (0, role_middleware_1.requireRole)("REVIEWER"), upload_1.default.fields([
    { name: "mainFile", maxCount: 1 },
    { name: "supplementaryFile", maxCount: 1 },
]), submission_file_controller_1.uploadSubmissionFiles);
exports.default = router;
