"use client";

import { useTheme } from "@/hooks/useTheme";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      className="theme-toggle-btn"
    >
      {theme === "dark" ? (
        <Sun size={16} strokeWidth={2.5} />
      ) : (
        <Moon size={16} strokeWidth={2.5} />
      )}
    </button>
  );
}
