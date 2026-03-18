"use client";

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

  // WebSocket hook for real-time messages
  const { isConnected, send } = useWebSocket({
    onMessage: (message: Message) => {
      // Add incoming message to the current DM conversation
      if (message.channelId === dmChannelId) {
        setMessages((prev) => [...prev, message]);
      }
    },
  });

  // Load initial messages for selected user
  useEffect(() => {
    if (!selectedUserId) return;

    // TODO: Replace with API call to GET /dms/:userId/messages
    const userMessages = mockDMMessages.filter((m) => m.channelId === dmChannelId);
    setMessages(userMessages);
  }, [selectedUserId, dmChannelId]);

  const handleSendMessage = (content: string) => {
    if (!selectedUserId || !dmChannelId) return;

    // Try to send via WebSocket
    const sent = send(dmChannelId, content);

    if (!sent) {
      // Fallback: create local message if WebSocket not connected
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

  return (
    <div className="flex-1 flex">
      {/* DM List Sidebar */}
      <div className="w-80 bg-bg-secondary border-r border-border flex flex-col">
        <div className="h-20 border-b border-border px-6 flex items-center justify-between">
          <h2 className="font-semibold text-text-primary text-lg">Direct Messages</h2>
          {isConnected && <span className="text-xs text-green-500">● Online</span>}
        </div>
        <DMList 
          conversations={mockDMConversations} 
          selectedUserId={selectedUserId}
          onSelectUser={setSelectedUserId}
        />
      </div>

      {/* DM Chat Area */}
      {selectedUser ? (
        <div className="flex-1 flex flex-col">
          {/* Header */}
<div className="h-20 border-b border-bg-secondary px-6 flex items-center gap-4 bg-bg-primary">
          <span className="text-3xl">💬</span>
          <div className="flex-1">
            <h2 className="font-semibold text-text-primary text-base">{selectedUser.displayName}</h2>
              <p className="text-sm text-text-muted">@{selectedUser.username}</p>
            </div>
            <span className={`text-xs ${selectedUser.status === "online" ? "text-green-500" : "text-yellow-500"}`}>
              {selectedUser.status === "online" ? "● Online" : "◐ Idle"}
            </span>
          </div>

          {/* Messages */}
          <MessageList messages={messages} />

          {/* Input Area */}
          <MessageInput
            channelName={selectedUser.displayName}
            onSend={handleSendMessage}
          />
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-bg-primary">
          <p className="text-text-muted text-lg">Select a conversation to start messaging</p>
        </div>
      )}
    </div>
  );
}