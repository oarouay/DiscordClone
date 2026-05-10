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
import { useGuildWebSocket } from "@/hooks/useGuildWebSocket";
import {
  fetchChannels,
  fetchChannelMessages,
  fetchGuildMembers,
  sendGuildMessage,
} from "@/lib/guilds";
import type { GuildMessage, Channel, GuildMember } from "@/types";

export default function ChannelPage() {
  const params = useParams();
  const guildId = params?.guildId as string;
  const channelId = params?.channelId as string;

  const [messages, setMessages] = useState<GuildMessage[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [members, setMembers] = useState<GuildMember[]>([]);
  const [loading, setLoading] = useState(true);

  const channel = channels.find((c) => c.id === channelId);

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

  useEffect(() => {
    if (!channelId || !guildId) return;
    fetchChannelMessages(guildId, channelId)
      .then(setMessages)
      .catch((err) => console.error("Failed to load messages:", err));
  }, [guildId, channelId]);

  const handleWebSocketMessage = useCallback((message: GuildMessage) => {
    if (message.channelId === channelId) {
      setMessages((prev) => [...prev, message]);
    }
  }, [channelId]);

  const { isConnected, send: wsSend } = useGuildWebSocket({
    channelId,
    onMessage: handleWebSocketMessage,
  });

  const handleSendMessage = useCallback(
    async (content: string, files: File[]) => {
      if (!guildId || !channelId) return;
      const sent = wsSend(content);
      if (!sent) {
        try {
          await sendGuildMessage(guildId, channelId, { content });
        } catch (err) {
          console.error("Failed to send message:", err);
        }
      }
    },
    [guildId, channelId, wsSend],
  );

  const handleEditMessage = (messageId: string, newContent: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === messageId
          ? { ...m, content: newContent, editedAt: new Date().toISOString() }
          : m,
      ),
    );
  };

  const handleDeleteMessage = (messageId: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== messageId));
  };

  if (loading) {
    return (
      <div className="empty-state">
        <span style={{ color: "var(--text-muted)" }}>Loading channel...</span>
      </div>
    );
  }

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

  const channelIcon =
    channel.type === "TEXT" ? <MessageCircle size={18} /> : <Mic size={18} />;

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
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
        {isConnected && (
          <span
            style={{
              fontSize: 11,
              fontWeight: 500,
              color: "var(--success)",
              background: "rgba(61,220,151,0.1)",
              padding: "3px 10px",
              borderRadius: 99,
            }}
          >
            Live
          </span>
        )}
      </div>

      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <MessageList
            messages={messages}
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

        {members.length > 0 && <MemberList members={members} />}
      </div>
    </div>
  );
}