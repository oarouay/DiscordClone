"use client";

import { useTheme } from "@/hooks/useTheme";
import EmojiPicker, { Theme } from "emoji-picker-react";
import { useRef, useEffect } from "react";

type EmojiPickerPanelProps = {
  onEmojiClick: (emoji: string) => void;
  isOpen: boolean;
  onClose: () => void;
};

export function EmojiPickerPanel({ onEmojiClick, isOpen, onClose }: EmojiPickerPanelProps) {
  const { theme } = useTheme();
  const panelRef = useRef<HTMLDivElement>(null);

  // Convert theme to emoji picker format
  const pickerTheme: Theme = theme === "light" ? Theme.LIGHT : Theme.DARK;

  // Close panel when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={panelRef}
      className="emoji-panel-container"
      style={{
        position: "fixed",
        bottom: "80px",
        right: "20px",
        borderRadius: "var(--radius)",
        boxShadow: "0 10px 40px rgba(0, 0, 0, 0.3)",
        background: "var(--bg-secondary)",
        border: "1px solid var(--border)",
        zIndex: 1000,
      }}
    >
      <style>{`
        .emoji-panel-container .EmojiPickerReact {
          --epr-bg-color: var(--bg-secondary);
          --epr-text-color: var(--text-primary);
          --epr-category-label-bg-color: var(--bg-tertiary);
          --epr-search-bg-color: var(--bg-primary);
          --epr-search-text-color: var(--text-primary);
          --epr-preview-bg-color: var(--bg-tertiary);
          --epr-sbg-color: var(--accent);
          --epr-hover-bg-color: var(--bg-hover);
          border: none;
          border-radius: var(--radius);
          width: 352px;
          max-height: 435px;
          font-family: inherit;
        }

        .emoji-panel-container .EmojiPickerReact input::placeholder {
          color: var(--text-muted);
        }

        .emoji-panel-container .EmojiPickerReact button {
          opacity: 0.7;
          transition: opacity 0.15s;
        }

        .emoji-panel-container .EmojiPickerReact button:hover {
          opacity: 1;
        }

        .emoji-panel-container .EmojiPickerReact .epr-category-nav button {
          color: var(--text-secondary) !important;
        }

        .emoji-panel-container .EmojiPickerReact .epr-category-nav button.active {
          color: var(--accent) !important;
        }
      `}</style>

      <EmojiPicker
        onEmojiClick={(emojiObject) => {
          onEmojiClick(emojiObject.emoji);
          onClose();
        }}
        theme={pickerTheme}
        searchPlaceholder="Search emojis..."
        width={352}
        height={435}
        previewConfig={{ showPreview: false }}
      />
    </div>
  );
}
