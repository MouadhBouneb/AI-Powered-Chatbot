import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: (failureCount, error: any) => {
        // Don't retry on 401/403 errors
        if (error?.status === 401 || error?.status === 403) {
          return false;
        }
        return failureCount < 3;
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
});

// Query keys factory for better organization
export const queryKeys = {
  auth: {
    profile: ["auth", "profile"] as const,
  },
  chats: {
    all: ["chats"] as const,
    list: () => [...queryKeys.chats.all, "list"] as const,
    detail: (id: string) => [...queryKeys.chats.all, "detail", id] as const,
  },
  profile: {
    summary: ["profile", "summary"] as const,
    stats: ["profile", "stats"] as const,
  },
} as const;
