import { useState, useRef, useEffect } from "react";
import type { Message } from "@/types";
import { Avatar } from "@/components/shared/Avatar";

interface MessageItemProps {
  message: Message;
  currentUserId?: string;
  onEdit?: (messageId: string, newContent: string) => void;
  onDelete?: (messageId: string) => void;
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

export default function MessageItem({ message, currentUserId, onEdit, onDelete }: MessageItemProps) {
  const [hovered, setHovered]     = useState(false);
  const [editing, setEditing]     = useState(false);
  const [editValue, setEditValue] = useState(message.content);
  const editRef = useRef<HTMLTextAreaElement>(null);

  const isOwn = currentUserId === message.author.id;
  const timestamp = new Date(message.createdAt);
  const timeAgo = formatTimeAgo(timestamp);

  // Focus + resize textarea when entering edit mode
  useEffect(() => {
    if (editing && editRef.current) {
      editRef.current.focus();
      editRef.current.style.height = "auto";
      editRef.current.style.height = editRef.current.scrollHeight + "px";
      // Move cursor to end
      const len = editRef.current.value.length;
      editRef.current.setSelectionRange(len, len);
    }
  }, [editing]);

  const submitEdit = () => {
    if (editValue.trim() && editValue.trim() !== message.content) {
      onEdit?.(message.id, editValue.trim());
    }
    setEditing(false);
  };

  const cancelEdit = () => {
    setEditValue(message.content);
    setEditing(false);
  };

  const handleEditKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submitEdit(); }
    if (e.key === "Escape") cancelEdit();
  };

  const btnStyle = (color: string): React.CSSProperties => ({
    background: "transparent",
    border: "none",
    cursor: "pointer",
    color,
    fontSize: 12,
    fontWeight: 600,
    fontFamily: "inherit",
    padding: "3px 8px",
    borderRadius: "var(--radius-sm)",
    transition: "background 0.1s",
  });

  return (
    <div
      style={{
        display: "flex",
        gap: 14,
        padding: "6px 20px",
        background: hovered ? "rgba(255,255,255,0.025)" : "transparent",
        transition: "background 0.1s",
        position: "relative",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Avatar */}
      <div style={{ paddingTop: 2, flexShrink: 0 }}>
        <Avatar user={message.author} size="lg" />
      </div>

      {/* Body */}
      <div style={{ flex: 1, minWidth: 0, paddingTop: 2 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 3 }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", lineHeight: 1 }}>
            {message.author.displayName}
          </span>
          <span style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1 }}>
            {timeAgo}
          </span>
        </div>

        {/* Content or edit textarea */}
        {editing ? (
          <div>
            <textarea
              ref={editRef}
              value={editValue}
              onChange={(e) => {
                setEditValue(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = e.target.scrollHeight + "px";
              }}
              onKeyDown={handleEditKeyDown}
              style={{
                width: "100%",
                background: "var(--bg-floating)",
                border: "1px solid var(--accent)",
                borderRadius: "var(--radius)",
                color: "var(--text-primary)",
                fontFamily: "inherit",
                fontSize: 15,
                lineHeight: 1.55,
                padding: "8px 12px",
                resize: "none",
                outline: "none",
                overflow: "hidden",
              }}
            />
            <div style={{ display: "flex", gap: 6, marginTop: 5, alignItems: "center" }}>
              <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                esc to cancel · enter to save
              </span>
              <button style={btnStyle("var(--text-muted)")} onClick={cancelEdit}>Cancel</button>
              <button style={{ ...btnStyle("var(--accent)"), background: "var(--accent-glow, rgba(108,111,255,0.15))" }} onClick={submitEdit}>Save</button>
            </div>
          </div>
        ) : (
          <p style={{ fontSize: 15, color: "var(--text-secondary)", lineHeight: 1.55, wordBreak: "break-word", whiteSpace: "pre-wrap", margin: 0 }}>
            {message.content}
          </p>
        )}

        {message.editedAt && !editing && (
          <span style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 3, display: "block" }}>
            (edited)
          </span>
        )}
      </div>

      {/* Action buttons — only for own messages, only on hover */}
      {isOwn && hovered && !editing && (
        <div
          style={{
            position: "absolute",
            top: 4,
            right: 20,
            display: "flex",
            gap: 4,
            background: "var(--bg-floating)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            padding: "3px 4px",
          }}
        >
          <button
            style={btnStyle("var(--text-secondary)")}
            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-hover)"; e.currentTarget.style.color = "var(--text-primary)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-secondary)"; }}
            onClick={() => { setEditValue(message.content); setEditing(true); }}
          >
            ✏️ Edit
          </button>
          <button
            style={btnStyle("var(--text-secondary)")}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,92,92,0.12)"; e.currentTarget.style.color = "var(--danger)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-secondary)"; }}
            onClick={() => onDelete?.(message.id)}
          >
            🗑️ Delete
          </button>
        </div>
      )}
    </div>
  );
}