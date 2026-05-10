"use client";

import type { Message, GuildMessage } from "@/types";
import { MessageCircle } from "lucide-react";
import MessageItem from "./MessageItem";
import { useLayoutEffect, useEffect, useRef } from "react";

type MessageLike = Message | GuildMessage;

function getAuthor(msg: MessageLike) {
  return "author" in msg ? msg.author : msg.sender;
}

interface MessageListProps {
  messages: MessageLike[];
  isLoading?: boolean;
  currentUserId?: string;
  onEdit?: (messageId: string, newContent: string) => void;
  onDelete?: (messageId: string) => void;
}

export default function MessageList({ messages, isLoading = false, currentUserId, onEdit, onDelete }: MessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const hasInitialized = useRef(false);
  const prevCountRef = useRef(0);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container || messages.length === 0) return;

    if (!hasInitialized.current) {
      container.scrollTop = container.scrollHeight;
      hasInitialized.current = true;
      prevCountRef.current = messages.length;
      return;
    }

    if (messages.length > prevCountRef.current) {
      container.scrollTop = container.scrollHeight;
    }
    prevCountRef.current = messages.length;
  }, [messages]);

  useEffect(() => {
    if (messages.length === 0) {
      hasInitialized.current = false;
      prevCountRef.current = 0;
    }
  }, [messages.length]);

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
          Connecting...
        </span>
      </div>
    );
  }

  if (messages.length === 0) {
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
      ref={containerRef}
      style={{
        flex: 1,
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        paddingTop: 16,
        paddingBottom: 4,
      }}
    >
      {messages.map((message, index) => {
        const previousMessage = index > 0 ? messages[index - 1] : null;
        const hideUserInfo = previousMessage ? getAuthor(previousMessage).id === getAuthor(message).id : false;
        return (
          <MessageItem
            key={message.id}
            message={message}
            hideUserInfo={hideUserInfo}
            currentUserId={currentUserId}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        );
      })}
    </div>
  );
}