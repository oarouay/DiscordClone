"use client";

import { useState, useEffect, useCallback } from "react";

interface Searchable {
  id: string;
  name: string;
}

export function useSidebarSearch<T extends Searchable>(items: T[]) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<T[]>(items);
  const [hasNoResults, setHasNoResults] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!query.trim()) {
        setResults(items);
        setHasNoResults(false);
      } else {
        const q = query.toLowerCase();
        const filtered = items.filter((item) =>
          item.name.toLowerCase().includes(q)
        );
        setResults(filtered);
        setHasNoResults(filtered.length === 0);
      }
    }, 300); // Debounce 300ms

    return () => clearTimeout(timer);
  }, [query, items]);

  const clear = useCallback(() => {
    setQuery("");
    setResults(items);
    setHasNoResults(false);
  }, [items]);

  return {
    query,
    setQuery,
    results,
    clear,
    hasNoResults,
  };
}
