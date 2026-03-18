"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { mockGuilds, mockMessages, mockUser } from "@/lib/mock";
import { useWebSocket } from "@/hooks/useWebSocket";
import MessageList from "@/components/chat/MessageList";
import MessageInput from "@/components/chat/MessageInput";
import type { Message } from "@/types";

export default function ChannelPage() {
  const params = useParams();
  const guildId = params?.guildId as string;
  const channelId = params?.channelId as string;
  const [messages, setMessages] = useState<Message[]>([]);

  const guild = mockGuilds.find((g) => g.id === guildId);
  const channel = guild?.channels.find((c) => c.id === channelId);

  // WebSocket hook for real-time messages
  const { isConnected, send } = useWebSocket({
    onMessage: (message: Message) => {
      // Add incoming message to the current channel
      if (message.channelId === channelId) {
        setMessages((prev) => [...prev, message]);
      }
    },
  });

  // Load initial messages for the channel
  useEffect(() => {
    if (!channelId) return;

    // TODO: Replace with API call to GET /channels/:channelId/messages
    const channelMessages = mockMessages.filter((m) => m.channelId === channelId);
    setMessages(channelMessages);
  }, [channelId]);

  const handleSendMessage = (content: string) => {
    if (!channelId) return;

    // Try to send via WebSocket
    const sent = send(channelId, content);

    if (!sent) {
      // Fallback: create local message if WebSocket not connected
      // TODO: Replace with API call to POST /channels/:channelId/messages
      const newMessage: Message = {
        id: String(Date.now()),
        channelId,
        author: mockUser,
        content,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, newMessage]);
      console.log("Message sent locally (WebSocket not ready):", content);
    }
  };

  if (!guild || !channel) {
    return (
      <div className="flex-1 flex items-center justify-center bg-bg-primary">
        <p className="text-text-primary">Channel not found</p>
      </div>
    );
  }

  const channelIcon = channel.type === "VOICE" ? "🎤" : "💬";

  return (
    <div className="flex-1 flex flex-col bg-bg-primary">
      {/* Header */}
      <div className="h-20 border-b border-border flex items-center px-6 bg-bg-secondary">
        <div className="flex items-center gap-4 flex-1">
          <span className="text-3xl">{channelIcon}</span>
          <div>
            <h1 className="text-lg font-bold text-text-primary">{channel.name}</h1>
            <p className="text-sm text-text-muted">
              {channel.type === "VOICE" ? "Voice Channel" : channel.subType || "Text Channel"}
            </p>
          </div>
        </div>
        {isConnected && <span className="text-xs text-green-500">● Live</span>}
      </div>

      {/* Messages */}
      <MessageList messages={messages} isLoading={!isConnected && !messages.length} />

      {/* Input Area */}
      <MessageInput
        channelName={channel.name}
        isDisabled={channel.type === "VOICE"}
        onSend={handleSendMessage}
      />
    </div>
  );
}