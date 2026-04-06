"use client";

import Link from "next/link";
import { useState } from "react";
import { MessageCircle, Mic } from "lucide-react";
import type { Channel } from "@/types";
import { VoiceSidebarEntry } from "@/components/voice/VoiceSidebarEntry";
import { useMockData } from "@/context/MockDataProvider";

type ChannelItemProps = {
  channel: Channel;
  isSelected: boolean;
  guildId: string;
  onJoinVoice?: (channelName: string) => void;
};

export function ChannelItem({ channel, isSelected, guildId, onJoinVoice }: ChannelItemProps) {
  const [hovered, setHovered] = useState(false);
  const isVoice = channel.type === "VOICE";
  const mockData = useMockData();
  
  // Get members in this voice channel
  const voiceMembers = mockData.voiceChannelMembers[channel.id] || [];

  return (
    <li style={{ listStyle: "none" }}>
      <Link
        href={isVoice ? "#" : `/guilds/${guildId}/${channel.id}`}
        className={`channel-item ${isSelected ? "active" : ""}`}
        style={{ 
          backgroundColor: isSelected || hovered ? "var(--bg-hover)" : undefined,
          color: isSelected ? "var(--accent)" : hovered ? "var(--text-primary)" : undefined,
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={isVoice ? (e) => { e.preventDefault(); onJoinVoice?.(channel.name); } : undefined}
        aria-current={isSelected ? "page" : undefined}
        aria-label={`${isVoice ? "Voice" : "Text"} channel: ${channel.name}`}
      >
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
      </Link>
      {isSelected && isVoice && voiceMembers.length > 0 && (
        <VoiceSidebarEntry members={voiceMembers} />
      )}
    </li>
  );
}