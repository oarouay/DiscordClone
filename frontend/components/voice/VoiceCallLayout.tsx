"use client";

import React from "react";
import { useVoiceCall } from "@/hooks/useVoiceCall";
import { VoiceCallProvider } from "@/context/VoiceCallContext";
import { IncomingCallModal } from "@/components/voice/IncomingCallModal";
import { OutgoingCallModal } from "@/components/voice/OutgoingCallModal";
import { ActiveCallBar } from "@/components/voice/ActiveCallBar";

interface VoiceCallLayoutProps {
  children: React.ReactNode;
}

/**
 * VoiceCallLayout
 * High-level layout component that wraps the app with voice call functionality
 * Provides global access to voice call state and conditionally renders modals/bar
 */
export function VoiceCallLayout({
  children,
}: VoiceCallLayoutProps): React.ReactNode {
  const voiceCall = useVoiceCall();

  return (
    <VoiceCallProvider value={voiceCall}>
      {children}

      {/* Incoming Call Modal */}
      {voiceCall.state === "ringing" && voiceCall.peer && (
        <IncomingCallModal
          caller={voiceCall.peer}
          onAccept={voiceCall.acceptCall}
          onDecline={voiceCall.declineCall}
        />
      )}

      {/* Outgoing Call Modal */}
      {voiceCall.state === "calling" && voiceCall.peer && (
        <OutgoingCallModal
          recipient={voiceCall.peer}
          onCancel={voiceCall.hangUp}
        />
      )}

      {/* Active Call Bar */}
      {voiceCall.state === "connected" && voiceCall.peer && (
        <ActiveCallBar
          peer={voiceCall.peer}
          onHangUp={voiceCall.hangUp}
          toggleMute={voiceCall.toggleMute}
          isMuted={voiceCall.isMuted}
        />
      )}
    </VoiceCallProvider>
  );
}
