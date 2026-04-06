"use client";

import type { User } from "@/types";

interface StatusBadgeProps {
  user: User;
  size?: "sm" | "md";
  showLabel?: boolean;
}

export function StatusBadge({ user, size = "md", showLabel = true }: StatusBadgeProps) {
  const statusColors = {
    online:  "var(--success, #23a55a)",
    idle:    "var(--warning, #ffa500)",
    dnd:     "var(--error, #ed4245)",
    offline: "var(--text-muted, #72767d)",
  };

  const statusLabels = {
    online:  "Online",
    idle:    "Idle",
    dnd:     "Do Not Disturb",
    offline: "Offline",
  };

  const dotSizes = {
    sm: 7,
    md: 9,
  };

  const renderStatusDot = () => {
    if (user.status === "dnd") {
      // Red circle with white minus bar
      return (
        <svg
          width={dotSizes[size] * 2}
          height={dotSizes[size] * 2}
          viewBox="0 0 16 16"
          style={{ flexShrink: 0 }}
        >
          <circle cx="8" cy="8" r="8" fill={statusColors.dnd} />
          <line
            x1="4"
            y1="8"
            x2="12"
            y2="8"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      );
    }

    if (user.status === "idle") {
      // Yellow crescent
      return (
        <svg
          width={dotSizes[size] * 2}
          height={dotSizes[size] * 2}
          viewBox="0 0 16 16"
          style={{ flexShrink: 0 }}
        >
          <circle cx="8" cy="8" r="8" fill={statusColors.idle} />
          <circle
            cx="8"
            cy="8"
            r="6"
            fill="var(--bg-primary, #1e1f22)"
            style={{ clipPath: "polygon(50% 0%, 100% 0%, 100% 100%, 50% 100%)" }}
          />
        </svg>
      );
    }

    if (user.status === "offline") {
      // Grey hollow circle
      return (
        <svg
          width={dotSizes[size] * 2}
          height={dotSizes[size] * 2}
          viewBox="0 0 16 16"
          style={{ flexShrink: 0 }}
        >
          <circle cx="8" cy="8" r="7" fill="none" stroke={statusColors.offline} strokeWidth="2" />
        </svg>
      );
    }

    // Online - solid green circle
    return (
      <div
        style={{
          width: dotSizes[size],
          height: dotSizes[size],
          borderRadius: "50%",
          background: statusColors.online,
          flexShrink: 0,
        }}
      />
    );
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
      {renderStatusDot()}
      {showLabel && (
        <span
          style={{
            fontSize: 12,
            color: "var(--text-muted, #72767d)",
            fontWeight: 500,
          }}
        >
          {statusLabels[user.status]}
        </span>
      )}
    </div>
  );
}