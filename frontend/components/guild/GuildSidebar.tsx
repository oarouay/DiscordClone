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

export function GuildSidebar({ guilds, currentGuildId, onGuildSelect, onCreateGuild }: GuildSidebarProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <>
      <div className="guild-sidebar" role="navigation" aria-label="Server list">
        <button
          onClick={() => onGuildSelect("")}
          className={`guild-dm-btn${!currentGuildId ? " guild-dm-btn--active" : ""}`}
          title="Direct Messages"
          aria-label="Go to Direct Messages"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </button>

        <div className="guild-divider" aria-hidden="true" />

        {guilds.map((guild) => (
          <button
            key={guild.id}
            onClick={() => onGuildSelect(guild.id)}
            className={`guild-btn${currentGuildId === guild.id ? " active" : ""}`}
            title={guild.name}
            aria-label={`Switch to ${guild.name}`}
            aria-current={currentGuildId === guild.id ? "page" : undefined}
          >
            <GuildIcon guild={guild} size="md" />
          </button>
        ))}

        <button onClick={() => setShowCreateModal(true)} title="Create Server" aria-label="Create a new server" className="guild-create-btn">+</button>
      </div>

      {showCreateModal && (
        <CreateGuildModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} onSubmit={onCreateGuild} />
      )}
    </>
  );
}