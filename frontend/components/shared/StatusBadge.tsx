"use client";

import type { User } from "@/types";

interface StatusBadgeProps {
  user: User;
  size?: "sm" | "md";
}

export function StatusBadge({ user, size = "md" }: StatusBadgeProps) {
  const statusColors = {
    online:  "var(--success)",
    idle:    "var(--warning)",
    offline: "var(--text-muted)",
  };

  const statusLabels = {
    online:  "Online",
    idle:    "Idle",
    offline: "Offline",
  };

  const dotSizes = {
    sm: 7,
    md: 9,
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
      <div
        style={{
          width: dotSizes[size],
          height: dotSizes[size],
          borderRadius: "50%",
          background: statusColors[user.status],
          flexShrink: 0,
        }}
      />
      <span
        style={{
          fontSize: 12,
          color: "var(--text-muted)",
          fontWeight: 500,
        }}
      >
        {statusLabels[user.status]}
      </span>
    </div>
  );
}