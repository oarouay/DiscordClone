import { useState, useRef, useEffect } from "react";
import { Edit2, Trash2, Check, X } from "lucide-react";
import type { Message } from "@/types";
import { Avatar } from "@/components/shared/Avatar";
import { MessageAttachments } from "./MessageAttachments";
import { MarkdownRenderer } from "./MarkdownRenderer";

interface MessageItemProps {
  message: Message;
  currentUserId?: string;
  hideUserInfo?: boolean;
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

export default function MessageItem({ message, currentUserId, hideUserInfo = false, onEdit, onDelete }: MessageItemProps) {
  const [hovered, setHovered]     = useState(false);
  const [editing, setEditing]     = useState(false);
  const [editValue, setEditValue] = useState(message.content);
  const editRef = useRef<HTMLTextAreaElement>(null);

  const isOwn = currentUserId === message.author.id;
  const timestamp = new Date(message.createdAt);
  const timeAgo = formatTimeAgo(timestamp);

  useEffect(() => {
    if (editing && editRef.current) {
      editRef.current.focus();
      editRef.current.style.height = "auto";
      editRef.current.style.height = editRef.current.scrollHeight + "px";
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

  return (
    <div
      className="msg-item-container"
      style={{
        backgroundColor: hovered ? "rgba(255,255,255,0.025)" : undefined,
        display: "flex",
        alignItems: "flex-start",
        gap: hideUserInfo ? 0 : 12,
        padding: hideUserInfo ? "2px 16px 4px 68px" : "12px 16px",
        position: "relative",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      role="article"
      aria-label={`Message from ${message.author.displayName} at ${timeAgo}`}
    >
      {!hideUserInfo && (
        <div style={{ paddingTop: 2, flexShrink: 0, display: "flex" }}>
          <Avatar user={message.author} size="lg" />
        </div>
      )}

      <div style={{ flex: 1, minWidth: 0, paddingTop: hideUserInfo ? 0 : 2, display: "flex", flexDirection: "column" }}>
        {!hideUserInfo && (
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 3 }}>
            <span style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", lineHeight: 1 }}>
              {message.author.displayName}
            </span>
            <span style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1 }}>
              {timeAgo}
            </span>
          </div>
        )}

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
              aria-label="Edit message"
              className="msg-edit-textarea"
            />
            <div style={{ display: "flex", gap: 6, marginTop: 5, alignItems: "center" }}>
              <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                esc to cancel · enter to save
              </span>
              <button
                className="msg-action-btn"
                onClick={cancelEdit}
                aria-label="Cancel edit"
                style={{ color: "var(--text-muted)", display: "flex", alignItems: "center", justifyContent: "center", padding: "4px", border: "none", background: "transparent", cursor: "pointer" }}
                title="Cancel (Esc)"
              >
                <X size={16} />
              </button>
              <button
                className="msg-action-btn"
                onClick={submitEdit}
                aria-label="Save edit"
                style={{ color: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", padding: "4px", border: "none", background: "transparent", cursor: "pointer" }}
                title="Save (Enter)"
              >
                <Check size={16} />
              </button>
            </div>
          </div>
        ) : (
          <>
            <div style={{ fontSize: 15, color: "var(--text-secondary)", lineHeight: 1.55, wordBreak: "break-word", whiteSpace: "pre-wrap" }}>
              <MarkdownRenderer content={message.content} />
            </div>
            {message.attachments && message.attachments.length > 0 && (
              <MessageAttachments attachments={message.attachments} />
            )}
          </>
        )}

        {message.editedAt && !editing && (
          <span style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 3, display: "block" }}>
            (edited)
          </span>
        )}
      </div>

      {isOwn && hovered && !editing && (
        <div
          className="msg-actions"
          style={{
            background: "var(--bg-floating)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            padding: "4px",
            display: "flex",
            gap: 4,
            flexShrink: 0,
            marginLeft: "auto",
            alignSelf: "center",
          }}
          role="toolbar"
          aria-label="Message actions"
        >
          <button
            className="msg-action-btn"
            onClick={() => { setEditValue(message.content); setEditing(true); }}
            aria-label="Edit message"
            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-hover)"; e.currentTarget.style.color = "var(--text-primary)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-secondary)"; }}
            style={{ color: "var(--text-secondary)", display: "flex", alignItems: "center", justifyContent: "center", padding: "4px", border: "none", background: "transparent", cursor: "pointer" }}
            title="Edit message"
          >
            <Edit2 size={16} />
          </button>
          <button
            className="msg-action-btn"
            onClick={() => onDelete?.(message.id)}
            aria-label="Delete message"
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,92,92,0.12)"; e.currentTarget.style.color = "var(--danger)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-secondary)"; }}
            style={{ color: "var(--text-secondary)", display: "flex", alignItems: "center", justifyContent: "center", padding: "4px", border: "none", background: "transparent", cursor: "pointer" }}
            title="Delete message"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )}
    </div>
  );
}