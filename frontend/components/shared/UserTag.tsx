"use client";

import type { User } from "@/types";

export function UserTag({ user, showStatus = true }: { user: User; showStatus?: boolean }) {
  const statusColors = {
    online:  "var(--success)",
    idle:    "var(--warning)",
    offline: "var(--text-muted)",
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      {showStatus && (
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: statusColors[user.status],
            flexShrink: 0,
          }}
        />
      )}
      <div style={{ minWidth: 0 }}>
        <p
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: "var(--text-primary)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            margin: 0,
          }}
        >
          {user.displayName || user.username}
        </p>
        {showStatus && (
          <p
            style={{
              fontSize: 11,
              color: "var(--text-muted)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              margin: 0,
              textTransform: "capitalize",
            }}
          >
            {user.status}
          </p>
        )}
      </div>
    </div>
  );
}

export function StatusBadge({ status }: { status: User["status"] }) {
  const statusConfig = {
    online:  { color: "var(--success)", label: "Online" },
    idle:    { color: "var(--warning)", label: "Idle" },
    offline: { color: "var(--text-muted)", label: "Offline" },
  };

  const { color, label } = statusConfig[status];

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
      <div
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: color,
          flexShrink: 0,
        }}
      />
      <span style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 500 }}>
        {label}
      </span>
    </div>
  );
}