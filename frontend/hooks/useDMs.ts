"use client";

import { useEffect, useState } from "react";
import { dmApi, type DMConversation } from "@/lib/dms";
import type { Message } from "@/types";

/**
 * Hook to fetch DM conversations from backend
 */
export function useDMConversations() {
  const [conversations, setConversations] = useState<DMConversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchConversations() {
      try {
        setIsLoading(true);
        const data = await dmApi.listConversations();
        setConversations(data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch DM conversations:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch DM conversations");
        setConversations([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchConversations();
  }, []);

  return { conversations, isLoading, error };
}

/**
 * Hook to fetch messages in a DM conversation from backend
 */
export function useDMMessages(userId: string | undefined) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setMessages([]);
      setIsLoading(false);
      return;
    }

    async function fetchMessages() {
      try {
        setIsLoading(true);
        if (!userId) {
          setMessages([]);
          setError(null);
          return;
        }
        const data = await dmApi.getMessages(userId);
        setMessages(data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch DM messages:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch DM messages");
        setMessages([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchMessages();
  }, [userId]);

  return { messages, isLoading, error };
}

/**
 * Hook to manage DM actions
 */
export function useDMActions() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendMessage(userId: string, content: string) {
    try {
      setIsLoading(true);
      const data = await dmApi.sendMessage(userId, content);
      setError(null);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to send message";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }

  return { isLoading, error, sendMessage };
}
