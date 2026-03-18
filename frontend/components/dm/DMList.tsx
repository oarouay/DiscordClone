"use client";

import type { User } from "@/types";
import { Avatar } from "@/components/shared/Avatar";

interface DMListProps {
  conversations: User[];
  selectedUserId?: string;
  onSelectUser?: (userId: string) => void;
}

export default function DMList({ conversations, selectedUserId, onSelectUser }: DMListProps) {
  if (conversations.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-text-muted text-center">No direct messages yet</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto flex flex-col">
      {conversations.map((user) => (
        <button
          key={user.id}
          onClick={() => onSelectUser?.(user.id)}
          className={`
            px-6 py-4 border-b border-bg-secondary flex items-center gap-4
            hover:bg-bg-hover transition-colors text-left
            ${selectedUserId === user.id ? "bg-bg-hover" : ""}
          `}
        >
          <Avatar user={user} size="md" />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-text-primary truncate">{user.displayName}</h3>
            <p className="text-sm text-text-muted truncate">@{user.username}</p>
          </div>
          <span className={`text-xs flex-shrink-0 ${user.status === "online" ? "text-green-500" : "text-yellow-500"}`}>
            {user.status === "online" ? "●" : "◐"}
          </span>
        </button>
      ))}
    </div>
  );
}
