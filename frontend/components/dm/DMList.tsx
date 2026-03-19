"use client";

import type { User } from "@/types";
import { Avatar } from "@/components/shared/Avatar";

interface DMListProps {
  conversations: User[];
  selectedUserId?: string;
  onSelectUser?: (userId: string) => void;
}

const statusDotColor: Record<string, string> = {
  online:  "var(--success)",
  idle:    "var(--warning)",
  offline: "var(--text-muted)",
};

export default function DMList({ conversations, selectedUserId, onSelectUser }: DMListProps) {
  if (conversations.length === 0) {
    return (
      <div className="empty-state">
        <p style={{ fontSize: 13, color: "var(--text-muted)" }}>No direct messages yet</p>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", padding: "8px" }}>
      {conversations.map((user) => {
        const isSelected = selectedUserId === user.id;
        return (
          <button
            key={user.id}
            onClick={() => onSelectUser?.(user.id)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "8px 10px",
              background: isSelected ? "var(--bg-hover)" : "transparent",
              border: "none",
              borderRadius: "var(--radius-sm)",
              cursor: "pointer",
              textAlign: "left",
              position: "relative",
              transition: "background 0.1s",
            }}
            onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = "var(--bg-hover)"; }}
            onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = "transparent"; }}
          >
            {/* Active left-edge bar */}
            {isSelected && (
              <span
                style={{
                  position: "absolute",
                  left: 0,
                  top: "20%",
                  height: "60%",
                  width: 3,
                  background: "var(--accent)",
                  borderRadius: "0 3px 3px 0",
                }}
              />
            )}

            {/* Avatar with status dot */}
            <div style={{ position: "relative", flexShrink: 0 }}>
              <Avatar user={user} size="md" />
              <div
                style={{
                  position: "absolute",
                  bottom: -1,
                  right: -1,
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: statusDotColor[user.status] ?? "var(--text-muted)",
                  border: "2px solid var(--bg-secondary)",
                }}
              />
            </div>

            {/* Name + username */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {user.displayName}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "var(--text-muted)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                @{user.username}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}