"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { mockDMConversations, mockDMMessages, mockUser } from "@/lib/mock";
import { useWebSocket } from "@/hooks/useWebSocket";
import DMList from "@/components/dm/DMList";
import MessageList from "@/components/chat/MessageList";
import MessageInput from "@/components/chat/MessageInput";
import type { Message } from "@/types";

export default function DirectMessagesPage() {
  const [selectedUserId, setSelectedUserId] = useState<string>(mockDMConversations[0]?.id);
  const [messages, setMessages] = useState<Message[]>([]);

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

  const handleSendMessage = (content: string) => {
    if (!selectedUserId || !dmChannelId) return;

    const sent = send(dmChannelId, content);

    if (!sent) {
      // TODO: Replace with API call to POST /dms/:userId/messages
      const newMessage: Message = {
        id: String(Date.now()),
        channelId: dmChannelId,
        author: mockUser,
        content,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, newMessage]);
      console.log("Message sent locally (WebSocket not ready):", content);
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
    status === "online" ? "● Online" : "◐ Idle";

  return (
    <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
      {/* DM List Sidebar */}
      <div
        style={{
          width: 240,
          minWidth: 240,
          background: "var(--bg-secondary)",
          borderRight: "1px solid var(--border)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            height: 52,
            minHeight: 52,
            borderBottom: "1px solid var(--border)",
            padding: "0 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-display, 'Rajdhani', sans-serif)",
              fontSize: 16,
              fontWeight: 700,
              color: "var(--text-primary)",
              letterSpacing: "0.3px",
            }}
          >
            Direct Messages
          </h2>
          {isConnected && (
            <span style={{ fontSize: 11, color: "var(--success)", fontWeight: 500 }}>
              ● Live
            </span>
          )}
        </div>
        <DMList
          conversations={mockDMConversations}
          selectedUserId={selectedUserId}
          onSelectUser={setSelectedUserId}
        />
      </div>

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
            <span style={{ fontSize: 18 }}>💬</span>
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
      ) : (
        <div className="empty-state">
          <div style={{ fontSize: 52, opacity: 0.2 }}>💬</div>
          <span
            style={{
              fontFamily: "var(--font-display, 'Rajdhani', sans-serif)",
              fontSize: 20,
              fontWeight: 700,
              color: "var(--text-secondary)",
            }}
          >
            No conversation selected
          </span>
          <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
            Pick someone from the list to start chatting.
          </span>
        </div>
      )}
    </div>
  );
}