"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { MoreVertical, Clock, Ban, LogOut, Volume2, Mic } from "lucide-react";
import type { Member } from "@/types";
import { useMockData } from "@/context/MockDataProvider";
import { useAuth } from "@/context/AuthContext";
import { MemberProfileModal } from "../guild/MemberProfileModal";

interface MemberContextMenuProps {
  member: Member;
  isInVoiceChannel?: boolean;
  onClose?: () => void;
}

export function MemberContextMenu({ member, isInVoiceChannel = false, onClose }: MemberContextMenuProps) {
  const { user: currentUser } = useAuth();
  const menuRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showTimeoutMenu, setShowTimeoutMenu] = useState(false);
  const [showConfirm, setShowConfirm] = useState<"kick" | "ban" | null>(null);
  const [toastMessage, setToastMessage] = useState<string>("");

  const mockData = useMockData();

  const handleMenuClose = useCallback(() => {
    setIsOpen(false);
    onClose?.();
  }, [onClose]);

  const handleViewProfile = useCallback(() => {
    setShowProfile(true);
    handleMenuClose();
  }, [handleMenuClose]);

  const handleServerMute = () => {
    mockData.setMemberVoiceState(member.userId, {
      serverMuted: !mockData.memberVoiceStates[member.userId]?.serverMuted,
    });
    showToast(`${member.user.displayName} ${mockData.memberVoiceStates[member.userId]?.serverMuted ? "muted" : "unmuted"}`);
    handleMenuClose();
  };

  const handleServerDeafen = () => {
    mockData.setMemberVoiceState(member.userId, {
      serverDeafened: !mockData.memberVoiceStates[member.userId]?.serverDeafened,
    });
    showToast(
      `${member.user.displayName} ${mockData.memberVoiceStates[member.userId]?.serverDeafened ? "deafened" : "undeafened"}`
    );
    handleMenuClose();
  };

  const handleTimeout = (durationMs: number) => {
    mockData.timeoutMember(member.userId, durationMs);
    const durations: Record<number, string> = {
      60000: "1 minute",
      300000: "5 minutes",
      600000: "10 minutes",
      3600000: "1 hour",
    };
    showToast(`${member.user.displayName} timed out for ${durations[durationMs]}`);
    setShowTimeoutMenu(false);
    handleMenuClose();
  };

  const handleKick = () => {
    mockData.kickMember(member.userId);
    showToast(`@${member.user.username} was kicked.`);
    setShowConfirm(null);
    handleMenuClose();
  };

  const handleBan = () => {
    mockData.banMember(member.userId);
    showToast(`@${member.user.username} was banned.`);
    setShowConfirm(null);
    handleMenuClose();
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(""), 3000);
  };

  // Handle escape and outside clicks
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleMenuClose();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        handleMenuClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, handleMenuClose]);

  // Don't show menu for own user
  if (currentUser?.id === member.userId) {
    return null;
  }

  return (
    <>
      <div ref={menuRef} style={{ position: "relative" }}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "4px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--text-muted, #72767d)",
            transition: "color 0.2s",
          }}
          aria-label={`Member menu for ${member.user.displayName}`}
          aria-expanded={isOpen}
        >
          <MoreVertical size={18} />
        </button>

        {isOpen && (
          <div
            style={{
              position: "absolute",
              top: "100%",
              right: 0,
              marginTop: 8,
              background: "var(--bg-secondary, rgba(255,255,255,0.05))",
              border: "1px solid var(--border, rgba(255,255,255,0.1))",
              borderRadius: "8px",
              minWidth: "200px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
              zIndex: 1000,
              overflow: "hidden",
            }}
            role="menu"
          >
            {/* View Profile */}
            <MenuItem onClick={handleViewProfile} label="View Profile" />

            {/* Manage Roles */}
            <MenuItem
              onClick={() => {
                setShowRoleMenu(!showRoleMenu);
              }}
              label="Manage Roles"
            />

            {/* Timeout */}
            <MenuItem
              onClick={() => setShowTimeoutMenu(!showTimeoutMenu)}
              label="Timeout"
              icon={<Clock size={16} />}
            />

            {/* Server Mute (VC only) */}
            {isInVoiceChannel && (
              <MenuItem
                onClick={handleServerMute}
                label={mockData.memberVoiceStates[member.userId]?.serverMuted ? "Unmute" : "Mute"}
                icon={<Mic size={16} />}
                disabled={!isInVoiceChannel}
              />
            )}

            {/* Server Deafen (VC only) */}
            {isInVoiceChannel && (
              <MenuItem
                onClick={handleServerDeafen}
                label={mockData.memberVoiceStates[member.userId]?.serverDeafened ? "Undeafen" : "Deafen"}
                icon={<Volume2 size={16} />}
                disabled={!isInVoiceChannel}
              />
            )}

            {/* Kick */}
            <MenuItem
              onClick={() => setShowConfirm("kick")}
              label="Kick"
              icon={<LogOut size={16} />}
              style={{ color: "var(--error, #ed4245)" }}
            />

            {/* Ban */}
            <MenuItem
              onClick={() => setShowConfirm("ban")}
              label="Ban"
              icon={<Ban size={16} />}
              style={{ color: "var(--error, #ed4245)" }}
            />
          </div>
        )}
      </div>

      {/* Timeout submenu */}
      {showTimeoutMenu && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999,
          }}
          onClick={() => setShowTimeoutMenu(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "absolute",
              background: "var(--bg-secondary, rgba(255,255,255,0.05))",
              border: "1px solid var(--border, rgba(255,255,255,0.1))",
              borderRadius: "8px",
              minWidth: "150px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            }}
          >
            <MenuItem onClick={() => handleTimeout(60000)} label="1 minute" small />
            <MenuItem onClick={() => handleTimeout(300000)} label="5 minutes" small />
            <MenuItem onClick={() => handleTimeout(600000)} label="10 minutes" small />
            <MenuItem onClick={() => handleTimeout(3600000)} label="1 hour" small />
          </div>
        </div>
      )}

      {/* Confirmation dialog */}
      {showConfirm && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "var(--bg-secondary, rgba(255,255,255,0.05))",
            border: "1px solid var(--border, rgba(255,255,255,0.1))",
            borderRadius: "8px",
            padding: "20px",
            minWidth: "300px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
            zIndex: 1001,
          }}
          role="alertdialog"
        >
          <p style={{ margin: "0 0 16px 0", color: "var(--text-primary, #fff)" }}>
            {showConfirm === "kick"
              ? `Kick @${member.user.username}?`
              : `Ban @${member.user.username}?`}
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => (showConfirm === "kick" ? handleKick() : handleBan())}
              style={{
                flex: 1,
                padding: "8px 16px",
                background: "var(--error, #ed4245)",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: 500,
              }}
            >
              Confirm
            </button>
            <button
              onClick={() => setShowConfirm(null)}
              style={{
                flex: 1,
                padding: "8px 16px",
                background: "var(--bg-hover, rgba(255,255,255,0.1))",
                color: "var(--text-primary, #fff)",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: 500,
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Toast message */}
      {toastMessage && (
        <div
          style={{
            position: "fixed",
            bottom: 20,
            left: 20,
            background: "var(--success, #23a55a)",
            color: "white",
            padding: "12px 16px",
            borderRadius: "4px",
            zIndex: 1002,
          }}
          role="status"
        >
          {toastMessage}
        </div>
      )}

      {/* Role management and profile modal */}
      {showRoleMenu && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "var(--bg-secondary, rgba(255,255,255,0.05))",
            border: "1px solid var(--border, rgba(255,255,255,0.1))",
            borderRadius: "8px",
            padding: "20px",
            minWidth: "400px",
            maxHeight: "80vh",
            overflow: "auto",
            boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
            zIndex: 1001,
          }}
        >
          <h3 style={{ margin: "0 0 16px 0", color: "var(--text-primary, #fff)" }}>
            Manage Roles for {member.user.displayName}
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {mockData.roles.map((role) => (
              <label
                key={role.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "8px",
                  cursor: "pointer",
                  borderRadius: "4px",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--bg-hover, rgba(255,255,255,0.1))";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                <input
                  type="checkbox"
                  checked={member.roles.some((r) => r.id === role.id)}
                  onChange={(e) => {
                    const newRoles = e.target.checked
                      ? [...member.roles.map((r) => r.id), role.id]
                      : member.roles.filter((r) => r.id !== role.id).map((r) => r.id);
                    mockData.updateMemberRoles(member.userId, newRoles);
                  }}
                  style={{ cursor: "pointer" }}
                  aria-label={`Toggle role ${role.name}`}
                />
                <span
                  style={{
                    display: "inline-block",
                    width: 12,
                    height: 12,
                    borderRadius: "2px",
                    background: role.color || "#99aab5",
                    marginRight: 4,
                  }}
                />
                <span style={{ color: "var(--text-primary, #fff)" }}>{role.name}</span>
              </label>
            ))}
          </div>
          <button
            onClick={() => setShowRoleMenu(false)}
            style={{
              marginTop: 16,
              padding: "8px 16px",
              background: "var(--bg-hover, rgba(255,255,255,0.1))",
              color: "var(--text-primary, #fff)",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Done
          </button>
        </div>
      )}

      {showProfile && <MemberProfileModal member={member} onClose={() => setShowProfile(false)} />}
    </>
  );
}

function MenuItem({
  onClick,
  label,
  icon,
  disabled = false,
  style,
  small = false,
}: {
  onClick: () => void;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  style?: React.CSSProperties;
  small?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: "100%",
        padding: small ? "8px 12px" : "12px 16px",
        background: "none",
        border: "none",
        cursor: disabled ? "not-allowed" : "pointer",
        color: disabled ? "var(--text-muted, #72767d)" : "var(--text-primary, #fff)",
        fontSize: small ? 12 : 14,
        textAlign: "left",
        display: "flex",
        alignItems: "center",
        gap: 8,
        opacity: disabled ? 0.5 : 1,
        transition: "background 0.15s",
        ...style,
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.background = "var(--bg-hover, rgba(255,255,255,0.15))";
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
      }}
      aria-label={label}
    >
      {icon}
      {label}
    </button>
  );
}
