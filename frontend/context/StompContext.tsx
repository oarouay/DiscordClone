"use client";

import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAuth } from "@/context/AuthContext";

type StompContextValue = {
  client: Client | null;
  connected: boolean;
};

const StompContext = createContext<StompContextValue | null>(null);

const resolveStompUrl = () => {
  if (process.env.NEXT_PUBLIC_STOMP_URL) {
    return process.env.NEXT_PUBLIC_STOMP_URL;
  }

  if (process.env.NEXT_PUBLIC_API_URL) {
    try {
      const api = new URL(process.env.NEXT_PUBLIC_API_URL);
      api.protocol = api.protocol === "https:" ? "https:" : "http:";
      api.pathname = api.pathname.replace(/\/?api\/?$/, "") + "/ws-stomp";
      return api.toString();
    } catch {
      // Fall through to browser/default fallback.
    }
  }

  if (typeof window !== "undefined") {
    const protocol = window.location.protocol === "https:" ? "https:" : "http:";
    return `${protocol}//${window.location.host}/ws-stomp`;
  }

  return "http://localhost:8081/ws-stomp";
};

export function StompProvider({ children }: { children: React.ReactNode }) {
  const { token, isLoading } = useAuth();
  const [connected, setConnected] = useState(false);
  const clientRef = useRef<Client | null>(null);

  useEffect(() => {
    if (isLoading || !token) {
      if (clientRef.current?.active) {
        console.log("Deactivating STOMP client due to auth state change.");
        clientRef.current.deactivate();
      }
      setConnected(false);
      return;
    }

    // Only create a new client if one doesn't exist.
    if (!clientRef.current) {
      console.log("Creating new STOMP client instance.");
      const client = new Client({
        webSocketFactory: () => new SockJS(resolveStompUrl()),
        reconnectDelay: 5000,
        connectHeaders: { Authorization: `Bearer ${token}` },
        debug: (str) => {
          console.log("STOMP DEBUG: ", new Date(), str);
        },
        onConnect: () => {
          console.log("STOMP client connected.");
          setConnected(true);
        },
        onDisconnect: () => {
          console.log("STOMP client disconnected.");
          setConnected(false);
        },
        onStompError: (frame) => {
          console.error("Broker reported error: " + frame.headers["message"]);
          console.error("Additional details: " + frame.body);
          setConnected(false);
        },
      });
      clientRef.current = client;
    } else {
      // If client exists, just update headers. The library will use these on the next connection attempt.
      console.log("Updating STOMP client headers with new token.");
      clientRef.current.connectHeaders = { Authorization: `Bearer ${token}` };
    }

    // Activate the client if it's not already active.
    if (!clientRef.current.active) {
      console.log("Activating STOMP client.");
      clientRef.current.activate();
    }

    // Cleanup on component unmount or when dependencies change.
    return () => {
      if (clientRef.current?.active) {
        console.log("Deactivating STOMP client on cleanup.");
        clientRef.current.deactivate();
        setConnected(false);
      }
    };
  }, [token, isLoading]);

  const value = useMemo(
    () => ({
      client: clientRef.current,
      connected,
    }),
    [connected]
  );

  return <StompContext.Provider value={value}>{children}</StompContext.Provider>;
}

export function useStompContext() {
  const context = useContext(StompContext);
  if (!context) {
    throw new Error("useStompContext must be used inside StompProvider");
  }
  return context;
}