"use client";

export const dynamic = "force-dynamic";

import { useParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { MessageCircle, Mic } from "lucide-react";
import { mockUser } from "@/lib/mock";
import { VoiceChannel } from "@/components/voice/VoiceChannel";
import MessageList from "@/components/chat/MessageList";
import MessageInput from "@/components/chat/MessageInput";
import { MemberList } from "@/components/guild/MemberList";
import {
  fetchChannels,
  fetchChannelMessages,
  fetchGuildMembers,
  sendGuildMessage,
} from "@/lib/guilds";
import type { GuildMessage, Channel, GuildMember, Message } from "@/types";

export default function ChannelPage() {
  const params = useParams();
  const guildId = params?.guildId as string;
  const channelId = params?.channelId as string;

  const [messages, setMessages] = useState<GuildMessage[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [members, setMembers] = useState<GuildMember[]>([]);
  const [loading, setLoading] = useState(true);

  const channel = channels.find((c) => c.id === channelId);

  // Fetch channels + members for this guild
  useEffect(() => {
    if (!guildId) return;
    setLoading(true);
    Promise.all([fetchChannels(guildId), fetchGuildMembers(guildId)])
      .then(([ch, mem]) => {
        setChannels(ch);
        setMembers(mem);
      })
      .catch((err) => console.error("Failed to load guild data:", err))
      .finally(() => setLoading(false));
  }, [guildId]);

  // Fetch messages for this channel
  useEffect(() => {
    if (!channelId || !guildId) return;
    fetchChannelMessages(guildId, channelId)
      .then(setMessages)
      .catch((err) => console.error("Failed to load messages:", err));
  }, [guildId, channelId]);

  // Send message via REST (WebSocket for guild channels in Commit 4)
  const handleSendMessage = useCallback(
    async (content: string, files: File[]) => {
      if (!guildId || !channelId) return;
      try {
        // TODO: handle file attachments via multipart/form-data
        await sendGuildMessage(guildId, channelId, { content });
      } catch (err) {
        console.error("Failed to send message:", err);
      }
    },
    [guildId, channelId],
  );

  const handleEditMessage = (messageId: string, newContent: string) => {
    // TODO: Replace with API call when backend edit endpoint is implemented
    setMessages((prev) =>
      prev.map((m) =>
        m.id === messageId
          ? { ...m, content: newContent, editedAt: new Date().toISOString() }
          : m,
      ),
    );
  };

  const handleDeleteMessage = (messageId: string) => {
    // TODO: Replace with API call when backend delete endpoint is implemented
    setMessages((prev) => prev.filter((m) => m.id !== messageId));
  };

  // Loading state
  if (loading) {
    return (
      <div className="empty-state">
        <span style={{ color: "var(--text-muted)" }}>Loading channel...</span>
      </div>
    );
  }

  // Channel not found
  if (!channel) {
    return (
      <div className="empty-state">
        <MessageCircle size={52} style={{ opacity: 0.2 }} />
        <span
          style={{
            fontFamily: "var(--font-display, 'Rajdhani', sans-serif)",
            fontSize: 20,
            fontWeight: 700,
            color: "var(--text-secondary)",
          }}
        >
          Channel not found
        </span>
      </div>
    );
  }

  // Voice channel
  if (channel.type === "VOICE") {
    return (
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <VoiceChannel
          channelId={channelId}
          channelName={channel.name}
          currentUser={mockUser}
        />
      </div>
    );
  }

  // Text channel
  const channelIcon =
    channel.type === "TEXT" ? <MessageCircle size={18} /> : <Mic size={18} />;

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Header */}
      <div
        style={{
          height: 52,
          minHeight: 52,
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          padding: "0 20px",
          gap: 12,
          background: "var(--bg-primary)",
          flexShrink: 0,
        }}
      >
        {channelIcon}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontFamily: "var(--font-display, 'Rajdhani', sans-serif)",
              fontSize: 17,
              fontWeight: 700,
              color: "var(--text-primary)",
              letterSpacing: "0.3px",
            }}
          >
            #{channel.name}
          </div>
          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
            {channel.category || "Text Channel"}
          </div>
        </div>
      </div>

      {/* Content area */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Chat */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <MessageList
            messages={messages as unknown as Message[]}
            currentUserId={mockUser.id}
            onEdit={handleEditMessage}
            onDelete={handleDeleteMessage}
          />
          <MessageInput
            channelName={channel.name}
            isDisabled={false}
            onSend={handleSendMessage}
          />
        </div>

        {/* Member list */}
        {members.length > 0 && <MemberList members={members as any} />}
      </div>
    </div>
  );
}