"use client";

export const dynamic = "force-dynamic";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { MessageCircle, Mic } from "lucide-react";
import { mockGuilds, mockMessages, mockUser } from "@/lib/mock";
import { useWebSocket } from "@/hooks/useWebSocket";
import { VoiceChannel } from "@/components/voice/VoiceChannel";
import MessageList from "@/components/chat/MessageList";
import MessageInput from "@/components/chat/MessageInput";
import { MemberList } from "@/components/guild/MemberList";
import type { Message } from "@/types";

export default function ChannelPage() {
  const params = useParams();
  const guildId = params?.guildId as string;
  const channelId = params?.channelId as string;
  const [messages, setMessages] = useState<Message[]>([]);

  const guild = mockGuilds.find((g) => g.id === guildId);
  const channel = guild?.channels.find((c) => c.id === channelId);

  const { isConnected, send } = useWebSocket({
    onMessage: (message: Message) => {
      if (message.channelId === channelId) {
        setMessages((prev) => [...prev, message]);
      }
    },
  });

  useEffect(() => {
    if (!channelId) return;
    // TODO: Replace with API call to GET /channels/:channelId/messages
    const channelMessages = mockMessages.filter((m) => m.channelId === channelId);
    setMessages(channelMessages);
  }, [channelId]);

  const handleSendMessage = (content: string, files: File[]) => {
  if (!channelId) return;
  const sent = send(channelId, content);
  if (!sent) {
    // TODO: replace with API call to POST /channels/:channelId/messages with multipart/form-data
    const newMessage: Message = {
      id: String(Date.now()),
      channelId,
      author: mockUser,
      content,
      createdAt: new Date().toISOString(),
      attachments: files.map((file, i) => ({
        id: `${Date.now()}-${i}`,
        filename: file.name,
        size: file.size,
        mimeType: file.type,
        url: URL.createObjectURL(file),
      })),
    };
    setMessages((prev) => [...prev, newMessage]);
  }
};

  const handleEditMessage = (messageId: string, newContent: string) => {
    // TODO: Replace with API call to PATCH /messages/:messageId
    setMessages((prev) =>
      prev.map((m) =>
        m.id === messageId
          ? { ...m, content: newContent, editedAt: new Date().toISOString() }
          : m
      )
    );
  };

  const handleDeleteMessage = (messageId: string) => {
    // TODO: Replace with API call to DELETE /messages/:messageId
    setMessages((prev) => prev.filter((m) => m.id !== messageId));
  };

  if (!guild || !channel) {
    return (
      <div className="empty-state">
        <MessageCircle size={52} style={{ opacity: 0.2 }} />
        <span style={{
          fontFamily: "var(--font-display, 'Rajdhani', sans-serif)",
          fontSize: 20, fontWeight: 700, color: "var(--text-secondary)",
        }}>
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

  const channelIcon = channel.type === "TEXT" ? <MessageCircle size={18} /> : <Mic size={18} />;

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Header */}
      <div style={{
        height: 52, minHeight: 52,
        borderBottom: "1px solid var(--border)",
        display: "flex", alignItems: "center",
        padding: "0 20px", gap: 12,
        background: "var(--bg-primary)",
        flexShrink: 0,
      }}>
        {channelIcon}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: "var(--font-display, 'Rajdhani', sans-serif)",
            fontSize: 17, fontWeight: 700,
            color: "var(--text-primary)", letterSpacing: "0.3px",
          }}>
            #{channel.name}
          </div>
          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
            {channel.subType || "Text Channel"}
          </div>
        </div>
        {isConnected && (
          <span style={{
            fontSize: 11, fontWeight: 500,
            color: "var(--success)",
            background: "rgba(61,220,151,0.1)",
            padding: "3px 10px", borderRadius: 99,
          }}>
            Live
          </span>
        )}
      </div>

      {/* Content area */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Chat */}
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

        {/* Member list */}
        {guild && <MemberList members={guild.members} />}
      </div>
    </div>
  );
}