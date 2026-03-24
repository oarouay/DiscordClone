"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { MessageCircle } from "lucide-react";
import { mockDMConversations, mockDMMessages, mockUser } from "@/lib/mock";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useAuth } from "@/context/AuthContext";
import { DMSidebar } from "@/components/dm/DMSidebar";
import { UserPanel } from "@/components/shared/UserPanel";
import { VoiceControls } from "@/components/voice/VoiceControls";
import MessageList from "@/components/chat/MessageList";
import MessageInput from "@/components/chat/MessageInput";
import type { Message } from "@/types";

const MOCK_RICH_PRESENCE = { activity: "Playing Elden Ring", detail: "Exploring Limgrave • 2h 14m" };

export default function DirectMessagesPage() {
  const { user } = useAuth();
  const [selectedUserId, setSelectedUserId] = useState<string>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [voiceChannel, setVoiceChannel] = useState<{ channelName: string; guildName: string } | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);

  const selectedUser = mockDMConversations.find((u) => u.id === selectedUserId);
  const dmChannelId = selectedUserId ? `dm_${selectedUserId}` : "";

  const { isConnected, send } = useWebSocket({
    onMessage: (message: Message) => {
      if (message.channelId === dmChannelId) {
        setMessages((prev) => [...prev, message]);
      }
    },
  });

  useEffect(() => {
    if (!selectedUserId) return;
    // TODO: Replace with API call to GET /dms/:userId/messages
    const userMessages = mockDMMessages.filter((m) => m.channelId === dmChannelId);
    setMessages(userMessages);
  }, [selectedUserId, dmChannelId]);

  const handleSendMessage = (content: string, files: File[]) => {
  if (!selectedUserId || !dmChannelId) return;
  const sent = send(dmChannelId, content);
  if (!sent) {
    // TODO: replace with API call to POST /dms/:userId/messages with multipart/form-data
    const newMessage: Message = {
      id: String(Date.now()),
      channelId: dmChannelId,
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

  const statusColor = (status: string) =>
    status === "online" ? "var(--success)" : "var(--warning)";
  const statusLabel = (status: string) =>
    status === "online" ? "Online" : "Idle";

  if (mockDMConversations.length === 0) {
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
          No conversations yet
        </span>
        <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
          Start a new direct message to begin chatting.
        </span>
      </div>
    );
  }

  const bottomSlot = user ? (
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
              onLeave={() => { setVoiceChannel(null); setIsMuted(false); setIsDeafened(false); }}
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
        onLogout={() => {}}
        onSave={(updates) => { Object.assign(user, updates); }}
      />
    </>
  ) : null;

  return (
    <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
      {/* DM Sidebar */}
      <DMSidebar
        conversations={mockDMConversations}
        selectedUserId={selectedUserId}
        onSelectUser={setSelectedUserId}
        isConnected={isConnected}
        bottomSlot={bottomSlot}
      />

      {/* DM Chat Area */}
      {selectedUser ? (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {/* Header */}
          <div
            style={{
              height: 52,
              minHeight: 52,
              borderBottom: "1px solid var(--border)",
              padding: "0 20px",
              display: "flex",
              alignItems: "center",
              gap: 12,
              background: "var(--bg-primary)",
              flexShrink: 0,
            }}
          >
            <MessageCircle size={18} style={{ color: "var(--text-primary)" }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontFamily: "var(--font-display, 'Rajdhani', sans-serif)",
                  fontSize: 16,
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  letterSpacing: "0.3px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {selectedUser.displayName}
              </div>
              <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                @{selectedUser.username}
              </div>
            </div>
            <span style={{ fontSize: 11, fontWeight: 500, color: statusColor(selectedUser.status), flexShrink: 0 }}>
              {statusLabel(selectedUser.status)}
            </span>
          </div>

          <MessageList
            messages={messages}
            currentUserId={mockUser.id}
            onEdit={handleEditMessage}
            onDelete={handleDeleteMessage}
          />
          <MessageInput channelName={selectedUser.displayName} onSend={handleSendMessage} />
        </div>
      ) : null}
    </div>
  );
}