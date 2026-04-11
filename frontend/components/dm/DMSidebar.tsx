"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const [search, setSearch] = useState("");

  const filtered = search.trim()
    ? conversations.filter(
        (u) =>
          u.displayName.toLowerCase().includes(search.toLowerCase()) ||
          u.username.toLowerCase().includes(search.toLowerCase())
      )
    : conversations;

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
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <button
            onClick={() => router.push("/channels/me")}
            title="Friends"
            aria-label="Open friends"
            style={{
              background: "transparent",
              border: "none",
              color: "var(--text-muted)",
              cursor: "pointer",
              padding: 4,
              borderRadius: "var(--radius-sm)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "color 0.15s, background 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--text-primary)";
              e.currentTarget.style.background = "var(--bg-hover)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--text-muted)";
              e.currentTarget.style.background = "transparent";
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </button>
          {isConnected && (
            <span style={{ fontSize: 11, color: "var(--success)", fontWeight: 500 }}>
              Live
            </span>
          )}
        </div>
      </div>
      <div style={{ padding: "8px 12px" }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search conversations..."
          aria-label="Search conversations"
          style={{
            width: "100%",
            fontSize: 12,
            padding: "6px 10px",
            background: "var(--bg-secondary)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-sm)",
            color: "var(--text-primary)",
            outline: "none",
          }}
        />
      </div>
      {topSlot}
      <DMList
        conversations={filtered}
        selectedUserId={selectedUserId}
        onSelectUser={onSelectUser}
      />
      {bottomSlot && <div className="channel-bottom-slot">{bottomSlot}</div>}
    </div>
  );
}