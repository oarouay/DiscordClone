"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import type { Member } from "@/types";
import { Avatar } from "@/components/shared/Avatar";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useMockData } from "@/context/MockDataProvider";

interface MemberProfileModalProps {
  member: Member;
  onClose: () => void;
}

export function MemberProfileModal({ member, onClose }: MemberProfileModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const mockData = useMockData();

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  const joinedDate = new Date(member.joinedAt);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-title"
    >
      <div
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--bg-secondary, rgba(255,255,255,0.05))",
          border: "1px solid var(--border, rgba(255,255,255,0.1))",
          borderRadius: "8px",
          padding: "20px",
          minWidth: "320px",
          maxWidth: "400px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
        }}
      >
        {/* Close button */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2
            id="profile-title"
            style={{
              margin: 0,
              color: "var(--text-primary, #fff)",
              fontSize: 18,
              fontWeight: 600,
            }}
          >
            Member Profile
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--text-muted, #72767d)",
              padding: "4px",
            }}
            aria-label="Close profile modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Avatar and basic info */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginBottom: 20,
            gap: 12,
          }}
        >
          <Avatar user={member.user} size="lg" />
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: "var(--text-primary, #fff)",
              }}
            >
              {member.user.displayName}
            </div>
            <div
              style={{
                fontSize: 13,
                color: "var(--text-muted, #72767d)",
              }}
            >
              @{member.user.username}
            </div>
          </div>

          {/* Status */}
          <StatusBadge user={member.user} size="md" showLabel={true} />
        </div>

        {/* Divider */}
        <div
          style={{
            height: 1,
            background: "var(--border, rgba(255,255,255,0.1))",
            marginBottom: 16,
          }}
        />

        {/* Member info */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            marginBottom: 16,
          }}
        >
          {/* Joined date */}
          <div>
            <div
              style={{
                fontSize: 11,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                fontWeight: 600,
                color: "var(--text-muted, #72767d)",
                marginBottom: 4,
              }}
            >
              Joined
            </div>
            <div
              style={{
                fontSize: 13,
                color: "var(--text-primary, #fff)",
              }}
            >
              {joinedDate.toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
          </div>

          {/* Roles */}
          {member.roles.length > 0 && (
            <div>
              <div
                style={{
                  fontSize: 11,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  fontWeight: 600,
                  color: "var(--text-muted, #72767d)",
                  marginBottom: 8,
                }}
              >
                Roles
              </div>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 6,
                }}
              >
                {member.roles.map((role) => (
                  <span
                    key={role.id}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "4px 8px",
                      background: "rgba(0,0,0,0.2)",
                      borderRadius: "4px",
                      fontSize: 12,
                      color: role.color || "#99aab5",
                      border: `1px solid ${role.color || "#99aab5"}`,
                    }}
                  >
                    <span
                      style={{
                        display: "inline-block",
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: role.color || "#99aab5",
                      }}
                    />
                    {role.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Timeout status */}
          {mockData.isMemberTimedOut(member.userId) && (
            <div
              style={{
                padding: "8px 12px",
                background: "rgba(237, 66, 69, 0.15)",
                borderLeft: "4px solid #ed4245",
                borderRadius: "4px",
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  color: "#ed4245",
                  fontWeight: 500,
                }}
              >
                🕐 Timed out
              </div>
            </div>
          )}
        </div>

        {/* Close button action */}
        <button
          onClick={onClose}
          style={{
            width: "100%",
            padding: "10px 16px",
            background: "var(--bg-hover, rgba(255,255,255,0.1))",
            color: "var(--text-primary, #fff)",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: 500,
            fontSize: 14,
            transition: "background 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--bg-tertiary, rgba(255,255,255,0.15))";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "var(--bg-hover, rgba(255,255,255,0.1))";
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
}
