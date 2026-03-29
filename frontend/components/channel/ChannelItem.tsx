"use client";

import Link from "next/link";
import { useState } from "react";
import { MessageCircle, Mic } from "lucide-react";
import type { Channel } from "@/types";
import { Avatar } from "@/components/shared/Avatar";

type ChannelItemProps = {
  channel: Channel;
  isSelected: boolean;
  guildId: string;
  onJoinVoice?: (channelName: string) => void;
};

export function ChannelItem({ channel, isSelected, guildId, onJoinVoice }: ChannelItemProps) {
  const [hovered, setHovered] = useState(false);
  const isVoice = channel.type === "VOICE";
  const connectedUsers = channel.connectedUsers || [];

  return (
    <li style={{ listStyle: "none" }}>
      <div>
        <Link
          href={isVoice ? "#" : `/guilds/${guildId}/${channel.id}`}
          className={`channel-item ${isSelected ? "active" : ""}`}
          style={{ 
            backgroundColor: isSelected || hovered ? "var(--bg-hover)" : undefined,
            color: isSelected ? "var(--accent)" : hovered ? "var(--text-primary)" : undefined,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onClick={isVoice ? (e) => { e.preventDefault(); onJoinVoice?.(channel.name); } : undefined}
          aria-current={isSelected ? "page" : undefined}
          aria-label={`${isVoice ? "Voice" : "Text"} channel: ${channel.name}${isVoice && connectedUsers.length > 0 ? ` with ${connectedUsers.length} user(s)` : ""}`}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            {isSelected && (
              <span
                className="channel-selection-indicator"
                aria-hidden="true"
              />
            )}
            <span className="channel-icon" aria-hidden="true">
              {isVoice ? (
                <Mic size={16} strokeWidth={2} />
              ) : (
                <MessageCircle size={16} strokeWidth={2} />
              )}
            </span>
            <span className="channel-item-text">
              {channel.name}
            </span>
          </div>
        </Link>

        {/* ── Connected Users Display ── */}
        {isVoice && connectedUsers.length > 0 && (
          <div style={{
            paddingLeft: "32px",
            paddingRight: "8px",
            paddingTop: "4px",
            paddingBottom: "8px",
            display: "flex",
            flexDirection: "column",
            gap: "6px",
          }}>
            {connectedUsers.slice(0, 5).map((voiceUser) => (
              <div
                key={voiceUser.userId}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "12px",
                  color: "var(--text-muted)",
                }}
              >
                <div style={{ position: "relative" }}>
                  <Avatar user={voiceUser.user} size="sm" />
                  {voiceUser.isMuted && (
                    <div style={{
                      position: "absolute",
                      bottom: "-2px",
                      right: "-2px",
                      background: "var(--danger)",
                      borderRadius: "50%",
                      width: "14px",
                      height: "14px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "8px",
                      color: "#fff",
                    }}>
                      🔇
                    </div>
                  )}
                </div>
                <span>{voiceUser.user.displayName}</span>
              </div>
            ))}
            {connectedUsers.length > 5 && (
              <div style={{
                fontSize: "12px",
                color: "var(--text-muted)",
                paddingLeft: "24px",
              }}>
                +{connectedUsers.length - 5} more
              </div>
            )}
          </div>
        )}
      </div>
    </li>
  );
}