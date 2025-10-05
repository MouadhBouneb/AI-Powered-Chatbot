import { ChatRepository } from "../repositories/chat.repo";
import { getAIProvider } from "./ai/providers";
import { cacheService } from "./cache.service";
import { validateMessagesForSaving } from "../utils/validation.utils";
import type { ChatMessage, ModelType, Language } from "../types";
import { CACHE_CONFIG } from "../constants";

/**
 * Service layer for chat operations
 * Handles business logic for creating, listing, and managing chats
 */
export class ChatService {
  private readonly chatRepository: ChatRepository;

  constructor() {
    this.chatRepository = new ChatRepository();
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  /**
   * Gets or generates AI response with caching
   */
  private async getAIResponse(
    model: ModelType,
    messages: ChatMessage[],
    language: Language
  ): Promise<string> {
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage) {
      throw new Error("No messages provided");
    }

    // Check cache first
    const cachedResponse = await cacheService.getCachedAIResponse(
      model,
      lastMessage.content,
      language
    );

    if (cachedResponse) {
      return cachedResponse;
    }

    // Generate new response
    const provider = await getAIProvider(model);
    const reply = await provider.generate(messages, language);

    // Cache the response
    await cacheService.cacheAIResponse(
      model,
      lastMessage.content,
      reply,
      language,
      CACHE_CONFIG.AI_RESPONSE_TTL
    );

    return reply;
  }

  /**
   * Caches AI response for future use
   */
  private async cacheAIResponse(
    model: ModelType,
    userMessage: string,
    assistantMessage: string,
    language: Language
  ): Promise<void> {
    await cacheService.cacheAIResponse(
      model,
      userMessage,
      assistantMessage,
      language,
      CACHE_CONFIG.AI_RESPONSE_TTL
    );
  }

  /**
   * Invalidates user's chat cache after modifications
   */
  private async invalidateUserChatCache(userId: string): Promise<void> {
    console.log(`🗑️ Invalidating cache for user ${userId}`);
    await cacheService.invalidateUserCache(userId);
  }

  // ============================================================================
  // Public Methods
  // ============================================================================

  /**
   * Creates a new chat with AI-generated response
   */
  async createChatWithAI(
    userId: string,
    model: ModelType,
    messages: ChatMessage[],
    language: Language
  ) {
    const reply = await this.getAIResponse(model, messages, language);

    const assistantMessage: ChatMessage = {
      role: "assistant",
      content: reply,
    };

    const chat = await this.chatRepository.createWithMessages({
      userId,
      model,
      language,
      messages: [...messages, assistantMessage],
    });

    await this.invalidateUserChatCache(userId);

    return chat;
  }

  /**
   * Lists all chats for a user (with caching)
   */
  async listUserChats(userId: string) {
    // Check cache first
    const cachedChats = await cacheService.getCachedChatHistory(userId);
    if (cachedChats) {
      console.log(
        `📦 Returning ${cachedChats.length} chats from cache for user ${userId}`
      );
      return cachedChats;
    }

    // Fetch from database
    const chats = await this.chatRepository.listByUser(userId);
    console.log(
      `💾 Fetched ${chats.length} chats from database for user ${userId}`
    );

    // Cache for future requests
    await cacheService.cacheChatHistory(
      userId,
      chats,
      CACHE_CONFIG.CHAT_HISTORY_TTL
    );

    return chats;
  }

  /**
   * Adds a new message to an existing chat with AI response
   */
  async addMessageToChat(
    userId: string,
    chatId: string,
    model: ModelType,
    messages: ChatMessage[],
    language: Language
  ) {
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage) {
      throw new Error("No messages provided");
    }

    const reply = await this.getAIResponse(model, messages, language);

    const assistantMessage: ChatMessage = {
      role: "assistant",
      content: reply,
    };

    const chat = await this.chatRepository.addMessagesToChat(chatId, userId, [
      lastMessage,
      assistantMessage,
    ]);

    await this.invalidateUserChatCache(userId);

    return chat;
  }

  /**
   * Deletes a chat and invalidates cache
   */
  async deleteChat(chatId: string, userId: string) {
    const result = await this.chatRepository.delete(chatId, userId);
    await this.invalidateUserChatCache(userId);
    return result;
  }

  /**
   * Saves chat after streaming completes
   * Used by the streaming endpoint to persist the streamed conversation
   */
  async saveChatAfterStreaming(
    userId: string,
    model: ModelType,
    messages: ChatMessage[],
    language: Language,
    chatId?: string
  ) {
    const { userMessage, assistantMessage } =
      validateMessagesForSaving(messages);

    // Cache the AI response
    await this.cacheAIResponse(
      model,
      userMessage.content,
      assistantMessage.content,
      language
    );

    // Save to database
    const chat = chatId
      ? await this.chatRepository.addMessagesToChat(chatId, userId, [
          userMessage,
          assistantMessage,
        ])
      : await this.chatRepository.createWithMessages({
          userId,
          model,
          language,
          messages,
        });

    await this.invalidateUserChatCache(userId);

    return chat;
  }
}
