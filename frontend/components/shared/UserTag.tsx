"use client";

import type { User } from "@/types";

export function UserTag({ user, showStatus = true }: { user: User; showStatus?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-shrink-0">
        {showStatus && (
          <div
            className={`
              w-2 h-2 rounded-full
              ${user.status === "online" && "bg-green-500"}
              ${user.status === "idle" && "bg-yellow-500"}
              ${user.status === "offline" && "bg-gray-500"}
            `}
          />
        )}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-text-primary truncate">
          {user.displayName || user.username}
        </p>
        {showStatus && (
          <p className="text-xs text-text-muted truncate capitalize">
            {user.status}
          </p>
        )}
      </div>
    </div>
  );
}

export function StatusBadge({ status }: { status: User["status"] }) {
  const statusConfig = {
    online: { bg: "bg-green-500", label: "Online" },
    idle: { bg: "bg-yellow-500", label: "Idle" },
    offline: { bg: "bg-gray-500", label: "Offline" },
  };

  const config = statusConfig[status];

  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${config.bg}`} />
      <span className="text-xs text-text-secondary">{config.label}</span>
    </div>
  );
}
