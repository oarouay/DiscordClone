"use client";

import { useEffect, useRef, useCallback } from "react";
import { useStompContext } from "@/context/StompContext";
import type { GuildMessage } from "@/types";

interface UseGuildWebSocketOptions {
  channelId: string | undefined;
  onMessage?: (message: GuildMessage) => void;
}

export function useGuildWebSocket({ channelId, onMessage }: UseGuildWebSocketOptions) {
  const { client, connected } = useStompContext();
  const onMessageRef = useRef(onMessage);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    if (!connected || !client || !channelId) return;

    const subscription = client.subscribe(
      `/topic/channels.${channelId}`,
      (message) => {
        if (onMessageRef.current) {
          try {
            const parsed: GuildMessage = JSON.parse(message.body);
            onMessageRef.current(parsed);
          } catch (e) {
            console.error("Failed to parse guild message", e);
          }
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [connected, client, channelId]);

  const send = useCallback(
    (content: string) => {
      if (!connected || !client || !channelId) return false;
      client.publish({
        destination: "/app/guild.message",
        body: JSON.stringify({ channelId, content }),
      });
      return true;
    },
    [client, connected, channelId]
  );

  return { isConnected: connected, send };
}