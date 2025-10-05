const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

// Types
export interface User {
  id: string;
  email: string;
  name?: string;
  language: "en" | "ar";
  createdAt: string;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

export interface Chat {
  id: string;
  title: string;
  model: string;
  language: string;
  createdAt: string;
  messages: Message[];
}

export interface UserSummary {
  content: string;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// Helper to get auth token
const getToken = (): string | null => {
  return localStorage.getItem("auth_token");
};

// Helper to set auth token
const setToken = (token: string): void => {
  localStorage.setItem("auth_token", token);
};

// Helper to clear auth token
const clearToken = (): void => {
  localStorage.removeItem("auth_token");
};

// Enhanced error handling
class ApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

// Helper for authenticated requests with better error handling
const authFetch = async (url: string, options: RequestInit = {}) => {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_URL}${url}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ error: "Request failed" }));
      throw new ApiError(
        errorData.error || `HTTP ${response.status}`,
        response.status
      );
    }

    return response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError("Network error occurred");
  }
};

// Auth API
export const authApi = {
  async signup(
    email: string,
    password: string,
    name: string,
    language: "en" | "ar"
  ): Promise<AuthResponse> {
    const data = await authFetch("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ email, password, name, language }),
    });
    setToken(data.token);
    return data;
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const data = await authFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    setToken(data.token);
    return data;
  },

  async logout(): Promise<void> {
    clearToken();
  },

  isAuthenticated(): boolean {
    return !!getToken();
  },
};

// Chat API
export const chatApi = {
  async createChat(
    model: "llama" | "phi3" | "gemma" | "qwen" | "tinyllama",
    messages: { role: "user" | "assistant"; content: string }[],
    chatId?: string
  ): Promise<{ chat: Chat; message: string }> {
    return authFetch("/chat", {
      method: "POST",
      body: JSON.stringify({ model, messages, chatId }),
    });
  },

  async listChats(): Promise<{ chats: Chat[] }> {
    return authFetch("/chat");
  },

  async deleteChat(chatId: string): Promise<void> {
    return authFetch(`/chat/${chatId}`, {
      method: "DELETE",
    });
  },

  /**
   * Stream chat responses in real-time using Server-Sent Events
   */
  async *createChatStream(
    model: "llama" | "phi3" | "gemma" | "qwen" | "tinyllama",
    messages: { role: "user" | "assistant"; content: string }[],
    chatId?: string
  ): AsyncGenerator<
    { chunk?: string; chat?: { id: string; title: string } },
    void,
    unknown
  > {
    const token = getToken();
    const response = await fetch(`${API_URL}/chat/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ model, messages, chatId }),
    });

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ error: "Request failed" }));
      throw new ApiError(
        errorData.error || `HTTP ${response.status}`,
        response.status
      );
    }

    if (!response.body) {
      throw new ApiError("Response body is null");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const parsed = JSON.parse(line.slice(6));

              if (parsed.error) {
                throw new ApiError(parsed.error);
              }

              if (parsed.chunk) {
                yield { chunk: parsed.chunk };
              }

              if (parsed.done) {
                if (parsed.chat) {
                  yield { chat: parsed.chat };
                }
                return;
              }
            } catch (e) {
              if (e instanceof ApiError) throw e;
              // Skip invalid JSON lines
              continue;
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  },
};

// Profile API
export const profileApi = {
  async getProfile(): Promise<{
    user: User;
    summary?: UserSummary;
    stats: { totalChats: number };
  }> {
    return authFetch("/profile");
  },

  async updateProfile(updates: {
    name?: string;
    language?: "en" | "ar";
  }): Promise<{ user: User }> {
    return authFetch("/profile/preferences", {
      method: "POST",
      body: JSON.stringify(updates),
    });
  },

  async generateSummary(): Promise<{ summary: UserSummary }> {
    return authFetch("/profile/summary", {
      method: "POST",
    });
  },
};

// Models API
export const modelsApi = {
  async listModels(): Promise<{
    models: Array<{ id: string; type: string; name: string }>;
    count: number;
    fallback?: boolean;
  }> {
    try {
      const response = await fetch(`${API_URL}/models`);
      return response.json();
    } catch (error) {
      console.error("Error fetching models:", error);
      return {
        models: [
          { id: "llama3:8b", type: "llama", name: "LLaMA 3 8B" },
          { id: "mistral:7b", type: "mistral", name: "Mistral 7B" },
          { id: "deepseek-r1:8b", type: "deepseek", name: "DeepSeek R1 8B" },
        ],
        count: 3,
        fallback: true,
      };
    }
  },
};

export { setToken, clearToken, getToken };
