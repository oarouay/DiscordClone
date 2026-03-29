"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { User, VoiceCallState } from "@/types/index";

interface VoiceCallContextType {
  state: VoiceCallState;
  peer: User | null;
  isMuted: boolean;
  callStartTime: number | null;
  initiateCall: (recipientId: string) => Promise<void>;
  acceptCall: () => Promise<void>;
  declineCall: () => Promise<void>;
  hangUp: () => Promise<void>;
  toggleMute: () => void;
}

const VoiceCallContext = createContext<VoiceCallContextType | undefined>(
  undefined
);

export function useVoiceCallContext(): VoiceCallContextType {
  const context = useContext(VoiceCallContext);
  if (!context) {
    throw new Error("useVoiceCallContext must be used within VoiceCallProvider");
  }
  return context;
}

interface VoiceCallProviderProps {
  children: ReactNode;
  value: VoiceCallContextType;
}

/**
 * VoiceCallProvider
 * Provides voice call state and methods to child components
 */
export function VoiceCallProvider({
  children,
  value,
}: VoiceCallProviderProps): React.ReactNode {
  return (
    <VoiceCallContext.Provider value={value}>
      {children}
      {/* Remote audio element for receiving peer audio */}
      <audio
        id="remote-audio"
        style={{ display: "none" }}
        autoPlay
        playsInline
      />
    </VoiceCallContext.Provider>
  );
}
