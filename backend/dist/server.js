"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const editor_routes_1 = __importDefault(require("./routes/editor.routes"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const test_routes_1 = __importDefault(require("./routes/test.routes"));
const paper_routes_1 = __importDefault(require("./routes/paper.routes"));
const reviewer_routes_1 = __importDefault(require("./routes/reviewer.routes"));
const reviewRequest_routes_1 = __importDefault(require("./routes/reviewRequest.routes"));
const error_middleware_1 = require("./middleware/error.middleware");
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const editorInvitation_routes_1 = __importDefault(require("./routes/editorInvitation.routes"));
const profile_routes_1 = __importDefault(require("./routes/profile.routes"));
const submission_draft_routes_1 = __importDefault(require("./routes/submission-draft.routes"));
const withdrawal_routes_1 = __importDefault(require("./routes/withdrawal.routes"));
const editor_withdrawal_routes_1 = __importDefault(require("./routes/editor-withdrawal.routes"));
const notification_routes_1 = __importDefault(require("./routes/notification.routes"));
const revisionRequest_routes_1 = __importDefault(require("./routes/revisionRequest.routes"));
const author_revision_routes_1 = __importDefault(require("./routes/author-revision.routes"));
const createInitialAdmin_1 = require("./createInitialAdmin");
const app = (0, express_1.default)();
const path_1 = __importDefault(require("path"));
const PORT = Number(process.env.PORT) || 4000;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
/*
|--------------------------------------------------------------------------
| Middleware
|--------------------------------------------------------------------------
*/
app.use((0, cors_1.default)({
    origin: FRONTEND_URL,
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use("/uploads", express_1.default.static(path_1.default.join(process.cwd(), "uploads")));
/*
|--------------------------------------------------------------------------
| Health Check
|--------------------------------------------------------------------------
*/
app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "Journal Reviewer API is running",
    });
});
/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
*/
app.use("/api/auth", auth_routes_1.default);
app.use("/api/test", test_routes_1.default);
app.use("/api/editor", editor_routes_1.default);
app.use("/api/papers", paper_routes_1.default);
app.use("/api/reviewer", reviewer_routes_1.default);
app.use("/api/editor", reviewRequest_routes_1.default);
app.use("/api/admin", admin_routes_1.default);
app.use("/api/admin/editor-invitations", editorInvitation_routes_1.default);
app.use("/api/profile", profile_routes_1.default);
app.use("/api/author/drafts", submission_draft_routes_1.default);
app.use("/api/author/withdrawals", withdrawal_routes_1.default);
app.use("/api/editor/withdrawals", editor_withdrawal_routes_1.default);
app.use("/api/notifications", notification_routes_1.default);
app.use("/api/editor", revisionRequest_routes_1.default);
app.use("/api/author", author_revision_routes_1.default);
/*
|--------------------------------------------------------------------------
| 404
|--------------------------------------------------------------------------
*/
app.use((req, res) => {
    return res.status(404).json({
        success: false,
        message: "Route not found",
        path: req.originalUrl,
    });
});
// ============================================
// Global error handler
// ============================================
app.use(error_middleware_1.errorHandler);
/*
|--------------------------------------------------------------------------
| Start Server
|--------------------------------------------------------------------------
*/
const startServer = async () => {
    await (0, createInitialAdmin_1.createInitialAdmin)();
    app.listen(PORT, () => {
        console.log(`Journal Reviewer API running at http://localhost:${PORT}`);
    });
};
startServer();
