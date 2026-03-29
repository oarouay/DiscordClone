"use client";

import type { Message } from "@/types";
import { MessageCircle } from "lucide-react";
import MessageItem from "./MessageItem";
import { useEffect, useRef, useMemo } from "react";
import { computeMessageGrouping } from "@/lib/messageGrouping";
import { EmptyChannelState } from "./EmptyChannelState";

interface MessageListProps {
  messages: Message[];
  isLoading?: boolean;
  currentUserId?: string;
  onEdit?: (messageId: string, newContent: string) => void;
  onDelete?: (messageId: string) => void;
}

export default function MessageList({ messages, isLoading = false, currentUserId, onEdit, onDelete }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const groupedMessages = useMemo(() => computeMessageGrouping(messages), [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (isLoading) {
    return (
      <div className="empty-state">
        <MessageCircle size={48} style={{ opacity: 0.2 }} />
        <span
          style={{
            fontFamily: "var(--font-display, 'Rajdhani', sans-serif)",
            fontSize: 18,
            fontWeight: 700,
            color: "var(--text-secondary)",
          }}
        >
          Connecting…
        </span>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <EmptyChannelState
        title="Start the conversation"
        subtitle="Be the first to send a message."
      />
    );
  }

  return (
    <div
      style={{
        flex: 1,
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        paddingTop: 16,
        paddingBottom: 4,
      }}
    >
      {groupedMessages.map((message) => (
        <MessageItem 
          key={message.id} 
          message={message} 
          showHeader={message.showHeader}
          currentUserId={currentUserId} 
          onEdit={onEdit} 
          onDelete={onDelete} 
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}