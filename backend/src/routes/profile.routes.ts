import { Router } from "express";
import { requireAuth, attachUser } from "../middleware/auth";
import {
  getProfile,
  updatePreferences,
  generateSummary,
} from "../controllers/profile.controller";

const router = Router();

// Use attachUser middleware to load full user data including language preference
router.get("/", requireAuth, attachUser, getProfile);
router.post("/preferences", requireAuth, attachUser, updatePreferences);
router.post("/summary", requireAuth, attachUser, generateSummary);

export default router;
