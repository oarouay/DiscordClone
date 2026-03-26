"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { EmojiPickerPanel } from "./EmojiPickerPanel";
import { FilePreview, validateFiles, createPendingFiles, revokePreviews } from "./FilePreview";

type PendingFile = {
  file: File;
  previewUrl: string | null;
};

interface MessageInputProps {
  channelName: string;
  isDisabled?: boolean;
  onSend?: (content: string, files: File[]) => void;
}

export default function MessageInput({ channelName, isDisabled = false, onSend }: MessageInputProps) {
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [fileErrors, setFileErrors] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounterRef = useRef(0);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [content]);

  useEffect(() => {
    return () => revokePreviews(pendingFiles);
  }, []);

  function addFiles(incoming: File[]) {
    const { valid, errors } = validateFiles(incoming, pendingFiles.map((p) => p.file));
    if (errors.length > 0) setFileErrors(errors);
    if (valid.length > 0) {
      setPendingFiles((prev) => [...prev, ...createPendingFiles(valid)]);
    }
  }

  function removeFile(index: number) {
    setPendingFiles((prev) => {
      const removed = prev[index];
      if (removed.previewUrl) URL.revokeObjectURL(removed.previewUrl);
      return prev.filter((_, i) => i !== index);
    });
    setFileErrors([]);
  }

  const handleSend = async () => {
    if ((!content.trim() && pendingFiles.length === 0) || isDisabled) return;
    setIsLoading(true);
    try {
      if (onSend) onSend(content, pendingFiles.map((p) => p.file));
      setContent("");
      revokePreviews(pendingFiles);
      setPendingFiles([]);
      setFileErrors([]);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(Array.from(e.target.files));
      e.target.value = "";
    }
  };

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    dragCounterRef.current += 1;
    if (dragCounterRef.current === 1) setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    dragCounterRef.current -= 1;
    if (dragCounterRef.current === 0) setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    dragCounterRef.current = 0;
    setIsDragging(false);
    const dropped = Array.from(e.dataTransfer.files);
    if (dropped.length > 0) addFiles(dropped);
  }, [pendingFiles]);

  const handleEmojiClick = (emoji: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const chars = [...content];

    const toGraphemeIndex = (utf16Offset: number): number => {
      let acc = 0;
      for (let i = 0; i < chars.length; i++) {
        if (acc >= utf16Offset) return i;
        acc += chars[i].length;
      }
      return chars.length;
    };

    const startIdx = toGraphemeIndex(start);
    const endIdx = toGraphemeIndex(end);
    const newChars = [...chars.slice(0, startIdx), emoji, ...chars.slice(endIdx)];
    const newContent = newChars.join("");
    setContent(newContent);

    const newCursorUtf16 = [...newChars.slice(0, startIdx + 1)].join("").length;
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = newCursorUtf16;
      textarea.focus();
    }, 0);
  };

  const canSend = (!content.trim() && pendingFiles.length === 0) === false && !isDisabled && !isLoading;

  return (
    <div
      style={{ padding: "12px 20px 18px", borderTop: "1px solid var(--border)", position: "relative" }}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {isDragging && (
        <div className="drop-overlay">
          <div className="drop-overlay-content">
            <div className="drop-overlay-icon">📎</div>
            <p className="drop-overlay-text">Drop files to attach</p>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        multiple
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

      {fileErrors.length > 0 && (
        <div className="file-error-list">
          {fileErrors.map((err, i) => (
            <p key={i} className="file-error-item">{err}</p>
          ))}
        </div>
      )}

      <FilePreview files={pendingFiles} onRemove={removeFile} />

      <div
        style={{
          position: "relative",
          background: "var(--bg-hover)",
          borderWidth: "1px",
          borderStyle: "solid",
          borderColor: isFocused ? "var(--accent)" : "var(--border)",
          borderRadius: "var(--radius)",
          padding: "10px 14px",
          transition: "border-color 0.15s",
          display: "flex",
          alignItems: "flex-end",
          gap: 10,
        }}
      >
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={isDisabled || isLoading}
          placeholder={`Message #${channelName}`}
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

        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0, position: "relative" }}>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isDisabled || isLoading}
            aria-label="Attach file"
            title="Attach file"
            className="emoji-btn"
            style={{ opacity: isDisabled || isLoading ? 0.5 : 1 }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
            </svg>
          </button>

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
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M8 14s1.5 2 4 2 4-2 4-2" />
              <circle cx="9" cy="9" r="1" />
              <circle cx="15" cy="9" r="1" />
            </svg>
          </button>

          <EmojiPickerPanel
            isOpen={showEmojiPicker}
            onClose={() => setShowEmojiPicker(false)}
            onEmojiClick={handleEmojiClick}
          />

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