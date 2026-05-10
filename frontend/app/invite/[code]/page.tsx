"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { joinGuild, fetchGuild } from "@/lib/guilds";
import { useAuth } from "@/context/AuthContext";
import type { Guild } from "@/types";

export default function InvitePage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const code = params?.code as string;

  const [guild, setGuild] = useState<Guild | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState("");
  const [isLoadingGuild, setIsLoadingGuild] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace(`/login?redirect=/invite/${code}`);
      return;
    }

    async function fetchInvite() {
      try {
        const joinedGuild = await joinGuild(code);
        setGuild(joinedGuild);
      } catch {
        setError("This invite link is invalid or has expired.");
      } finally {
        setIsLoadingGuild(false);
      }
    }

    fetchInvite();
  }, [code, user, authLoading, router]);

  async function handleJoin() {
    if (!guild) return;
    setIsJoining(true);
    setError("");

    try {
      const { fetchChannels } = await import("@/lib/guilds");
      const channels = await fetchChannels(guild.id);
      const firstTextChannel = channels.find((c) => c.type === "TEXT");
      if (firstTextChannel) {
        router.replace(`/guilds/${guild.id}/${firstTextChannel.id}`);
      } else {
        router.replace(`/guilds/${guild.id}`);
      }
    } catch {
      setError("Failed to join the server. The link may have expired.");
      setIsJoining(false);
    }
  }

  if (authLoading || isLoadingGuild) {
    return (
      <div className="auth-shell">
        <div className="invite-loading">
          <p className="invite-loading-text">Loading invite…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="auth-shell">
        <div className="invite-card">
          <h1 className="invite-card-title">Invalid Invite</h1>
          <p className="invite-card-subtitle">{error}</p>
          <button className="invite-action-btn" onClick={() => router.replace("/channels/me")}>
            Back to app
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-shell">
      <div className="invite-card">
        <div className="invite-guild-icon">
          {guild?.name.charAt(0).toUpperCase()}
        </div>
        <p className="invite-card-label">You have been invited to join</p>
        <h1 className="invite-card-title">{guild?.name}</h1>
        <p className="invite-card-subtitle">
          {guild?.memberCount ?? 0} members
        </p>
        <button
          className="invite-action-btn"
          onClick={handleJoin}
          disabled={isJoining}
        >
          {isJoining ? "Joining…" : "Accept Invite"}
        </button>
      </div>
    </div>
  );
}