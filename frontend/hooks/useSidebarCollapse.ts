"use client";

import { useState, useCallback, useEffect } from "react";

export function useSidebarCollapse() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("sidebarCollapsed");
    setIsCollapsed(saved === "true");
    setIsMounted(true);
  }, []);

  // Toggle collapse state and persist to localStorage
  const toggle = useCallback(() => {
    setIsCollapsed((prev) => {
      const newState = !prev;
      localStorage.setItem("sidebarCollapsed", String(newState));
      return newState;
    });
  }, []);

  return { isCollapsed, toggle, isMounted };
}
