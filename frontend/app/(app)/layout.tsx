"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { mockGuilds, mockChannels, mockMembers } from "@/lib/mock";
import { GuildSidebar } from "@/components/guild/GuildSidebar";
import { ChannelSidebar } from "@/components/channel/ChannelSidebar";
import type { Guild } from "@/types";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [guilds, setGuilds] = useState<Guild[]>([]);
  const [selectedGuildId, setSelectedGuildId] = useState<string>();
  const [isLoadingGuilds, setIsLoadingGuilds] = useState(true);

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace("/login");
      return;
    }

    // TODO: replace with API call to /guilds
    setGuilds(mockGuilds);
    if (mockGuilds.length > 0) {
      const firstGuild = mockGuilds[0];
      const firstTextChannel = firstGuild.channels.find((c) => c.type === "TEXT");
      setSelectedGuildId(firstGuild.id);
      if (firstTextChannel) {
        router.push(`/guilds/${firstGuild.id}/${firstTextChannel.id}`);
      }
    }
    setIsLoadingGuilds(false);
  }, [user, isLoading, router]);

  const handleCreateGuild = async (name: string, guildType: "HOUSE" | "CRIB") => {
    // TODO: replace with API call to POST /guilds
    const guildId = String(Date.now());
    const newGuild: Guild = {
      id: guildId,
      name,
      guildType,
      isPrivate: guildType === "HOUSE",
      ownerId: user?.id || "1",
      channels: [
          mockChannels.find((c) => c.category === "Rooms")!,
          mockChannels.find((c) => c.category === "Calls")!,
        ].map((c) => ({ ...c, guildId })),
      members: mockMembers.map((m) => ({ ...m, guildId })),
    };
    setGuilds((prev) => [...prev, newGuild]);
    mockGuilds.push(newGuild);
    setSelectedGuildId(newGuild.id);
  };

  const handleSelectGuild = (guildId: string) => {
    setSelectedGuildId(guildId);
    if (!guildId) {
      router.push("/channels/me");
    } else {
      const guild = guilds.find((g) => g.id === guildId);
      const firstTextChannel = guild?.channels.find((c) => c.type === "TEXT");
      if (firstTextChannel) {
        router.push(`/guilds/${guildId}/${firstTextChannel.id}`);
      } else {
        router.push(`/guilds/${guildId}`);
      }
    }
  };

  if (isLoading || isLoadingGuilds) {
    return (
      <div
        style={{
          height: "100vh",
          width: "100vw",
          background: "var(--bg-tertiary)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
        }}
      >
        <div style={{ fontSize: 48, opacity: 0.2 }}>💬</div>
        <p
          style={{
            fontFamily: "var(--font-display, 'Rajdhani', sans-serif)",
            fontSize: 18,
            fontWeight: 700,
            color: "var(--text-secondary)",
            letterSpacing: "0.3px",
          }}
        >
          Loading…
        </p>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <GuildSidebar
        guilds={guilds}
        currentGuildId={selectedGuildId}
        onGuildSelect={handleSelectGuild}
        onCreateGuild={handleCreateGuild}
      />
      <ChannelSidebar />
      <main className="app-main">{children}</main>
    </div>
  );
}