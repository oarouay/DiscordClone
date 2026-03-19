"use client";

import type { Message } from "@/types";
import MessageItem from "./MessageItem";
import { useEffect, useRef } from "react";

interface MessageListProps {
  messages: Message[];
  isLoading?: boolean;
  currentUserId?: string;
  onEdit?: (messageId: string, newContent: string) => void;
  onDelete?: (messageId: string) => void;
}

export default function MessageList({ messages, isLoading = false, currentUserId, onEdit, onDelete }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (isLoading) {
    return (
      <div className="empty-state">
        <div style={{ fontSize: 48, opacity: 0.2 }}>💬</div>
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
          Start the conversation
        </span>
        <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
          Be the first to send a message.
        </span>
      </div>
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
      {messages.map((message) => (
        <MessageItem key={message.id} message={message} currentUserId={currentUserId} onEdit={onEdit} onDelete={onDelete} />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}