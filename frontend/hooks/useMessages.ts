"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { mockMessages } from "@/lib/mock";
import type { Message } from "@/types";

/**
 * Hook to fetch messages for a channel from backend.
 * Falls back to mock data if API is not ready.
 *
 * @param channelId - The channel to fetch messages for
 * @returns {messages, isLoading, error}
 */
export function useMessages(channelId: string | undefined) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!channelId) {
      setMessages([]);
      setIsLoading(false);
      return;
    }

    async function fetchMessages() {
      try {
        setIsLoading(true);
        // Guilds/channels not yet in backend - using mock data
        const channelMessages = mockMessages.filter((m) => m.channelId === channelId);
        setMessages(channelMessages);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch messages:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch messages");
      } finally {
        setIsLoading(false);
      }
    }

    fetchMessages();
  }, [channelId]);

  return { messages, isLoading, error };
}
