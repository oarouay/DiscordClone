"use client";

import Link from "next/link";
import { useState } from "react";
import type { Channel } from "@/types";

type ChannelItemProps = {
  channel: Channel;
  isSelected: boolean;
  guildId: string;
};

export function ChannelItem({ channel, isSelected, guildId }: ChannelItemProps) {
  const [hovered, setHovered] = useState(false);
  const icon = channel.type === "VOICE" ? "🎤" : "💬";

  const bg = isSelected ? "var(--bg-hover)" : hovered ? "var(--bg-hover)" : "transparent";
  const color = isSelected ? "var(--accent)" : hovered ? "var(--text-primary)" : undefined;

  return (
    <li style={{ listStyle: "none" }}>
      <Link
        href={`/guilds/${guildId}/${channel.id}`}
        className="channel-item"
        style={{ background: bg, color }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {isSelected && (
          <span
            style={{
              position: "absolute",
              left: 0,
              top: "20%",
              height: "60%",
              width: 3,
              background: "var(--accent)",
              borderRadius: "0 3px 3px 0",
            }}
          />
        )}
        <span style={{ fontSize: 13, opacity: 0.65, flexShrink: 0 }}>{icon}</span>
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {channel.name}
        </span>
      </Link>
    </li>
  );
}