import { api } from "@/lib/api";
import type { User } from "@/types";

export type FriendRequestStatus = "PENDING" | "ACCEPTED" | "DECLINED" | "CANCELED";

export type FriendRequestResponse = {
  id: string;
  requester: User;
  receiver: User;
  status: FriendRequestStatus;
  createdAt: string;
  respondedAt?: string;
};

export type FriendResponse = {
  user: User;
  friendsSince: string;
};

export const friendsApi = {
  listFriends: () => api.get<FriendResponse[]>("/friends"),
  listIncomingRequests: () => api.get<FriendRequestResponse[]>("/friends/requests/incoming"),
  listOutgoingRequests: () => api.get<FriendRequestResponse[]>("/friends/requests/outgoing"),
  searchUsers: (query: string) => api.get<User[]>(`/users/search?query=${encodeURIComponent(query)}`),
  sendRequest: (targetUserId: string) => api.post<FriendRequestResponse>("/friends/requests", { targetUserId }),
  acceptRequest: (requestId: string) => api.post<FriendRequestResponse>(`/friends/requests/${requestId}/accept`),
  declineRequest: (requestId: string) => api.post<FriendRequestResponse>(`/friends/requests/${requestId}/decline`),
  removeFriend: (friendUserId: string) => api.delete<void>(`/friends/${friendUserId}`),
};
