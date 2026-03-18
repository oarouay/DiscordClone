"use client";

import Link from "next/link";
import type { Channel } from "@/types";

type ChannelItemProps = {
  channel: Channel;
  isSelected: boolean;
  guildId: string;
};

export function ChannelItem({ channel, isSelected, guildId }: ChannelItemProps) {
  const icon = channel.type === "VOICE" ? "🎤" : "💬";

  return (
    <Link
      href={`/guilds/${guildId}/${channel.id}`}
      className={`
        block px-4 py-3 rounded-lg transition-colors
        ${
          isSelected
            ? "bg-bg-hover text-text-primary"
            : "text-text-secondary hover:bg-bg-hover hover:text-text-primary"
        }
      `}
    >
      <div className="flex items-center gap-3">
        <span className="text-lg">{icon}</span>
        <span className="text-base font-medium truncate">{channel.name}</span>
      </div>
    </Link>
  );
}
