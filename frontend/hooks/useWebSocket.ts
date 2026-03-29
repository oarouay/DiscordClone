"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import SockJS from "sockjs-client";
import { Client, Frame, IFrame } from "@stomp/stompjs";
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
    let url = process.env.NEXT_PUBLIC_WS_URL;
    
    if (url) {
      // Convert WebSocket URLs to HTTP for SockJS
      if (url.startsWith("wss://")) {
        return url.replace("wss://", "https://");
      }
      if (url.startsWith("ws://")) {
        return url.replace("ws://", "http://");
      }
      return url;
    }

    if (typeof window !== "undefined") {
      const protocol = window.location.protocol === "https:" ? "https:" : "http:";
      return `${protocol}//${window.location.host}/ws-stomp`;
    }

    return "http://localhost:8081/ws-stomp";
  };

  const {
    url = resolveDefaultUrl(),
    onMessage,
    onPresence,
    onError,
  } = options;

  const stompClientRef = useRef<Client | null>(null);
  const onMessageRef = useRef<UseWebSocketOptions["onMessage"]>(onMessage);
  const onPresenceRef = useRef<UseWebSocketOptions["onPresence"]>(onPresence);
  const onErrorRef = useRef<UseWebSocketOptions["onError"]>(onError);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const shouldReconnectRef = useRef(true);
  const connectRef = useRef<() => void>(() => {});
  const isAuthenticatedRef = useRef(false);
  const subscriptionsRef = useRef<Map<string, string>>(new Map());
  const tokenRef = useRef<string | null>(null);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    onPresenceRef.current = onPresence;
  }, [onPresence]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  const getToken = useCallback(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("discord_clone_token");
  }, []);

  const connect = useCallback(() => {
    if (stompClientRef.current?.active) {
      return;
    }

    setIsConnecting(true);

    try {
      const socket = new SockJS(url);
      const client = new Client({
        webSocketFactory: () => socket,
        reconnectDelay: 3000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
      });

      client.onConnect = () => {
        console.info("[STOMP] Connected");
        setIsConnected(true);
        setIsConnecting(false);
        isAuthenticatedRef.current = false;

        const token = getToken();
        if (token) {
          client.publish({
            destination: "/app/auth",
            body: JSON.stringify({ token }),
          });
          tokenRef.current = token;
        }
      };

      client.onDisconnect = () => {
        console.warn("[STOMP] Disconnected");
        setIsConnected(false);
        isAuthenticatedRef.current = false;

        if (shouldReconnectRef.current) {
          setTimeout(() => {
            console.info("[STOMP] Attempting to reconnect...");
            connectRef.current();
          }, 3000);
        }
      };

      stompClientRef.current = client;
      client.activate();
    } catch (error) {
      console.error("[STOMP] Connection failed:", error);
      const err = error instanceof Error ? error : new Error("Unknown error");
      if (onErrorRef.current) onErrorRef.current(err);
      setIsConnecting(false);
    }
  }, [url, getToken]);

  useEffect(() => {
    connectRef.current = connect;
  }, [connect]);

  const subscribe = useCallback((topic: string, callback?: (message: string) => void) => {
    if (!stompClientRef.current?.active) {
      console.warn("[STOMP] Not connected, cannot subscribe to", topic);
      return;
    }

    try {
      const subscription = stompClientRef.current.subscribe(topic, (frame: Frame) => {
        console.info(`[STOMP] Message received on ${topic}:`, frame.body);
        if (callback) {
          callback(frame.body);
        } else {
          try {
            const wsMsg = JSON.parse(frame.body) as WebSocketMessage;
            console.info("[STOMP] Parsed message:", wsMsg);

            if (wsMsg.type === "auth") {
              const authPayload = wsMsg.payload as { success?: boolean };
              isAuthenticatedRef.current = authPayload?.success === true;
              if (isAuthenticatedRef.current) {
                console.info("[STOMP] Authentication successful");
              }
            } else if (wsMsg.type === "message" && onMessageRef.current) {
              console.info("[STOMP] Triggering onMessage with payload:", wsMsg.payload);
              onMessageRef.current(wsMsg.payload as Message);
            } else if (wsMsg.type === "presence" && onPresenceRef.current) {
              onPresenceRef.current(wsMsg.payload as { userId: string; status: "online" | "idle" | "offline" });
            }
          } catch (e) {
            console.warn("[STOMP] Failed to parse subscription message:", e);
          }
        }
      });

      subscriptionsRef.current.set(topic, subscription.id);
      console.info(`[STOMP] Subscribed to ${topic}`);
    } catch (error) {
      console.error("[STOMP] Subscription error:", error);
    }
  }, []);

  const authenticate = useCallback((token: string) => {
    if (!stompClientRef.current?.active) {
      console.warn("[STOMP] Not connected, cannot authenticate");
      return;
    }
    tokenRef.current = token;
    stompClientRef.current.publish({
      destination: "/app/auth",
      body: JSON.stringify({ token }),
    });
  }, []);

  const send = useCallback(
    (channelId: string, content: string) => {
      if (!stompClientRef.current?.active) {
        console.warn("[STOMP] Not connected, cannot send message");
        return false;
      }

      try {
        stompClientRef.current.publish({
          destination: "/app/message",
          body: JSON.stringify({
            channelId,
            content,
          }),
        });
        return true;
      } catch (error) {
        console.error("[STOMP] Send error:", error);
        return false;
      }
    },
    []
  );

  useEffect(() => {
    const timeout = setTimeout(() => {
      connect();
    }, 0);

    return () => clearTimeout(timeout);
  }, [connect]);

  useEffect(() => {
    return () => {
      shouldReconnectRef.current = false;
      if (stompClientRef.current?.active) {
        stompClientRef.current.deactivate();
      }
    };
  }, []);

  return {
    isConnected,
    isConnecting,
    connect,
    subscribe,
    send,
    authenticate,
  };
}
