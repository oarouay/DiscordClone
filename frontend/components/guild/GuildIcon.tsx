"use client";

import type { Guild } from "@/types";

export function GuildIcon({ guild, size = "md" }: { guild: Guild; size?: "sm" | "md" | "lg" }) {
  const sizeMap = {
    sm: { dim: 32, font: 12 },
    md: { dim: 44, font: 15 },
    lg: { dim: 56, font: 18 },
  };
  const { dim, font } = sizeMap[size];

  const getInitials = (name: string) =>
    name.split(" ").map((w) => w[0]).join("").substring(0, 2).toUpperCase();

  const typeIndicator = guild.guildType === "HOUSE" ? "🔒" : "🌍";

  return (
    <div style={{ position: "relative", width: dim, height: dim, flexShrink: 0 }}>
      <div
        style={{
          width: dim,
          height: dim,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #6c6fff 0%, #a78bfa 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          fontFamily: "var(--font-display, 'Rajdhani', sans-serif)",
          fontWeight: 700,
          fontSize: font,
          letterSpacing: "0.5px",
          overflow: "hidden",
        }}
      >
        {guild.iconUrl ? (
          <img
            src={guild.iconUrl}
            alt={guild.name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          getInitials(guild.name)
        )}
      </div>

      {size !== "sm" && (
        <div
          style={{
            position: "absolute",
            bottom: -1,
            right: -1,
            width: 16,
            height: 16,
            borderRadius: "50%",
            background: "var(--bg-tertiary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 9,
            lineHeight: 1,
          }}
        >
          {typeIndicator}
        </div>
      )}
    </div>
  );
}