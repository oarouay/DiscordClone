"use client";

import { useCallback } from "react";
import { Mic } from "lucide-react";
import { useWebRTC } from "@/hooks/useWebRTC";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useMockData } from "@/context/MockDataProvider";
import { VoiceControls } from "./VoiceControls";
import { VoiceStagePanel } from "./VoiceStagePanel";
import type { User } from "@/types";

type Props = {
  channelId: string;
  channelName: string;
  currentUser: User;
};

export function VoiceChannel({ channelId, channelName, currentUser }: Props) {
  const { send } = useWebSocket({});
  const mockData = useMockData();

  // Get members in this voice channel
  const voiceMembers = mockData.voiceChannelMembers[channelId] || [];

  const sendSignal = useCallback(
    (message: object) => {
      // TODO: replace with backend signaling via useWebSocket
      send(channelId, JSON.stringify(message));
    },
    [channelId, send]
  );

  const {
    participants,
    isMuted,
    isDeafened,
    isJoined,
    join,
    leave,
    toggleMute,
    toggleDeafen,
    handleSignal,
  } = useWebRTC({
    channelId,
    userId: currentUser.id,
    displayName: currentUser.displayName,
    onSignal: sendSignal,
  });

  return (
    <div className="voice-channel">
      <div className="voice-channel-header">
        <Mic size={18} className="voice-channel-icon" />
        <div className="voice-channel-title">
          <span className="voice-channel-name">{channelName}</span>
          <span className="voice-channel-subtitle">Voice Channel</span>
        </div>
        {isJoined && <span className="voice-live-badge"><span style={{color: "var(--success)"}}>●</span> Live</span>}
      </div>

      <div className="voice-channel-body">
        {!isJoined ? (
          <div className="voice-join-prompt">
            <Mic size={48} className="voice-join-icon" />
            <p className="voice-join-title">Voice Channel</p>
            <p className="voice-join-subtitle">
              Click join to connect your microphone and talk with others.
            </p>
            <button className="voice-join-btn" onClick={join}>
              Join Voice
            </button>
          </div>
        ) : (
          <VoiceStagePanel 
            members={voiceMembers} 
            currentUserId={currentUser.id}
            onDisconnect={leave}
          />
        )}
      </div>

      {isJoined && (
        <VoiceControls
          isMuted={isMuted}
          isDeafened={isDeafened}
          onToggleMute={toggleMute}
          onToggleDeafen={toggleDeafen}
          onLeave={leave}
        />
      )}
    </div>
  );
}