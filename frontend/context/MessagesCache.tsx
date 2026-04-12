"use client";

import { createContext, useContext, useRef, ReactNode, useEffect, useState } from "react";
import { dmApi } from "@/lib/dms";
import type { Message } from "@/types";

type MessagesCacheContextValue = {
  getMessages: (userId: string) => Message[] | null;
  setMessages: (userId: string, messages: Message[]) => void;
  addMessage: (userId: string, message: Message) => void;
  updateMessage: (userId: string, messageId: string, updates: Partial<Message>) => void;
  deleteMessage: (userId: string, messageId: string) => void;
  isLoadingMessages: (userId: string) => boolean;
  loadMessages: (userId: string) => Promise<Message[]>;
  clearMessages: (userId: string) => void;
  clearAllMessages: () => void;
};

const MessagesCacheContext = createContext<MessagesCacheContextValue | null>(null);

const CACHE_PREFIX = "messagesCache_";
const LOADING_STATES_KEY = "messagesLoadingStates";

export function MessagesCacheProvider({ children }: { children: ReactNode }) {
  const messageCacheRef = useRef<Map<string, Message[]>>(new Map());
  const loadingStatesRef = useRef<Map<string, boolean>>(new Map());
  const [, forceRender] = useState({});

  useEffect(() => {
    try {
      const keys = Object.keys(localStorage);
      for (const key of keys) {
        if (key.startsWith(CACHE_PREFIX)) {
          const userId = key.replace(CACHE_PREFIX, "");
          const data = localStorage.getItem(key);
          if (data) {
            messageCacheRef.current.set(userId, JSON.parse(data));
          }
        }
      }
    } catch (e) {
      console.error("Failed to load message cache from localStorage:", e);
    }
  }, []);

  const getMessages = (userId: string) => {
    const cached = messageCacheRef.current.get(userId);
    return cached !== undefined ? cached : null;
  };

  const setMessages = (userId: string, messages: Message[]) => {
    messageCacheRef.current.set(userId, messages);
    try {
      localStorage.setItem(CACHE_PREFIX + userId, JSON.stringify(messages));
    } catch (e) {
      console.error("Failed to save messages to localStorage:", e);
    }
  };

  const addMessage = (userId: string, message: Message) => {
    const current = messageCacheRef.current.get(userId) || [];
    const updated = [...current, message];
    messageCacheRef.current.set(userId, updated);
    try {
      localStorage.setItem(CACHE_PREFIX + userId, JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to save messages to localStorage:", e);
    }
  };

  const updateMessage = (userId: string, messageId: string, updates: Partial<Message>) => {
    const current = messageCacheRef.current.get(userId) || [];
    const updated = current.map(m => m.id === messageId ? { ...m, ...updates } : m);
    messageCacheRef.current.set(userId, updated);
    try {
      localStorage.setItem(CACHE_PREFIX + userId, JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to save messages to localStorage:", e);
    }
  };

  const deleteMessage = (userId: string, messageId: string) => {
    const current = messageCacheRef.current.get(userId) || [];
    const updated = current.filter(m => m.id !== messageId);
    messageCacheRef.current.set(userId, updated);
    try {
      localStorage.setItem(CACHE_PREFIX + userId, JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to save messages to localStorage:", e);
    }
  };

  const isLoadingMessages = (userId: string) => {
    return loadingStatesRef.current.get(userId) || false;
  };

  const loadMessages = async (userId: string): Promise<Message[]> => {
    const cached = messageCacheRef.current.get(userId);

    loadingStatesRef.current.set(userId, true);
    forceRender({});

    try {
      const messages = await dmApi.getMessages(userId);
      messageCacheRef.current.set(userId, messages);
      try {
        localStorage.setItem(CACHE_PREFIX + userId, JSON.stringify(messages));
      } catch (e) {
        console.error("Failed to save messages to localStorage:", e);
      }
      loadingStatesRef.current.set(userId, false);
      forceRender({});
      return messages;
    } catch (error) {
      console.error("Failed to load messages:", error);
      const fallback = cached ?? [];
      messageCacheRef.current.set(userId, fallback);
      loadingStatesRef.current.set(userId, false);
      forceRender({});
      return fallback;
    }
  };

  const clearMessages = (userId: string) => {
    messageCacheRef.current.delete(userId);
    try {
      localStorage.removeItem(CACHE_PREFIX + userId);
    } catch (e) {
      console.error("Failed to clear localStorage:", e);
    }
  };

  const clearAllMessages = () => {
    messageCacheRef.current.clear();
    const keys = Object.keys(localStorage);
    for (const key of keys) {
      if (key.startsWith(CACHE_PREFIX)) {
        try {
          localStorage.removeItem(key);
        } catch (e) {
          console.error("Failed to clear localStorage:", e);
        }
      }
    }
  };

  return (
    <MessagesCacheContext.Provider value={{
      getMessages,
      setMessages,
      addMessage,
      updateMessage,
      deleteMessage,
      isLoadingMessages,
      loadMessages,
      clearMessages,
      clearAllMessages,
    }}>
      {children}
    </MessagesCacheContext.Provider>
  );
}

export function useMessagesCache() {
  const context = useContext(MessagesCacheContext);
  if (!context) {
    throw new Error("useMessagesCache must be used within MessagesCacheProvider");
  }
  return context;
}