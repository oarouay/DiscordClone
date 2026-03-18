"use client";

import Link from "next/link";
import { mockGuilds } from "@/lib/mock";

export function GuildSidebar() {
  return (
    <nav className="guild-sidebar">
      {mockGuilds.map((guild) => (
        <Link
          key={guild.id}
          href={`/guilds/${guild.id}`}
          className="guild-icon"
          title={guild.name}
        >
          {guild.name.charAt(0).toUpperCase()}
        </Link>
      ))}
    </nav>
  );
}