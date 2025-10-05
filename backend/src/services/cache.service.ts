import { createClient, type RedisClientType } from "redis";

class CacheService {
  private client: RedisClientType | null = null;
  private isConnected = false;

  async connect(): Promise<void> {
    if (this.isConnected) return;

    try {
      this.client = createClient({
        url: process.env.REDIS_URL || "redis://localhost:6379",
        socket: {
          reconnectStrategy: (retries) => Math.min(retries * 50, 1000),
        },
      });

      this.client.on("error", (err) => {
        console.error("Redis Client Error:", err);
        this.isConnected = false;
      });

      this.client.on("connect", () => {
        console.log("Redis Client Connected");
        this.isConnected = true;
      });

      await this.client.connect();
    } catch (error) {
      console.warn("Redis connection failed, using in-memory cache:", error);
      this.isConnected = false;
    }
  }

  async get(key: string): Promise<string | null> {
    if (!this.isConnected || !this.client) return null;

    try {
      return await this.client.get(key);
    } catch (error) {
      console.error("Redis GET error:", error);
      return null;
    }
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (!this.isConnected || !this.client) return;

    try {
      if (ttlSeconds) {
        await this.client.setEx(key, ttlSeconds, value);
      } else {
        await this.client.set(key, value);
      }
    } catch (error) {
      console.error("Redis SET error:", error);
    }
  }

  async del(key: string): Promise<void> {
    if (!this.isConnected || !this.client) return;

    try {
      await this.client.del(key);
    } catch (error) {
      console.error("Redis DEL error:", error);
    }
  }

  async exists(key: string): Promise<boolean> {
    if (!this.isConnected || !this.client) return false;

    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      console.error("Redis EXISTS error:", error);
      return false;
    }
  }

  // Cache helper methods
  async cacheUserProfile(
    userId: string,
    profile: any,
    ttlSeconds = 300
  ): Promise<void> {
    const key = `user:profile:${userId}`;
    await this.set(key, JSON.stringify(profile), ttlSeconds);
  }

  async getCachedUserProfile(userId: string): Promise<any | null> {
    const key = `user:profile:${userId}`;
    const cached = await this.get(key);
    return cached ? JSON.parse(cached) : null;
  }

  async cacheChatHistory(
    userId: string,
    chats: any[],
    ttlSeconds = 600
  ): Promise<void> {
    const key = `user:chats:${userId}`;
    await this.set(key, JSON.stringify(chats), ttlSeconds);
  }

  async getCachedChatHistory(userId: string): Promise<any[] | null> {
    const key = `user:chats:${userId}`;
    const cached = await this.get(key);
    return cached ? JSON.parse(cached) : null;
  }

  async cacheAIResponse(
    model: string,
    prompt: string,
    response: string,
    language: string,
    ttlSeconds = 3600
  ): Promise<void> {
    const key = `ai:response:${model}:${language}:${Buffer.from(prompt)
      .toString("base64")
      .slice(0, 50)}`;
    await this.set(key, response, ttlSeconds);
  }

  async getCachedAIResponse(
    model: string,
    prompt: string,
    language: string
  ): Promise<string | null> {
    const key = `ai:response:${model}:${language}:${Buffer.from(prompt)
      .toString("base64")
      .slice(0, 50)}`;
    return await this.get(key);
  }

  async invalidateUserCache(userId: string): Promise<void> {
    const keys = [`user:profile:${userId}`, `user:chats:${userId}`];

    for (const key of keys) {
      await this.del(key);
    }
  }

  async disconnect(): Promise<void> {
    if (this.client && this.isConnected) {
      await this.client.disconnect();
      this.isConnected = false;
    }
  }
}

export const cacheService = new CacheService();
