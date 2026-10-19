import "dotenv/config";

import express from "express";
import cors from "cors";
import editorRoutes from "./routes/editor.routes";
import authRoutes from "./routes/auth.routes";
import testRoutes from "./routes/test.routes";
import paperRoutes from "./routes/paper.routes";
import reviewerRoutes from "./routes/reviewer.routes";
import reviewRequestRoutes from "./routes/reviewRequest.routes";
import { errorHandler } from "./middleware/error.middleware";
import adminRoutes from "./routes/admin.routes";
import editorInvitationRoutes from "./routes/editorInvitation.routes";
import profileRoutes from "./routes/profile.routes";
import submissionDraftRoutes from "./routes/submission-draft.routes";
import withdrawalRoutes from "./routes/withdrawal.routes";
import editorWithdrawalRoutes from "./routes/editor-withdrawal.routes";
import notificationRoutes from "./routes/notification.routes";
import revisionRequestRoutes from "./routes/revisionRequest.routes";
import authorRevisionRoutes from "./routes/author-revision.routes";
import { createInitialAdmin } from "./createInitialAdmin";
const app = express();
import path from "path";

const PORT = Number(process.env.PORT) || 4000;

const FRONTEND_URL =
  process.env.FRONTEND_URL || "http://localhost:5173";

/*
|--------------------------------------------------------------------------
| Middleware
|--------------------------------------------------------------------------
*/

app.use(
  cors({
    origin: FRONTEND_URL,
  })
);



app.use(express.json());

app.use(express.urlencoded({ extended: true }));


app.use(
  "/uploads",
  express.static(path.join(process.cwd(), "uploads"))
);
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

app.use("/api/auth", authRoutes);
app.use("/api/test", testRoutes);
app.use("/api/editor", editorRoutes);
app.use("/api/papers", paperRoutes);
app.use("/api/reviewer", reviewerRoutes);
app.use("/api/editor", reviewRequestRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin/editor-invitations", editorInvitationRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/author/drafts", submissionDraftRoutes);
app.use("/api/author/withdrawals", withdrawalRoutes);
app.use("/api/editor/withdrawals", editorWithdrawalRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/editor", revisionRequestRoutes);
app.use("/api/author", authorRevisionRoutes);
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

app.use(errorHandler);

/*
|--------------------------------------------------------------------------
| Start Server
|--------------------------------------------------------------------------
*/

const startServer = async () => {
  await createInitialAdmin();

  app.listen(PORT, () => {
    console.log(
      `Journal Reviewer API running at http://localhost:${PORT}`
    );
  });
};

startServer();