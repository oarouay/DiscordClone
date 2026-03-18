"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { mockGuilds } from "@/lib/mock";
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
      setSelectedGuildId(mockGuilds[0].id);
    }
    setIsLoadingGuilds(false);
  }, [user, isLoading, router]);

  const handleCreateGuild = async (name: string, guildType: "HOUSE" | "CRIB") => {
    // TODO: replace with API call to POST /guilds
    const newGuild: Guild = {
      id: String(Date.now()),
      name,
      guildType,
      isPrivate: guildType === "HOUSE",
      ownerId: user?.id || "1",
      channels: [],
      members: [],
    };
    setGuilds((prev) => [...prev, newGuild]);
    setSelectedGuildId(newGuild.id);
  };

  const handleSelectGuild = (guildId: string) => {
    setSelectedGuildId(guildId);
    if (!guildId) {
      // Navigate to DMs when guildId is empty
      router.push("/channels/me");
    } else {
      router.push(`/guilds/${guildId}`);
    }
  };

  if (isLoading || isLoadingGuilds) {
    return (
      <div className="h-screen w-screen bg-bg-primary flex items-center justify-center">
        <p className="text-text-primary">Loading...</p>
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