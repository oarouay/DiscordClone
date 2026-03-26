"use client";

import DMList from "./DMList";
import type { User } from "@/types";

export function DMSidebar({
  conversations,
  selectedUserId,
  onSelectUser,
  isConnected,
  topSlot,
  bottomSlot,
}: {
  conversations: User[];
  selectedUserId?: string;
  onSelectUser?: (userId: string) => void;
  isConnected?: boolean;
  topSlot?: React.ReactNode;
  bottomSlot?: React.ReactNode;
}) {
  return (
    <div className="channel-sidebar">
      <div
        style={{
          height: 52,
          minHeight: 52,
          borderBottom: "1px solid var(--border)",
          padding: "0 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
        }}
      >
        <h2
          style={{
            fontFamily: "var(--font-display, 'Rajdhani', sans-serif)",
            fontSize: 16,
            fontWeight: 700,
            color: "var(--text-primary)",
            letterSpacing: "0.3px",
          }}
        >
          Direct Messages
        </h2>
        {isConnected && (
          <span style={{ fontSize: 11, color: "var(--success)", fontWeight: 500 }}>
            Live
          </span>
        )}
      </div>
      {topSlot}
      <DMList
        conversations={conversations}
        selectedUserId={selectedUserId}
        onSelectUser={onSelectUser}
      />
      {bottomSlot && <div className="channel-bottom-slot">{bottomSlot}</div>}
    </div>
  );
}
