"use client";

import { useState, useCallback, useRef, useEffect } from "react";

export interface ContextMenuPosition {
  x: number;
  y: number;
}

export function useMessageContextMenu() {
  const [position, setPosition] = useState<ContextMenuPosition | null>(null);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const openMenu = useCallback(
    (messageId: string, e: React.MouseEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();

      let x = e.clientX;
      let y = e.clientY;

      // Adjust for viewport
      const viewport = {
        width: window.innerWidth,
        height: window.innerHeight,
      };

      // Menu dimensions (approximate)
      const menuWidth = 250;
      const menuHeight = 300;

      if (x + menuWidth > viewport.width) {
        x = viewport.width - menuWidth - 10;
      }

      if (y + menuHeight > viewport.height) {
        y = viewport.height - menuHeight - 10;
      }

      setPosition({ x, y });
      setSelectedMessageId(messageId);
    },
    []
  );

  const closeMenu = useCallback(() => {
    setPosition(null);
    setSelectedMessageId(null);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        closeMenu();
      }
    }

    function handleEscapeKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        closeMenu();
      }
    }

    if (position) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscapeKey);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [position, closeMenu]);

  return {
    position,
    selectedMessageId,
    openMenu,
    closeMenu,
    menuRef,
  };
}
