"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import type { Message } from "@/types";

interface WebSocketMessage {
  type: "message" | "presence" | "typing" | "error";
  payload: unknown;
}

interface UseWebSocketOptions {
  url?: string;
  onMessage?: (message: Message) => void;
  onPresence?: (data: { userId: string; status: "online" | "idle" | "offline" }) => void;
  onError?: (error: Error) => void;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const {
    url = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8080/ws",
    onMessage,
    onPresence,
    onError,
  } = options;

  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Get auth token from localStorage
  const getToken = useCallback(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("discord_clone_token");
  }, []);

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    setIsConnecting(true);

    try {
      const token = getToken();
      const wsUrl = new URL(url);
      
      // For development, allow non-secure WS
      if (typeof window !== "undefined" && window.location.protocol === "https:") {
        wsUrl.protocol = "wss";
      }

      const ws = new WebSocket(wsUrl.toString());

      ws.onopen = () => {
        console.log("[WebSocket] Connected");
        setIsConnected(true);
        setIsConnecting(false);

        // Send auth message
        if (token) {
          ws.send(
            JSON.stringify({
              type: "auth",
              token,
            })
          );
        }
      };

      ws.onmessage = (event) => {
        try {
          const wsMsg = JSON.parse(event.data) as WebSocketMessage;

          if (wsMsg.type === "message" && onMessage) {
            onMessage(wsMsg.payload as Message);
          } else if (wsMsg.type === "presence" && onPresence) {
            onPresence(wsMsg.payload as { userId: string; status: "online" | "idle" | "offline" });
          }
        } catch (error) {
          console.error("[WebSocket] Failed to parse message:", error);
        }
      };

      ws.onerror = (event) => {
        console.error("[WebSocket] Error:", event);
        const error = new Error("WebSocket error occurred");
        if (onError) onError(error);
      };

      ws.onclose = () => {
        console.log("[WebSocket] Disconnected");
        setIsConnected(false);
        setIsConnecting(false);

        // Attempt to reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log("[WebSocket] Attempting to reconnect...");
          connect();
        }, 3000);
      };

      wsRef.current = ws;
    } catch (error) {
      console.error("[WebSocket] Connection failed:", error);
      const err = error instanceof Error ? error : new Error("Unknown error");
      if (onError) onError(err);
      setIsConnecting(false);
    }
  }, [url, getToken, onMessage, onPresence, onError]);

  // Subscribe to a topic
  const subscribe = useCallback((topic: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.warn("[WebSocket] Not connected, cannot subscribe to", topic);
      return;
    }

    wsRef.current.send(
      JSON.stringify({
        type: "subscribe",
        topic,
      })
    );
  }, []);

  // Send a message
  const send = useCallback(
    (channelId: string, content: string) => {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        console.warn("[WebSocket] Not connected, cannot send message");
        return false;
      }

      wsRef.current.send(
        JSON.stringify({
          type: "message",
          channelId,
          content,
        })
      );

      return true;
    },
    []
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  // Start connection on first load
  useEffect(() => {
    connect();
  }, []);

  return {
    isConnected,
    isConnecting,
    connect,
    subscribe,
    send,
  };
}
