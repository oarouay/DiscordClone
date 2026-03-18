"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Hash, Volume2 } from "lucide-react";
import { mockGuilds } from "@/lib/mock";

export function ChannelSidebar() {
  const params = useParams();
  const guildId = params?.guildId as string | undefined;
  const channelId = params?.channelId as string | undefined;

  const guild = mockGuilds.find((g) => g.id === guildId);

  if (!guild) {
    return <aside className="channel-sidebar" />;
  }

  return (
    <aside className="channel-sidebar">
      <div className="channel-sidebar-header">{guild.name}</div>
      <ul className="channel-list">
        {guild.channels.map((channel) => (
          <li key={channel.id}>
            <Link
              href={`/guilds/${guild.id}/${channel.id}`}
              className={`channel-item ${channelId === channel.id ? "channel-item-active" : ""}`}
            >
              {channel.type === "VOICE" ? (
                <Volume2 size={16} />
              ) : (
                <Hash size={16} />
              )}
              {channel.name}
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}