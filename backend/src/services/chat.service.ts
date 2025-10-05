import { ChatRepository } from "../repositories/chat.repo";
import { getAIProvider } from "./ai/providers";
import { cacheService } from "./cache.service";
import type { ChatMessage, ModelType, Language } from "../types";
import { CACHE_CONFIG } from "../constants";

export class ChatService {
  private chats = new ChatRepository();

  async createChatWithAI(
    userId: string,
    model: ModelType,
    messages: ChatMessage[],
    language: Language
  ) {
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage) throw new Error("No messages provided");

    let reply = await cacheService.getCachedAIResponse(
      model,
      lastMessage.content,
      language
    );

    if (!reply) {
      const provider = await getAIProvider(model);
      reply = await provider.generate(messages, language);

      await cacheService.cacheAIResponse(
        model,
        lastMessage.content,
        reply,
        language,
        CACHE_CONFIG.AI_RESPONSE_TTL
      );
    }

    const chat = await this.chats.createWithMessages({
      userId,
      model,
      language,
      messages: messages.concat([{ role: "assistant", content: reply }]),
    });

    // Invalidate user's chat cache
    await cacheService.invalidateUserCache(userId);

    return chat;
  }

  async listUserChats(userId: string) {
    // Check cache first
    const cached = await cacheService.getCachedChatHistory(userId);
    if (cached) {
      return cached;
    }

    const chats = await this.chats.listByUser(userId);

    // Cache the result for 10 minutes
    await cacheService.cacheChatHistory(userId, chats, 600);

    return chats;
  }

  async addMessageToChat(
    userId: string,
    chatId: string,
    model: ModelType,
    messages: ChatMessage[],
    language: Language
  ) {
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage) throw new Error("No messages provided");

    let reply = await cacheService.getCachedAIResponse(
      model,
      lastMessage.content,
      language
    );

    if (!reply) {
      const provider = await getAIProvider(model);
      reply = await provider.generate(messages, language);

      await cacheService.cacheAIResponse(
        model,
        lastMessage.content,
        reply,
        language,
        CACHE_CONFIG.AI_RESPONSE_TTL
      );
    }

    const chat = await this.chats.addMessagesToChat(chatId, userId, [
      lastMessage,
      { role: "assistant", content: reply },
    ]);

    // Invalidate user's chat cache
    await cacheService.invalidateUserCache(userId);

    return chat;
  }

  async deleteChat(chatId: string, userId: string) {
    const result = await this.chats.delete(chatId, userId);

    // Invalidate user's chat cache
    await cacheService.invalidateUserCache(userId);

    return result;
  }
}
