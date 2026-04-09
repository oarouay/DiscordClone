"use client";

import { useState, useCallback } from "react";

const MAX_RECENT_EMOJIS = 8;
const STORAGE_KEY = "recentEmojis";

export function useRecentEmojis() {
  const [recent, setRecent] = useState<string[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  // Add emoji to recent list
  const add = useCallback((emoji: string) => {
    setRecent((prev) => {
      // Remove if already in list, then add to front
      const updated = [emoji, ...prev.filter((e) => e !== emoji)].slice(
        0,
        MAX_RECENT_EMOJIS
      );
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Remove emoji from recent list
  const remove = useCallback((emoji: string) => {
    setRecent((prev) => {
      const updated = prev.filter((e) => e !== emoji);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Clear all recent emojis
  const clear = useCallback(() => {
    setRecent([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return { recent, add, remove, clear };
}
