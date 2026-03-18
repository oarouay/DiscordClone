"use client";

import { useState } from "react";
import Link from "next/link";
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
      <div className="w-24 bg-bg-tertiary border-r border-border flex flex-col items-center py-6 gap-6 h-screen overflow-y-auto">
        {/* DMs/Condos */}
        <Link
          href="/channels/@me"
          className={`
            w-16 h-16 rounded-full flex items-center justify-center
            transition-all duration-200 flex-shrink-0
            ${
              !currentGuildId
                ? "bg-accent rounded-3xl"
                : "bg-bg-secondary hover:bg-bg-primary hover:rounded-3xl"
            }
          `}
        >
          <span className="text-2xl">💬</span>
        </Link>

        <div className="w-10 h-px bg-border" />

        {/* Houses */}
        <div className="flex flex-col gap-4 w-full items-center">
          {houses.map((guild) => (
            <button
              key={guild.id}
              onClick={() => onGuildSelect(guild.id)}
              className={`
                transition-all duration-200 flex-shrink-0
                ${
                  currentGuildId === guild.id
                    ? "rounded-3xl"
                    : "hover:rounded-3xl rounded-full"
                }
              `}
              title={guild.name}
            >
              <GuildIcon guild={guild} size="md" />
            </button>
          ))}
        </div>

        <div className="w-10 h-px bg-border" />

        {/* Cribs */}
        <div className="flex flex-col gap-4 w-full items-center">
          {cribs.map((guild) => (
            <button
              key={guild.id}
              onClick={() => onGuildSelect(guild.id)}
              className={`
                transition-all duration-200 flex-shrink-0
                ${
                  currentGuildId === guild.id
                    ? "rounded-3xl"
                    : "hover:rounded-3xl rounded-full"
                }
              `}
              title={guild.name}
            >
              <GuildIcon guild={guild} size="md" />
            </button>
          ))}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Create Guild Button */}
        <button
          onClick={() => setShowCreateModal(true)}
          className="
            w-16 h-16 rounded-full flex items-center justify-center
            bg-bg-secondary hover:bg-accent hover:rounded-3xl
            transition-all duration-200
            text-2xl flex-shrink-0
          "
          title="Create Server"
        >
          ➕
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