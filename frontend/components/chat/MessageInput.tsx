"use client";

import { useState, useRef, useEffect } from "react";

interface MessageInputProps {
  channelName: string;
  isDisabled?: boolean;
  onSend?: (content: string) => void;
}

export default function MessageInput({ channelName, isDisabled = false, onSend }: MessageInputProps) {
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
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

  const canSend = !!content.trim() && !isDisabled && !isLoading;

  return (
    <div style={{ padding: "12px 20px 18px", borderTop: "1px solid var(--border)" }}>
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: 10,
          background: "var(--bg-hover)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          padding: "10px 14px",
          transition: "border-color 0.15s",
        }}
        onFocusCapture={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; }}
        onBlurCapture={(e)  => { e.currentTarget.style.borderColor = "var(--border)"; }}
      >
        <textarea
          ref={ref}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isDisabled || isLoading}
          placeholder={isDisabled ? "💡 Voice channels coming in Commit 10" : `Message #${channelName}`}
          rows={1}
          style={{
            flex: 1,
            background: "transparent",
            border: "none",
            outline: "none",
            color: "var(--text-primary)",
            fontFamily: "inherit",
            fontSize: 14,
            resize: "none",
            maxHeight: 140,
            lineHeight: 1.5,
            opacity: isDisabled ? 0.5 : 1,
          }}
        />

        <button
          onClick={handleSend}
          disabled={!canSend}
          style={{
            width: 34,
            height: 34,
            borderRadius: "var(--radius-sm)",
            background: canSend ? "var(--accent)" : "transparent",
            border: `1px solid ${canSend ? "var(--accent)" : "var(--border)"}`,
            color: canSend ? "#fff" : "var(--text-muted)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: canSend ? "pointer" : "not-allowed",
            flexShrink: 0,
            transition: "background 0.12s, border-color 0.12s, color 0.12s, transform 0.1s",
          }}
          onMouseEnter={(e) => { if (canSend) e.currentTarget.style.background = "var(--accent-hover)"; }}
          onMouseLeave={(e) => { if (canSend) e.currentTarget.style.background = "var(--accent)"; }}
          onMouseDown={(e)  => { if (canSend) e.currentTarget.style.transform = "scale(0.92)"; }}
          onMouseUp={(e)    => { e.currentTarget.style.transform = "scale(1)"; }}
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
  );
}