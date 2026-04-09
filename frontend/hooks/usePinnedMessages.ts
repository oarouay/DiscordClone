"use client";

import { useState, useCallback } from "react";
import type { Message } from "@/types";

const MAX_PINNED_MESSAGES = 10;
const STORAGE_KEY_PREFIX = "pinned_";

export function usePinnedMessages(channelId: string) {
  const storageKey = `${STORAGE_KEY_PREFIX}${channelId}`;

  const [pinned, setPinned] = useState<Message[]>(() => {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : [];
  });

  // Pin a message (add to front, max 10)
  const pin = useCallback(
    (message: Message) => {
      setPinned((prev) => {
        // Remove if already pinned, then add to front
        const updated = [
          message,
          ...prev.filter((m) => m.id !== message.id),
        ].slice(0, MAX_PINNED_MESSAGES);

        localStorage.setItem(storageKey, JSON.stringify(updated));
        return updated;
      });
    },
    [storageKey]
  );

  // Unpin a message
  const unpin = useCallback(
    (messageId: string) => {
      setPinned((prev) => {
        const updated = prev.filter((m) => m.id !== messageId);
        localStorage.setItem(storageKey, JSON.stringify(updated));
        return updated;
      });
    },
    [storageKey]
  );

  // Check if a message is pinned
  const isPinned = useCallback((messageId: string) => {
    return pinned.some((m) => m.id === messageId);
  }, [pinned]);

  // Clear all pinned messages
  const clearAll = useCallback(() => {
    setPinned([]);
    localStorage.removeItem(storageKey);
  }, [storageKey]);

  return {
    pinned,
    pin,
    unpin,
    isPinned,
    clearAll,
  };
}
