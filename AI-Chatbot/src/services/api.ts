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

export interface ApiError {
  error: string;
  status?: number;
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
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
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
    model: "llama" | "mistral" | "deepseek" | "phi3" | "gemma" | "qwen",
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
    models: any[];
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
