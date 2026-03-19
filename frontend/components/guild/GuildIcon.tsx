"use client";

import type { Guild } from "@/types";

export function GuildIcon({ guild, size = "md" }: { guild: Guild; size?: "sm" | "md" | "lg" }) {
  const getInitials = (name: string) => name.split(" ").map((w) => w[0]).join("").substring(0, 2).toUpperCase();

  return (
    <div className={`guild-icon-wrap guild-icon-wrap--${size}`}>
      <div className={`guild-icon-inner guild-icon-inner--${size}`}>
        {guild.iconUrl ? (
          <img src={guild.iconUrl} alt={guild.name} className="guild-icon-img" />
        ) : (
          getInitials(guild.name)
        )}
      </div>
    </div>
  );
}