"use client";

import type { Guild } from "@/types";

export function GuildIcon({ guild, size = "md" }: { guild: Guild; size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-12 h-12 text-sm",
    lg: "w-16 h-16 text-base",
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const initials = getInitials(guild.name);

  const typeIndicator = guild.guildType === "HOUSE" ? "🔒" : "🌍";

  return (
    <div className="relative">
      <div
        className={`
          ${sizeClasses[size]}
          bg-gradient-to-br from-indigo-500 to-purple-600
          rounded-full flex items-center justify-center
          text-white font-bold
        `}
      >
        {guild.iconUrl ? (
          <img
            src={guild.iconUrl}
            alt={guild.name}
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          initials
        )}
      </div>
      {size !== "sm" && (
        <div className="absolute bottom-0 right-0 text-lg bg-bg-primary rounded-full p-0.5">
          {typeIndicator}
        </div>
      )}
    </div>
  );
}
