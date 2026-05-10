"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { fetchMyGuilds, createGuild } from "@/lib/guilds";
import { GuildSidebar } from "@/components/guild/GuildSidebar";
import { ChannelSidebar } from "@/components/channel/ChannelSidebar";
import { UserPanel } from "@/components/shared/UserPanel";
import { VoiceControls } from "@/components/voice/VoiceControls";
import { KeyboardShortcutsModal } from "@/components/shared/KeyboardShortcutsModal";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import type { Guild } from "@/types";
import { VoiceCallProvider } from "@/context/GlobalVoiceCallContext";
import { MockDataProvider } from "@/context/MockDataProvider";

const MOCK_RICH_PRESENCE = { activity: "Playing Elden Ring", detail: "Exploring Limgrave - 2h 14m" };

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { showModal, setShowModal } = useKeyboardShortcuts();
  const [guilds, setGuilds] = useState<Guild[]>([]);
  const [isLoadingGuilds, setIsLoadingGuilds] = useState(true);
  const [voiceChannel, setVoiceChannel] = useState<{ channelName: string; guildName: string } | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);

  const currentGuildId = useMemo(() => {
    const match = /^\/guilds\/([^/]+)/.exec(pathname);
    return match ? match[1] : undefined;
  }, [pathname]);

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    fetchMyGuilds()
      .then((data) => {
        setGuilds(data);
        if (data.length > 0 && !currentGuildId) {
          const firstGuild = data[0];
          const isGuildRoute = /^\/guilds\/\w+/.test(pathname);
          const isDMRoute = pathname.startsWith("/channels/me");
          if (!isGuildRoute && !isDMRoute) {
            router.push(`/guilds/${firstGuild.id}`);
          }
        }
      })
      .catch((err) => console.error("Failed to load guilds:", err))
      .finally(() => setIsLoadingGuilds(false));
  }, [user, isLoading, router, pathname, currentGuildId]);

  const handleCreateGuild = async (name: string, guildType: "HOUSE" | "CRIB") => {
    try {
      const newGuild = await createGuild({ name, guildType });
      setGuilds((prev) => [...prev, newGuild]);
      router.push(`/guilds/${newGuild.id}`);
    } catch (err) {
      console.error("Failed to create guild:", err);
    }
  };

  const handleSelectGuild = (guildId: string) => {
    if (!guildId) {
      if (!pathname.startsWith("/channels/me")) {
        router.push("/channels/me");
      }
      return;
    }
    router.push(`/guilds/${guildId}`);
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
        <p className="app-loading-text">Loading...</p>
      </div>
    );
  }

  if (!user) return null;

  const bottomSlot = (
    <>
      {voiceChannel && (
        <div className="voice-bar-wrap">
          <div className="voice-bar-inner">
            <p className="voice-bar-channel">{voiceChannel.channelName}</p>
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
            currentGuildId={currentGuildId}
            onGuildSelect={handleSelectGuild}
            onCreateGuild={handleCreateGuild}
          />
          {!isOnDMPage && <ChannelSidebar guildName={guilds.find((g) => g.id === currentGuildId)?.name ?? ""} bottomSlot={bottomSlot} onJoinVoice={handleJoinVoice} />}
          <main className="app-main">{children}</main>
        </div>
        <KeyboardShortcutsModal isOpen={showModal} onClose={() => setShowModal(false)} />
      </VoiceCallProvider>
    </MockDataProvider>
  );
}