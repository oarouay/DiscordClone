"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import type { Message } from "@/types";

interface WebSocketMessage {
  type: "auth" | "message" | "presence" | "typing" | "error";
  payload: unknown;
}

interface UseWebSocketOptions {
  url?: string;
  onMessage?: (message: Message) => void;
  onPresence?: (data: { userId: string; status: "online" | "idle" | "offline" }) => void;
  onError?: (error: Error) => void;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const resolveDefaultUrl = () => {
    if (process.env.NEXT_PUBLIC_WS_URL) {
      return process.env.NEXT_PUBLIC_WS_URL;
    }

    if (process.env.NEXT_PUBLIC_API_URL) {
      try {
        const api = new URL(process.env.NEXT_PUBLIC_API_URL);
        api.protocol = api.protocol === "https:" ? "wss:" : "ws:";
        api.pathname = api.pathname.replace(/\/?api\/?$/, "") + "/ws";
        return api.toString();
      } catch {
        // Fallback handled below.
      }
    }

    if (typeof window !== "undefined") {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      return `${protocol}//${window.location.host}/ws`;
    }

    return "ws://localhost:8081/ws";
  };

  const {
    url = resolveDefaultUrl(),
    onMessage,
    onPresence,
    onError,
  } = options;

  const wsRef = useRef<WebSocket | null>(null);
  const onMessageRef = useRef<UseWebSocketOptions["onMessage"]>(onMessage);
  const onPresenceRef = useRef<UseWebSocketOptions["onPresence"]>(onPresence);
  const onErrorRef = useRef<UseWebSocketOptions["onError"]>(onError);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const shouldReconnectRef = useRef(true);
  const connectRef = useRef<() => void>(() => {});
  const isSocketAuthenticatedRef = useRef(false);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    onPresenceRef.current = onPresence;
  }, [onPresence]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  // Get auth token from localStorage
  const getToken = useCallback(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("discord_clone_token");
  }, []);

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (
      wsRef.current?.readyState === WebSocket.OPEN ||
      wsRef.current?.readyState === WebSocket.CONNECTING
    ) {
      return;
    }

    setIsConnecting(true);

    try {
      const wsUrl = new URL(url);
      const token = getToken();
      
      // For development, allow non-secure WS
      if (typeof window !== "undefined" && window.location.protocol === "https:") {
        wsUrl.protocol = "wss";
      }

      const ws = new WebSocket(wsUrl.toString());

      ws.onopen = () => {
        console.info("[WebSocket] Connected", wsUrl.toString());
        isSocketAuthenticatedRef.current = false;
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
          console.info("[WebSocket] Received message:", wsMsg);

          if (wsMsg.type === "auth") {
            const authPayload = wsMsg.payload as { success?: boolean };
            isSocketAuthenticatedRef.current = authPayload?.success === true;
            if (!isSocketAuthenticatedRef.current) {
              console.warn("[WebSocket] Authentication failed");
            }
          } else if (wsMsg.type === "message" && onMessageRef.current) {
            console.info("[WebSocket] Triggering onMessage with payload:", wsMsg.payload);
            onMessageRef.current(wsMsg.payload as Message);
          } else if (wsMsg.type === "presence" && onPresenceRef.current) {
            onPresenceRef.current(wsMsg.payload as { userId: string; status: "online" | "idle" | "offline" });
          }
        } catch (error) {
          console.error("[WebSocket] Failed to parse message:", error);
        }
      };

      ws.onerror = (event) => {
        const error = new Error(`WebSocket error on ${wsUrl.toString()} (readyState=${ws.readyState})`);
        console.error("[WebSocket] Error:", {
          url: wsUrl.toString(),
          readyState: ws.readyState,
          eventType: event.type,
        });
        if (onErrorRef.current) onErrorRef.current(error);
      };

      ws.onclose = () => {
        console.warn("[WebSocket] Disconnected");
        isSocketAuthenticatedRef.current = false;
        setIsConnected(false);
        setIsConnecting(false);

        if (!shouldReconnectRef.current) {
          return;
        }

        reconnectTimeoutRef.current = setTimeout(() => {
          console.info("[WebSocket] Attempting to reconnect...");
          connectRef.current();
        }, 3000);
      };

      wsRef.current = ws;
    } catch (error) {
      console.error("[WebSocket] Connection failed:", error);
      const err = error instanceof Error ? error : new Error("Unknown error");
      if (onErrorRef.current) onErrorRef.current(err);
      setIsConnecting(false);
    }
  }, [url, getToken]);

  useEffect(() => {
    connectRef.current = connect;
  }, [connect]);

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

  const authenticate = useCallback((token: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      return;
    }
    wsRef.current.send(
      JSON.stringify({
        type: "auth",
        token,
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

      if (!isSocketAuthenticatedRef.current) {
        console.warn("[WebSocket] Not authenticated yet, falling back to REST send");
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
      shouldReconnectRef.current = false;
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
    const timeout = setTimeout(() => {
      connect();
    }, 0);

    return () => clearTimeout(timeout);
  }, [connect]);

  return {
    isConnected,
    isConnecting,
    connect,
    subscribe,
    send,
    authenticate,
  };
}
