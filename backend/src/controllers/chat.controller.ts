import type { Request, Response } from "express";
import { z } from "zod";
import { ChatService } from "../services/chat.service";
import { summarizeUser } from "../services/summary";
import { SummaryRepository } from "../repositories/summary.repo";
import {
  validateRequest,
  getUserLanguage,
  getTranslator,
  sendSuccess,
  asyncHandler,
} from "../utils/controller";
import { generateWithOllamaStream } from "../utils/ollama";
import {
  setStreamingHeaders,
  sendSSEChunk,
  sendSSEError,
} from "../utils/sse.utils";
import { getLastUserMessage } from "../utils/validation.utils";
import { MODEL_NAMES } from "../constants";
import type { ChatMessage } from "../types";

// ============================================================================
// Validation Schemas
// ============================================================================

const chatSchema = z.object({
  chatId: z.string().optional(),
  model: z
    .enum(["llama", "phi3", "gemma", "qwen", "tinyllama"])
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

// ============================================================================
// Service Instances
// ============================================================================

const chatService = new ChatService();
const summaryRepository = new SummaryRepository();

// ============================================================================
// Controller Functions
// ============================================================================

/**
 * Creates a new chat or adds message to existing chat (non-streaming)
 * @route POST /api/chat
 */
export const createChat = asyncHandler(async (req: Request, res: Response) => {
  const data = validateRequest(req, res, chatSchema);
  if (!data) return;

  const { chatId, model, messages } = data;
  const language = getUserLanguage(req);
  const t = getTranslator(req);
  const userId = req.user!.id;

  const chat = chatId
    ? await chatService.addMessageToChat(
        userId,
        chatId,
        model,
        messages,
        language
      )
    : await chatService.createChatWithAI(userId, model, messages, language);

  sendSuccess(res, { chat }, t("chat_saved"));
});

/**
 * Lists all chats for the authenticated user
 * @route GET /api/chat
 */
export const listChats = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const chats = await chatService.listUserChats(userId);
  sendSuccess(res, { chats });
});

/**
 * Deletes a specific chat
 * @route DELETE /api/chat/:id
 */
export const deleteChat = asyncHandler(async (req: Request, res: Response) => {
  const t = getTranslator(req);
  const chatId = req.params.id;
  const userId = req.user!.id;

  if (!chatId) {
    return res.status(400).json({ error: t("error_invalid_input") });
  }

  try {
    await chatService.deleteChat(chatId, userId);
    sendSuccess(res, {}, t("chat_deleted"));
  } catch (error) {
    console.error("❌ Delete chat error:", error);
    res.status(404).json({ error: t("error_not_found") });
  }
});

/**
 * Streaming endpoint for real-time AI responses
 * Uses Server-Sent Events (SSE) to stream chunks as they're generated
 * @route POST /api/chat/stream
 */
export const createChatStream = asyncHandler(
  async (req: Request, res: Response) => {
    const data = validateRequest(req, res, chatSchema);
    if (!data) return;

    const { chatId, model, messages } = data;
    const language = getUserLanguage(req);
    const userId = req.user!.id;

    setStreamingHeaders(res);

    try {
      const modelName = MODEL_NAMES[model];
      let fullResponse = "";

      // Stream the response chunks
      for await (const chunk of generateWithOllamaStream(
        modelName,
        messages,
        language
      )) {
        fullResponse += chunk;
        sendSSEChunk(res, { chunk, done: false });
      }

      // Extract user message and create assistant message
      const lastUserMessage = getLastUserMessage(messages);
      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: fullResponse,
      };

      // Save conversation to database and cache
      const chat = await chatService.saveChatAfterStreaming(
        userId,
        model,
        [lastUserMessage, assistantMessage],
        language,
        chatId
      );

      // Generate summary asynchronously (don't block response)
      summarizeUser(userId)
        .then(async ({ en, ar }) => {
          await summaryRepository.upsert(userId, en, ar, language);
        })
        .catch((err) => {
          console.error("Summary generation failed:", err);
        });

      // Send completion event with chat metadata
      const completionData: any = {
        chunk: "",
        done: true,
        fullResponse,
        summaryUpdating: true, // Let frontend know summary is being updated
      };

      if (chat) {
        completionData.chat = { id: chat.id, title: chat.title };
      } else {
        // No chat data to send
      }

      sendSSEChunk(res, completionData);
      res.end();
    } catch (error: any) {
      console.error("❌ Streaming error:", error);
      sendSSEError(res, error);
    }
  }
);
