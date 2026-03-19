"use client";

import { useState } from "react";
import { Globe, Settings } from "lucide-react";
import type { Channel } from "@/types";
import { ChannelItem } from "./ChannelItem";
import { CreateChannelModal } from "./CreateChannelModal";
import { useRouter } from "next/navigation";

type ChannelListProps = {
  channels: Channel[];
  guildId: string;
  guildName: string;
  isPublic: boolean;
  currentChannelId?: string;
  onCreateChannel: (name: string, type: "TEXT" | "VOICE", category: string) => Promise<void>;
  onInvite: () => void;
  onJoinVoice?: (channelName: string, guildName: string) => void;
  bottomSlot?: React.ReactNode;
};

export function ChannelList({ channels, guildId, guildName, isPublic, currentChannelId, onCreateChannel, onInvite, onJoinVoice, bottomSlot }: ChannelListProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const roomsChannels = channels.filter((c) => c.category === "Rooms");
  const callsChannels = channels.filter((c) => c.category === "Calls");
  const router = useRouter();

  return (
    <>
      <div className="channel-sidebar">
        <div className="channel-header">
          <div className="server-name-section">
            {isPublic && <Globe size={16} className="public-indicator" />}
            <span className="channel-name">{guildName}</span>
          </div>
          <div className="header-buttons">
            <button onClick={onInvite} aria-label="Invite people" title="Invite people" className="header-btn header-btn--invite">+</button>
            <button onClick={() => router.push(`/guilds/${guildId}/settings`)} aria-label="Server settings" title="Server settings" className="header-btn">
              <Settings size={18} strokeWidth={2} />
            </button>
          </div>
        </div>

        <ul className="channel-list" role="navigation" aria-label={`Channels in ${guildName}`}>
          {roomsChannels.length > 0 && (
            <>
              <li className="category-header">
                <span className="category-title">Text Channels</span>
                <button onClick={() => setShowCreateModal(true)} aria-label="Add text channel" className="add-channel-btn">+</button>
              </li>
              {roomsChannels.map((channel) => (
                <ChannelItem key={channel.id} channel={channel} isSelected={currentChannelId === channel.id} guildId={guildId} />
              ))}
            </>
          )}

          {callsChannels.length > 0 && (
            <>
              <li className="category-header">
                <span className="category-title">Voice Channels</span>
                <button onClick={() => setShowCreateModal(true)} aria-label="Add voice channel" className="add-channel-btn">+</button>
              </li>
              {callsChannels.map((channel) => (
                <ChannelItem key={channel.id} channel={channel} isSelected={currentChannelId === channel.id} guildId={guildId}
                  onJoinVoice={(chName) => onJoinVoice?.(chName, guildName)} />
              ))}
            </>
          )}

          {channels.length === 0 && <li className="channel-list-empty">No channels yet</li>}
        </ul>

        {bottomSlot && <div className="channel-bottom-slot">{bottomSlot}</div>}
      </div>

      {showCreateModal && (
        <CreateChannelModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} onSubmit={onCreateChannel} />
      )}
    </>
  );
}