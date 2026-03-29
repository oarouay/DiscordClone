"use client";

import { useState, useCallback } from "react";
import { friendsApi } from "@/lib/friends";
import type { User } from "@/types";

/**
 * Hook to search for users from backend
 */
export function useUserSearch() {
  const [results, setResults] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const search = useCallback(
    async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setResults([]);
        setQuery("");
        return;
      }

      try {
        setIsLoading(true);
        setQuery(searchQuery);
        const data = await friendsApi.searchUsers(searchQuery);
        setResults(data);
        setError(null);
      } catch (err) {
        console.error("Failed to search users:", err);
        setError(err instanceof Error ? err.message : "Failed to search users");
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const clear = useCallback(() => {
    setResults([]);
    setQuery("");
    setError(null);
  }, []);

  return { results, isLoading, error, query, search, clear };
}
