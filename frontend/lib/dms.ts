import { api } from "@/lib/api";
import type { Message, User } from "@/types";

export type DMConversation = {
  channelId: string;
  user: User;
  lastMessage?: string;
  lastMessageAt?: string;
};

export const dmApi = {
  listConversations: () => api.get<DMConversation[]>("/dms/conversations"),
  getMessages: (userId: string) => api.get<Message[]>(`/dms/${userId}/messages`),
  sendMessage: (userId: string, content: string) =>
    api.post<Message>(`/dms/${userId}/messages`, { content }),
};
