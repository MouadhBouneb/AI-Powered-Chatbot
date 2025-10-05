import { Router } from "express";
import { listAvailableModels } from "../controllers/models.controller";

const router = Router();

// Public endpoint - no auth required to see available models
router.get("/", listAvailableModels);

export default router;
