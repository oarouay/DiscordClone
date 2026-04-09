"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "./useTheme";

export interface Shortcut {
  key: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  description: string;
  action?: () => void;
}

export function useKeyboardShortcuts() {
  const isMac =
    typeof navigator !== "undefined" &&
    navigator.platform.toUpperCase().indexOf("MAC") >= 0;
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();
  const { toggleTheme } = useTheme();

  const shortcuts: Shortcut[] = [
    {
      key: "K",
      ctrlKey: !isMac,
      altKey: isMac,
      description: "Search guilds/channels",
      action: () => {
        // Placeholder for search action
        console.log("Search triggered");
      },
    },
    {
      key: "/",
      ctrlKey: !isMac,
      altKey: isMac,
      description: "Show keyboard shortcuts",
      action: () => setShowModal(true),
    },
    {
      key: "L",
      ctrlKey: !isMac,
      altKey: isMac,
      description: "Toggle light/dark theme",
      action: toggleTheme,
    },
    {
      key: "H",
      ctrlKey: !isMac,
      altKey: isMac,
      description: "Jump to home (Direct Messages)",
      action: () => {
        router.push("/channels/me");
      },
    },
    {
      key: "Escape",
      description: "Close modals/search",
      action: () => setShowModal(false),
    },
  ];

  const getModifierKey = () => (isMac ? "⌘" : "Ctrl");

  const getShortcutDisplay = (shortcut: Shortcut): string => {
    const parts: string[] = [];
    if (shortcut.ctrlKey) parts.push(getModifierKey());
    if (shortcut.altKey) parts.push(isMac ? "⌥" : "Alt");
    if (shortcut.shiftKey) parts.push("Shift");
    parts.push(shortcut.key.toUpperCase());
    return parts.join(" + ");
  };

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Don't trigger shortcuts in input fields
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        if (e.key === "Escape") {
          setShowModal(false);
        }
        return;
      }

      const isCmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;
      const isAltKey = e.altKey;

      // Cmd/Ctrl+K or Alt+K (Mac)
      if (isCmdOrCtrl && e.key.toLowerCase() === "k" && !isAltKey) {
        e.preventDefault();
        console.log("Search triggered via keyboard");
      }

      // Cmd/Ctrl+/ or Alt+/
      if ((isCmdOrCtrl || isAltKey) && e.key === "/") {
        e.preventDefault();
        setShowModal((prev) => !prev);
      }

      // Cmd/Ctrl+L or Alt+L
      if ((isCmdOrCtrl || isAltKey) && e.key.toLowerCase() === "l") {
        e.preventDefault();
        toggleTheme();
      }

      // Cmd/Ctrl+H or Alt+H
      if ((isCmdOrCtrl || isAltKey) && e.key.toLowerCase() === "h") {
        e.preventDefault();
        router.push("/channels/me");
      }

      // Escape
      if (e.key === "Escape") {
        setShowModal(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [isMac, toggleTheme, router]);

  return {
    showModal,
    setShowModal,
    shortcuts,
    getShortcutDisplay,
    getModifierKey,
    isMac,
  };
}
