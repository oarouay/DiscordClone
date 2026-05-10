"use client";

import { useState, useEffect } from "react";
import { useParams, usePathname } from "next/navigation";
import { fetchChannels, createChannel } from "@/lib/guilds";
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
  const [channels, setChannels] = useState<Channel[]>([]);

  useEffect(() => {
    if (!guildId) return;
    fetchChannels(guildId)
      .then(setChannels)
      .catch((err) => console.error("Failed to load channels:", err));
  }, [guildId]);

  const handleCreateChannel = async (name: string, type: "TEXT" | "VOICE", category: string) => {
    if (!guildId) return;
    try {
      const newChannel = await createChannel(guildId, { name, type, category });
      setChannels((prev) => [...prev, newChannel]);
    } catch (err) {
      console.error("Failed to create channel:", err);
    }
  };

  if (!guildId) {
    return (
      <div className="channel-sidebar">
        {bottomSlot && <div className="channel-bottom-slot">{bottomSlot}</div>}
      </div>
    );
  }

  return (
    <div className="channel-sidebar">
      <ChannelList
        channels={channels}
        guildId={guildId}
        guildName={guildId}
        isPublic={true}
        currentChannelId={channelId}
        onCreateChannel={handleCreateChannel}
        onInvite={() => setShowInvite(true)}
        onJoinVoice={onJoinVoice}
        bottomSlot={bottomSlot}
      />
      {showInvite && (
        <InviteModal guildId={guildId} guildName={guildId} onClose={() => setShowInvite(false)} />
      )}
    </div>
  );
}