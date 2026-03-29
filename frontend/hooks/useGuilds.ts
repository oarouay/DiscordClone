"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { mockGuilds } from "@/lib/mock";
import type { Guild } from "@/types";

/**
 * Hook to fetch user's guilds from backend.
 * Falls back to mock data if API is not ready.
 *
 * @returns {guilds, isLoading, error}
 */
export function useGuilds() {
  const [guilds, setGuilds] = useState<Guild[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchGuilds() {
      try {
        setIsLoading(true);
        // TODO: Replace with API call to GET /guilds when backend is ready
        // const data = await api.get<Guild[]>("/guilds");
        // setGuilds(data);

        // For now, use mock data with a small delay to simulate network
        await new Promise((resolve) => setTimeout(resolve, 300));
        setGuilds(mockGuilds);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch guilds:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch guilds");
        // Fallback to mock data
        setGuilds(mockGuilds);
      } finally {
        setIsLoading(false);
      }
    }

    fetchGuilds();
  }, []);

  return { guilds, isLoading, error };
}
