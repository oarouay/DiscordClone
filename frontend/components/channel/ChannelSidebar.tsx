"use client";

import { useState } from "react";
import { useParams, usePathname } from "next/navigation";
import { mockGuilds } from "@/lib/mock";
import { ChannelList } from "./ChannelList";
import { InviteModal } from "@/components/guild/InviteModal";
import type { Channel } from "@/types";

export function ChannelSidebar({
  bottomSlot,
  onJoinVoice,
}: {
  bottomSlot?: React.ReactNode;
  onJoinVoice?: (channelName: string, guildName: string) => void;
}) {
  usePathname();
  const params = useParams();
  const guildId = params?.guildId as string | undefined;
  const channelId = params?.channelId as string | undefined;
  const [showInvite, setShowInvite] = useState(false);

  const guild = mockGuilds.find((g) => g.id === guildId);

  const handleCreateChannel = async (name: string, type: "TEXT" | "VOICE", category: string) => {
    if (guild) {
      const newChannel: Channel = {
        id: String(Date.now()),
        guildId: guild.id,
        name,
        type,
        category,
        subType: type === "TEXT" ? "DEFAULT" : undefined,
        position: guild.channels.length,
      };
      guild.channels.push(newChannel);
    }
  };

  // No guild — only render bottom slot
  if (!guild) {
    return (
      <div className="channel-sidebar">
        {bottomSlot && <div className="channel-bottom-slot">{bottomSlot}</div>}
      </div>
    );
  }

  return (
    <div className="channel-sidebar">
      <ChannelList
        channels={guild.channels}
        guildId={guild.id}
        guildName={guild.name}
        isPublic={!guild.isPrivate}
        currentChannelId={channelId}
        onCreateChannel={handleCreateChannel}
        onInvite={() => setShowInvite(true)}
        onJoinVoice={onJoinVoice}
        bottomSlot={bottomSlot}
      />
      {showInvite && (
        <InviteModal guildId={guild.id} guildName={guild.name} onClose={() => setShowInvite(false)} />
      )}
    </div>
  );
}