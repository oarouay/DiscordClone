"use client";

import { useState } from "react";
import type { Guild } from "@/types";
import { GuildIcon } from "./GuildIcon";
import { CreateGuildModal } from "./CreateGuildModal";

type GuildSidebarProps = {
  guilds: Guild[];
  currentGuildId?: string;
  onGuildSelect: (guildId: string) => void;
  onCreateGuild: (name: string, type: "HOUSE" | "CRIB") => Promise<void>;
};

export function GuildSidebar({
  guilds,
  currentGuildId,
  onGuildSelect,
  onCreateGuild,
}: GuildSidebarProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);

  const houses = guilds.filter((g) => g.guildType === "HOUSE");
  const cribs = guilds.filter((g) => g.guildType === "CRIB");

  return (
    <>
      <div className="guild-sidebar">
        {/* DMs */}
        <button
          onClick={() => onGuildSelect("")}
          className="guild-icon"
          title="Direct Messages"
          style={{
            fontSize: 20,
            background: !currentGuildId ? "var(--accent)" : undefined,
            borderRadius: !currentGuildId ? "var(--radius)" : undefined,
            color: !currentGuildId ? "#fff" : undefined,
          }}
        >
          💬
        </button>

        {/* Divider */}
        <div style={{ width: 28, height: 1, background: "var(--border)", margin: "2px 0", flexShrink: 0 }} />

        {/* Houses */}
        {houses.map((guild) => (
          <button
            key={guild.id}
            onClick={() => onGuildSelect(guild.id)}
            className="guild-icon"
            title={guild.name}
            style={{
              padding: 0,
              background: currentGuildId === guild.id ? "var(--accent)" : undefined,
              borderRadius: currentGuildId === guild.id ? "var(--radius)" : undefined,
            }}
          >
            <GuildIcon guild={guild} size="md" />
          </button>
        ))}

        {/* Divider before cribs */}
        {cribs.length > 0 && (
          <div style={{ width: 28, height: 1, background: "var(--border)", margin: "2px 0", flexShrink: 0 }} />
        )}

        {/* Cribs */}
        {cribs.map((guild) => (
          <button
            key={guild.id}
            onClick={() => onGuildSelect(guild.id)}
            className="guild-icon"
            title={guild.name}
            style={{
              padding: 0,
              background: currentGuildId === guild.id ? "var(--accent)" : undefined,
              borderRadius: currentGuildId === guild.id ? "var(--radius)" : undefined,
            }}
          >
            <GuildIcon guild={guild} size="md" />
          </button>
        ))}

        {/* Create server */}
        <button
          onClick={() => setShowCreateModal(true)}
          title="Create Server"
          className="guild-icon"
          style={{
            border: "1.5px dashed var(--text-muted)",
            background: "transparent",
            color: "var(--text-muted)",
            fontSize: 22,
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget;
            el.style.background = "var(--success)";
            el.style.color = "#000";
            el.style.borderColor = "var(--success)";
            el.style.borderRadius = "var(--radius)";
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget;
            el.style.background = "transparent";
            el.style.color = "var(--text-muted)";
            el.style.borderColor = "var(--text-muted)";
            el.style.borderRadius = "50%";
          }}
        >
          ＋
        </button>
      </div>

      {showCreateModal && (
        <CreateGuildModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={onCreateGuild}
        />
      )}
    </>
  );
}