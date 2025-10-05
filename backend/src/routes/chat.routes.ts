import { Router } from "express";
import { requireAuth, attachUser } from "../middleware/auth";
import {
  createChat,
  createChatStream,
  listChats,
  deleteChat,
} from "../controllers/chat.controller";

const router = Router();

router.post("/", requireAuth, attachUser, createChat);
router.post("/stream", requireAuth, attachUser, createChatStream);
router.get("/", requireAuth, listChats);
router.delete("/:id", requireAuth, deleteChat);

export default router;
