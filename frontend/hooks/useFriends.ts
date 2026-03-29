"use client";

import { useEffect, useState } from "react";
import { friendsApi, type FriendResponse, type FriendRequestResponse } from "@/lib/friends";

/**
 * Hook to fetch friends list from backend
 */
export function useFriends() {
  const [friends, setFriends] = useState<FriendResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFriends() {
      try {
        setIsLoading(true);
        const data = await friendsApi.listFriends();
        setFriends(data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch friends:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch friends");
        setFriends([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchFriends();
  }, []);

  return { friends, isLoading, error };
}

/**
 * Hook to fetch incoming friend requests from backend
 */
export function useIncomingFriendRequests() {
  const [requests, setRequests] = useState<FriendRequestResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRequests() {
      try {
        setIsLoading(true);
        const data = await friendsApi.listIncomingRequests();
        setRequests(data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch friend requests:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch friend requests");
        setRequests([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchRequests();
  }, []);

  return { requests, isLoading, error };
}

/**
 * Hook to fetch outgoing friend requests from backend
 */
export function useOutgoingFriendRequests() {
  const [requests, setRequests] = useState<FriendRequestResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRequests() {
      try {
        setIsLoading(true);
        const data = await friendsApi.listOutgoingRequests();
        setRequests(data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch outgoing requests:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch outgoing requests");
        setRequests([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchRequests();
  }, []);

  return { requests, isLoading, error };
}

/**
 * Hook to manage friend actions
 */
export function useFriendsActions() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendFriendRequest(userId: string) {
    try {
      setIsLoading(true);
      const data = await friendsApi.sendRequest(userId);
      setError(null);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to send friend request";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }

  async function acceptFriendRequest(requestId: string) {
    try {
      setIsLoading(true);
      const data = await friendsApi.acceptRequest(requestId);
      setError(null);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to accept friend request";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }

  async function declineFriendRequest(requestId: string) {
    try {
      setIsLoading(true);
      await friendsApi.declineRequest(requestId);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to decline friend request";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }

  async function removeFriend(friendUserId: string) {
    try {
      setIsLoading(true);
      await friendsApi.removeFriend(friendUserId);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to remove friend";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }

  return {
    isLoading,
    error,
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    removeFriend,
  };
}
