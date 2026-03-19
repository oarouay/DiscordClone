"use client";

import { useState, useRef, useEffect } from "react";
import { EmojiPickerPanel } from "./EmojiPickerPanel";

interface MessageInputProps {
  channelName: string;
  isDisabled?: boolean;
  onSend?: (content: string) => void;
}

export default function MessageInput({ channelName, isDisabled = false, onSend }: MessageInputProps) {
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const ref = useRef<HTMLTextAreaElement>(null);

  // Auto-grow textarea
  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = "auto";
      ref.current.style.height = `${ref.current.scrollHeight}px`;
    }
  }, [content]);

  const handleSend = async () => {
    if (!content.trim() || isDisabled) return;
    setIsLoading(true);
    try {
      if (onSend) onSend(content);
      setContent("");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !isDisabled) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleEmojiClick = (emoji: string) => {
    const textarea = ref.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    // Use Unicode-aware segmentation so multi-codepoint emojis (flags, skin
    // tones, ZWJ sequences like 👨‍👩‍👧) are treated as single characters.
    // String.prototype.slice and .length operate on UTF-16 code units, which
    // breaks these emojis — spreading into an array gives us real grapheme
    // clusters we can safely slice and measure.
    const chars = [...content];

    // Convert the UTF-16 cursor offsets into grapheme-cluster indices.
    // We walk the array, accumulating UTF-16 lengths until we reach the
    // offsets reported by the textarea.
    const toGraphemeIndex = (utf16Offset: number): number => {
      let acc = 0;
      for (let i = 0; i < chars.length; i++) {
        if (acc >= utf16Offset) return i;
        acc += chars[i].length; // each grapheme cluster may be 1–n code units
      }
      return chars.length;
    };

    const startIdx = toGraphemeIndex(start);
    const endIdx   = toGraphemeIndex(end);

    const newChars = [...chars.slice(0, startIdx), emoji, ...chars.slice(endIdx)];
    const newContent = newChars.join("");
    setContent(newContent);

    // Place the cursor right after the inserted emoji (in UTF-16 units, as
    // required by selectionStart/End).
    const newCursorUtf16 = [...newChars.slice(0, startIdx + 1)].join("").length;
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = newCursorUtf16;
      textarea.focus();
    }, 0);
  };

  const canSend = !!content.trim() && !isDisabled && !isLoading;

  return (
    <div style={{ padding: "12px 20px 18px", borderTop: "1px solid var(--border)" }}>
      <div
        className="msg-input-wrapper"
        style={{
          position: "relative",
          borderColor: isFocused ? "var(--accent)" : "var(--border)",
          background: "var(--bg-hover)",
          border: "1px solid",
          borderRadius: "var(--radius)",
          padding: "10px 14px",
          transition: "border-color 0.15s",
          display: "flex",
          alignItems: "flex-end",
          gap: 10,
        }}
      >
        <textarea
          ref={ref}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={isDisabled || isLoading}
          placeholder={isDisabled ? "💡 Voice channels coming in Commit 10" : `Message #${channelName}`}
          rows={1}
          className="msg-textarea"
          style={{
            flex: 1,
            background: "transparent",
            border: "none",
            outline: "none",
            fontFamily: "inherit",
            resize: "none",
            maxHeight: 140,
            lineHeight: 1.5,
            opacity: isDisabled ? 0.5 : 1,
          }}
        />

        {/* Action buttons container */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0, position: "relative" }}>
          {/* Emoji picker button */}
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            disabled={isDisabled || isLoading}
            aria-label="Open emoji picker"
            title="Add emoji"
            className="emoji-btn"
            style={{
              background: showEmojiPicker ? "var(--accent)" : undefined,
              color: showEmojiPicker ? "#fff" : undefined,
              opacity: isDisabled || isLoading ? 0.5 : 1,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><circle cx="9" cy="9" r="1"></circle><circle cx="15" cy="9" r="1"></circle></svg>
          </button>

          <EmojiPickerPanel
            isOpen={showEmojiPicker}
            onClose={() => setShowEmojiPicker(false)}
            onEmojiClick={handleEmojiClick}
          />

          {/* Send button */}
          <button
            onClick={handleSend}
            disabled={!canSend}
            className="send-btn"
            style={{
              background: canSend ? "var(--accent)" : undefined,
              color: canSend ? "#fff" : undefined,
            }}
          >
            {isLoading ? (
              <span style={{ fontSize: 14 }}>⏳</span>
            ) : (
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                <path d="M14 8L2 2l3 6-3 6 12-6z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}