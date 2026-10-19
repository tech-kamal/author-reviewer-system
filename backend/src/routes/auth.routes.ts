import { Router } from "express";

import {
  register,
  login,
  me,
  forgotPassword,
  resetPassword,
} from "../controllers/auth.controller";

import {
  requireAuth,
} from "../middleware/auth.middleware";

const router = Router();

router.post("/register", register);

router.post("/login", login);

router.post(
  "/forgot-password",
  forgotPassword
);

router.post(
  "/reset-password",
  resetPassword
);

router.get("/me", requireAuth, me);

export default router;