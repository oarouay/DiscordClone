"use client";

import type { Member, GuildMember } from "@/types";
import { Avatar } from "@/components/shared/Avatar";

type MemberLike = Member | GuildMember;

interface MemberListProps {
  members: MemberLike[];
}

function getMemberData(m: MemberLike) {
  if ("user" in m) {
    const member = m as Member;
    return {
      id: member.userId,
      displayName: member.user.displayName,
      username: member.user.username,
      status: member.user.status,
      avatarUrl: member.user.avatarUrl,
      role: "MEMBER" as const,
    };
  }
  const gm = m as GuildMember;
  return {
    id: gm.userId,
    displayName: gm.displayName,
    username: gm.username,
    status: "offline" as const,
    avatarUrl: gm.avatarUrl,
    role: gm.role,
  };
}

export function MemberList({ members }: MemberListProps) {
  const enriched = members.map(getMemberData);

  const roleOrder = ["OWNER", "ADMIN", "MOD", "MEMBER"] as const;
  const grouped = roleOrder
    .map((role) => ({
      role,
      members: enriched.filter((m) => m.role === role),
    }))
    .filter((g) => g.members.length > 0);

  const roleColors: Record<string, string> = {
    OWNER: "var(--accent)",
    ADMIN: "var(--danger)",
    MOD: "var(--success)",
    MEMBER: "var(--text-primary)",
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

      <div style={{ flex: 1, overflowY: "auto", padding: "10px 6px" }}>
        {grouped.map(({ role, members: roleMembers }) => (
          <div key={role}>
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
              {role}
              <span style={{ color: "var(--text-muted)" }}>— {roleMembers.length}</span>
              <span style={{ flex: 1, height: 1, background: "var(--border)" }} />
            </div>

            {roleMembers.map((member) => (
              <div
                key={member.id}
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
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <Avatar
                    user={{
                      id: member.id,
                      username: member.username,
                      displayName: member.displayName,
                      email: "",
                      status: member.status,
                      avatarUrl: member.avatarUrl,
                    }}
                    size="sm"
                  />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: roleColors[role] || "var(--text-primary)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {member.displayName}
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
                  @{member.username}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}