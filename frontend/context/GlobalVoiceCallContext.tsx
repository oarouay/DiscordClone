"use client";

import { useVoiceCall } from "@/hooks/useVoiceCall";
import type { User as CallingUser } from "@/types/calling";
import { createContext, useCallback, useContext, useMemo } from "react";
import { GlobalVoiceCallUI } from "@/components/voice/GlobalVoiceCallUI";

type VoiceCallContextValue = {
  initiateCall: (user: CallingUser) => void;
};

const VoiceCallContext = createContext<VoiceCallContextValue | null>(null);

export function VoiceCallProvider({ children }: { children: React.ReactNode }) {
  const voiceCall = useVoiceCall();

  const initiateCall = useCallback(
    (user: CallingUser) => {
      if (voiceCall.callState === "idle") {
        voiceCall.initiateCall(user);
      }
    },
    [voiceCall]
  );

  const contextValue = useMemo(
    () => ({
      initiateCall,
    }),
    [initiateCall]
  );

  return (
    <VoiceCallContext.Provider value={contextValue}>
      {children}
      <GlobalVoiceCallUI
        callState={voiceCall.callState}
        remoteUser={voiceCall.remoteUser}
        duration={voiceCall.duration}
        isMuted={voiceCall.isMuted}
        wasDeclined={voiceCall.wasDeclined}
        onAccept={voiceCall.acceptCall}
        onDecline={voiceCall.declineCall}
        onHangUp={voiceCall.hangUp}
        onToggleMute={voiceCall.toggleMute}
      />
    </VoiceCallContext.Provider>
  );
}

export function useGlobalVoiceCall() {
  const context = useContext(VoiceCallContext);
  if (!context) {
    throw new Error("useGlobalVoiceCall must be used within a VoiceCallProvider");
  }
  return context;
}
