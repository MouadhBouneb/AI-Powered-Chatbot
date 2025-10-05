import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi, chatApi, profileApi } from "../services/api";
import { queryKeys } from "../lib/queryClient";

// Auth hooks
export const useAuth = () => {
  const queryClient = useQueryClient();

  const profileQuery = useQuery({
    queryKey: queryKeys.auth.profile,
    queryFn: () => profileApi.getProfile(),
    enabled: authApi.isAuthenticated(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const signupMutation = useMutation({
    mutationFn: ({
      email,
      password,
      name,
      language,
    }: {
      email: string;
      password: string;
      name: string;
      language: "en" | "ar";
    }) => authApi.signup(email, password, name, language),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.profile });
    },
  });

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authApi.login(email, password),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.profile });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      queryClient.clear();
    },
  });

  return {
    user: profileQuery.data?.user,
    summary: profileQuery.data?.summary,
    stats: profileQuery.data?.stats,
    loading: profileQuery.isLoading,
    isAuthenticated: authApi.isAuthenticated(),
    signUp: async (
      email: string,
      password: string,
      name: string,
      language: "en" | "ar"
    ) => {
      await signupMutation.mutateAsync({ email, password, name, language });
    },
    signIn: async (email: string, password: string) => {
      await loginMutation.mutateAsync({ email, password });
    },
    signOut: async () => {
      await logoutMutation.mutateAsync();
    },
    updateLanguage: async (language: "en" | "ar") => {
      await profileApi.updateProfile({ language });
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.profile });
    },
    isSigningUp: signupMutation.isPending,
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    signupError: signupMutation.error,
    loginError: loginMutation.error,
  };
};

// Chat hooks
export const useChats = () => {
  return useQuery({
    queryKey: queryKeys.chats.list(),
    queryFn: () => chatApi.listChats(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useCreateChat = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      model,
      messages,
      chatId,
    }: {
      model: "llama" | "mistral" | "deepseek" | "phi3" | "gemma" | "qwen";
      messages: { role: "user" | "assistant"; content: string }[];
      chatId?: string;
    }) => {
      return await chatApi.createChat(model, messages, chatId);
    },
    onSuccess: async (data) => {
      queryClient.setQueryData(queryKeys.chats.list(), (oldData: any) => {
        if (!oldData?.chats) {
          return { chats: [data.chat] };
        }

        const existingIndex = oldData.chats.findIndex(
          (chat: any) => chat.id === data.chat.id
        );

        if (existingIndex >= 0) {
          const newChats = [...oldData.chats];
          newChats[existingIndex] = data.chat;
          return { chats: newChats };
        } else {
          return { chats: [data.chat, ...oldData.chats] };
        }
      });
    },
    onError: (error) => {
      console.error("❌ Chat operation failed:", error);
    },
  });
};

export const useDeleteChat = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (chatId: string) => {
      await chatApi.deleteChat(chatId);
      return chatId;
    },
    onSuccess: async (deletedChatId) => {
      queryClient.setQueryData(queryKeys.chats.list(), (oldData: any) => {
        if (!oldData?.chats) return oldData;

        const newChats = oldData.chats.filter(
          (chat: any) => chat.id !== deletedChatId
        );

        return { chats: newChats };
      });
    },
    onError: (error) => {
      console.error("❌ Chat deletion failed:", error);
    },
  });
};

// Profile hooks
export const useProfile = () => {
  return useQuery({
    queryKey: queryKeys.auth.profile,
    queryFn: () => profileApi.getProfile(),
    enabled: authApi.isAuthenticated(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: { name?: string; language?: "en" | "ar" }) => {
      return await profileApi.updateProfile(updates);
    },
    onSuccess: async (data, variables) => {
      queryClient.setQueryData(queryKeys.auth.profile, (oldData: any) => {
        if (!oldData) return oldData;

        return {
          ...oldData,
          user: {
            ...oldData.user,
            ...variables,
          },
        };
      });
    },
    onError: (error) => {
      console.error("❌ Profile update failed:", error);
    },
  });
};

export const useGenerateSummary = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      return await profileApi.generateSummary();
    },
    onSuccess: async (data) => {
      queryClient.setQueryData(queryKeys.auth.profile, (oldData: any) => {
        if (!oldData) return oldData;

        return {
          ...oldData,
          summary: data.summary,
        };
      });
    },
    onError: (error) => {
      console.error("❌ Summary generation failed:", error);
    },
  });
};
