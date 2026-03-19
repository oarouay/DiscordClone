"use client";

import { useState } from "react";
import type { Channel } from "@/types";
import { ChannelItem } from "./ChannelItem";
import { CreateChannelModal } from "./CreateChannelModal";

type ChannelListProps = {
  channels: Channel[];
  guildId: string;
  guildName: string;
  currentChannelId?: string;
  onCreateChannel: (name: string, type: "TEXT" | "VOICE", category: string) => Promise<void>;
};

export function ChannelList({
  channels,
  guildId,
  guildName,
  currentChannelId,
  onCreateChannel,
}: ChannelListProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);

  const roomsChannels = channels.filter((c) => c.category === "Rooms");
  const callsChannels = channels.filter((c) => c.category === "Calls");

  return (
    <>
      <div className="channel-sidebar">
        {/* Header */}
        <div className="channel-sidebar-header">
          <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {guildName}
          </span>
        </div>

        {/* Channel groups */}
        <ul className="channel-list">
          {roomsChannels.length > 0 && (
            <>
              <li style={{
                listStyle: "none",
                padding: "14px 10px 5px",
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--text-muted)",
                userSelect: "none",
              }}>
                🏠 Rooms
              </li>
              {roomsChannels.map((channel) => (
                <ChannelItem
                  key={channel.id}
                  channel={channel}
                  isSelected={currentChannelId === channel.id}
                  guildId={guildId}
                />
              ))}
            </>
          )}

          {callsChannels.length > 0 && (
            <>
              <li style={{
                listStyle: "none",
                padding: "14px 10px 5px",
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--text-muted)",
                userSelect: "none",
              }}>
                📞 Calls
              </li>
              {callsChannels.map((channel) => (
                <ChannelItem
                  key={channel.id}
                  channel={channel}
                  isSelected={currentChannelId === channel.id}
                  guildId={guildId}
                />
              ))}
            </>
          )}

          {channels.length === 0 && (
            <li style={{
              listStyle: "none",
              textAlign: "center",
              color: "var(--text-muted)",
              fontSize: 13,
              padding: "32px 8px",
            }}>
              No channels yet
            </li>
          )}
        </ul>

        {/* Add channel button */}
        <div style={{ padding: "0 8px 12px" }}>
          <button
            onClick={() => setShowCreateModal(true)}
            style={{
              width: "100%",
              padding: "8px 12px",
              background: "var(--bg-hover)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              color: "var(--text-secondary)",
              fontSize: 13,
              fontWeight: 600,
              fontFamily: "inherit",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              transition: "color 0.12s, border-color 0.12s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--accent)";
              e.currentTarget.style.borderColor = "var(--accent)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--text-secondary)";
              e.currentTarget.style.borderColor = "var(--border)";
            }}
          >
            ＋ Add Channel
          </button>
        </div>
      </div>

      {showCreateModal && (
        <CreateChannelModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={onCreateChannel}
        />
      )}
    </>
  );
}