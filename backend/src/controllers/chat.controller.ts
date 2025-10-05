import type { Request, Response } from "express";
import { z } from "zod";
import { ChatService } from "../services/chat.service";
import {
  validateRequest,
  getUserLanguage,
  getTranslator,
  sendSuccess,
  asyncHandler,
} from "../utils/controller";

const chatSchema = z.object({
  chatId: z.string().optional(),
  model: z
    .enum([
      "llama",
      "mistral",
      "deepseek",
      "phi3",
      "gemma",
      "qwen",
      "tinyllama",
    ])
    .default("llama"),
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1),
      })
    )
    .min(1),
});

const service = new ChatService();

export const createChat = asyncHandler(async (req: Request, res: Response) => {
  const data = validateRequest(req, res, chatSchema);
  if (!data) return;

  const { chatId, model, messages } = data;
  const language = getUserLanguage(req);
  const t = getTranslator(req);

  const chat = chatId
    ? await service.addMessageToChat(
        req.user!.id,
        chatId,
        model,
        messages,
        language
      )
    : await service.createChatWithAI(req.user!.id, model, messages, language);

  sendSuccess(res, { chat }, t("chat_saved"));
});

export const listChats = asyncHandler(async (req: Request, res: Response) => {
  const chats = await service.listUserChats(req.user!.id);
  sendSuccess(res, { chats });
});

export const deleteChat = asyncHandler(async (req: Request, res: Response) => {
  const t = getTranslator(req);
  const chatId = req.params.id;

  if (!chatId) {
    return res.status(400).json({ error: t("error_invalid_input") });
  }

  try {
    await service.deleteChat(chatId, req.user!.id);
    sendSuccess(res, {}, t("chat_deleted"));
  } catch (error) {
    console.error("❌ Delete chat error:", error);
    res.status(404).json({ error: t("error_not_found") });
  }
});
