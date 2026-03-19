"use client";

import type { Member } from "@/types";
import { Avatar } from "@/components/shared/Avatar";
import { StatusBadge } from "@/components/shared/StatusBadge";

interface MemberListProps {
  members: Member[];
}

export function MemberList({ members }: MemberListProps) {
  const membersByStatus = {
    online:  members.filter((m) => m.user.status === "online"),
    idle:    members.filter((m) => m.user.status === "idle"),
    offline: members.filter((m) => m.user.status === "offline"),
  };

  const statusDotColor = {
    online:  "var(--success)",
    idle:    "var(--warning)",
    offline: "var(--text-muted)",
  };

  const renderMemberGroup = (status: "online" | "idle" | "offline", memberList: Member[]) => {
    if (memberList.length === 0) return null;

    const statusLabels = { online: "Online", idle: "Idle", offline: "Offline" };

    return (
      <div key={status}>
        {/* Group label */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "12px 8px 5px",
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--text-muted)",
            userSelect: "none",
          }}
        >
          {statusLabels[status]}
          <span style={{ color: "var(--text-muted)" }}>— {memberList.length}</span>
          <span style={{ flex: 1, height: 1, background: "var(--border)" }} />
        </div>

        {/* Member rows */}
        {memberList.map((member) => (
          <div
            key={member.userId}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "6px 8px",
              borderRadius: "var(--radius-sm)",
              cursor: "pointer",
              transition: "background 0.1s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-hover)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
          >
            {/* Avatar with status dot */}
            <div style={{ position: "relative", flexShrink: 0 }}>
              <Avatar user={member.user} size="sm" />
              <div
                style={{
                  position: "absolute",
                  bottom: -1,
                  right: -1,
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: statusDotColor[member.user.status],
                  border: "2px solid var(--bg-secondary)",
                }}
              />
            </div>

            {/* Name + username */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: status === "offline" ? "var(--text-muted)" : "var(--text-primary)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {member.user.displayName}
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
                @{member.user.username}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div
      style={{
        width: 220,
        minWidth: 220,
        background: "var(--bg-secondary)",
        borderLeft: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          height: 52,
          minHeight: 52,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 14px",
          borderBottom: "1px solid var(--border)",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-display, 'Rajdhani', sans-serif)",
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--text-muted)",
          }}
        >
          Members
        </span>
        <span
          style={{
            fontSize: 11,
            color: "var(--text-muted)",
            background: "var(--bg-hover)",
            padding: "2px 8px",
            borderRadius: 10,
          }}
        >
          {members.length}
        </span>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: "auto", padding: "10px 6px" }}>
        {renderMemberGroup("online",  membersByStatus.online)}
        {renderMemberGroup("idle",    membersByStatus.idle)}
        {renderMemberGroup("offline", membersByStatus.offline)}
      </div>
    </div>
  );
}