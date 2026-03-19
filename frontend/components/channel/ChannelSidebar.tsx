"use client";

import { useState } from "react";
import { useParams, usePathname } from "next/navigation";
import { mockGuilds } from "@/lib/mock";
import { ChannelList } from "./ChannelList";
import { InviteModal } from "@/components/guild/InviteModal";
import type { Channel } from "@/types";

export function ChannelSidebar() {
  usePathname();
  const params = useParams();
  const guildId = params?.guildId as string | undefined;
  const channelId = params?.channelId as string | undefined;
  const [showInvite, setShowInvite] = useState(false);

  const guild = mockGuilds.find((g) => g.id === guildId);

  const handleCreateChannel = async (name: string, type: "TEXT" | "VOICE", category: string) => {
    // TODO: replace with API call to POST /guilds/:guildId/channels
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

  if (!guild) return null;

  return (
    <>
      <ChannelList
        channels={guild.channels}
        guildId={guild.id}
        guildName={guild.name}
        currentChannelId={channelId}
        onCreateChannel={handleCreateChannel}
        onInvite={() => setShowInvite(true)}
      />
      {showInvite && (
        <InviteModal
          guildId={guild.id}
          guildName={guild.name}
          onClose={() => setShowInvite(false)}
        />
      )}
    </>
  );
}