"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { useStompContext } from "@/context/StompContext";
import type { Message } from "@/types";

interface UseWebSocketOptions {
  url?: string;
  onMessage?: (message: Message) => void;
  onPresence?: (data: { userId: string; status: "online" | "idle" | "offline" }) => void;
  onError?: (error: Error) => void;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const { client, connected } = useStompContext();
  const { onMessage } = options;
  const onMessageRef = useRef(onMessage);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    if (!connected || !client) return;

    // We subscribe to the user queue for DMs
    const subscription = client.subscribe("/user/queue/messages", (message) => {
      if (onMessageRef.current) {
        try {
          const parsed = JSON.parse(message.body);
          onMessageRef.current(parsed);
        } catch (e) {
          console.error("Failed to parse STOMP message", e);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [connected, client]);

  const send = useCallback(
    (channelId: string, content: string) => {
      if (!connected || !client) return false;
      
      const recipientId = channelId.startsWith("dm_") ? channelId.substring(3) : channelId;
      
      client.publish({
        destination: "/app/chat.message",
        body: JSON.stringify({ recipientId, content })
      });
      return true;
    },
    [client, connected]
  );

  return {
    isConnected: connected,
    send,
    authenticate: () => {}, 
    isConnecting: false,
    subscribe: () => {},
  };
}
