import { Router } from "express";

import { getPaperPdf } from "../controllers/paper.controller";

import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.get(
  "/:paperId/pdf",
  requireAuth,
  getPaperPdf
);

export default router;