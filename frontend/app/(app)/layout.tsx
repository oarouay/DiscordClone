"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { mockGuilds, mockChannels, mockMembers } from "@/lib/mock";
import { GuildSidebar } from "@/components/guild/GuildSidebar";
import { ChannelSidebar } from "@/components/channel/ChannelSidebar";
import { UserPanel } from "@/components/shared/UserPanel";
import { VoiceControls } from "@/components/voice/VoiceControls";
import { KeyboardShortcutsModal } from "@/components/shared/KeyboardShortcutsModal";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import type { Guild } from "@/types";
import { VoiceCallProvider } from "@/context/GlobalVoiceCallContext";
import { MockDataProvider } from "@/context/MockDataProvider";

const MOCK_RICH_PRESENCE = { activity: "Playing Elden Ring", detail: "Exploring Limgrave • 2h 14m" };

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { showModal, setShowModal } = useKeyboardShortcuts();
  const [guilds, setGuilds] = useState<Guild[]>([]);
  const [selectedGuildId, setSelectedGuildId] = useState<string>();
  const [isLoadingGuilds, setIsLoadingGuilds] = useState(true);
  const [voiceChannel, setVoiceChannel] = useState<{ channelName: string; guildName: string } | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    Promise.resolve().then(() => {
      setGuilds(mockGuilds);
      if (mockGuilds.length > 0) {
        const firstGuild = mockGuilds[0];
        const firstTextChannel = firstGuild.channels.find((c) => c.type === "TEXT");
        setSelectedGuildId(firstGuild.id);
        const isGuildRoute = /^\/guilds\/\w+/.test(pathname);
        const isDMRoute = pathname.startsWith("/channels/me");
        if (!isGuildRoute && !isDMRoute && firstTextChannel) {
          router.push(`/guilds/${firstGuild.id}/${firstTextChannel.id}`);
        }
      }
      setIsLoadingGuilds(false);
    });
  }, [user, isLoading, router, pathname]);

  const handleCreateGuild = async (name: string, guildType: "HOUSE" | "CRIB") => {
    // TODO: replace with API call to POST /guilds
    const guildId = String(Date.now());
    const newGuild: Guild = {
      id: guildId, name, guildType, isPrivate: guildType === "HOUSE", ownerId: user?.id || "1",
      channels: [mockChannels.find((c) => c.category === "Rooms")!, mockChannels.find((c) => c.category === "Calls")!].map((c) => ({ ...c, guildId })),
      members: mockMembers.map((m) => ({ ...m, guildId })),
    };
    setGuilds((prev) => [...prev, newGuild]);
    mockGuilds.push(newGuild);
    setSelectedGuildId(newGuild.id);
  };

    const handleSelectGuild = (guildId: string) => {
    if (!guildId) {
      if (!pathname.startsWith("/channels/me")) {
        router.push("/channels/me");
      }
      return;
    }
    setSelectedGuildId(guildId);
    const guild = guilds.find((g) => g.id === guildId);
    const firstTextChannel = guild?.channels.find((c) => c.type === "TEXT");
    router.push(firstTextChannel ? `/guilds/${guildId}/${firstTextChannel.id}` : `/guilds/${guildId}`);
  };

  const isOnDMPage = pathname.includes("/channels/me");

  const handleJoinVoice = (channelName: string, guildName: string) => {
    setVoiceChannel({ channelName, guildName });
    setIsMuted(false);
    setIsDeafened(false);
  };

  const handleLeaveVoice = () => {
    setVoiceChannel(null);
    setIsMuted(false);
    setIsDeafened(false);
  };

  if (isLoading || isLoadingGuilds) {
    return (
      <div className="app-loading">
        <p className="app-loading-text">Loading…</p>
      </div>
    );
  }

  if (!user) return null;

  const bottomSlot = (
    <>
      {voiceChannel && (
        <div className="voice-bar-wrap">
          <div className="voice-bar-inner">
            <p className="voice-bar-channel">🔊 {voiceChannel.channelName}</p>
            <p className="voice-bar-guild">{voiceChannel.guildName}</p>
            <VoiceControls
              isMuted={isMuted}
              isDeafened={isDeafened}
              onToggleMute={() => setIsMuted((m) => !m)}
              onToggleDeafen={() => setIsDeafened((d) => !d)}
              onLeave={handleLeaveVoice}
            />
          </div>
        </div>
      )}
      <UserPanel
        user={user}
        richPresence={MOCK_RICH_PRESENCE}
        isMuted={isMuted}
        isDeafened={isDeafened}
        onToggleMute={() => setIsMuted((m) => !m)}
        onToggleDeafen={() => setIsDeafened((d) => !d)}
        onLogout={logout}
        onSave={(updates) => { Object.assign(user, updates); }}
      />
    </>
  );

  return (
    <MockDataProvider>
      <VoiceCallProvider>
        <div className="app-shell">
          <GuildSidebar
            guilds={guilds}
            currentGuildId={selectedGuildId}
            onGuildSelect={handleSelectGuild}
            onCreateGuild={handleCreateGuild}
          />
          {!isOnDMPage && <ChannelSidebar bottomSlot={bottomSlot} onJoinVoice={handleJoinVoice} />}
          <main className="app-main">{children}</main>
        </div>
        <KeyboardShortcutsModal isOpen={showModal} onClose={() => setShowModal(false)} />
      </VoiceCallProvider>
    </MockDataProvider>
  );
}