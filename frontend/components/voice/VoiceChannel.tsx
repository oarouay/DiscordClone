"use client";

import { useCallback } from "react";
import { useWebRTC } from "@/hooks/useWebRTC";
import { useWebSocket } from "@/hooks/useWebSocket";
import { VoiceControls } from "./VoiceControls";
import { ParticipantList } from "./ParticipantList";
import type { User } from "@/types";

type Props = {
  channelId: string;
  channelName: string;
  currentUser: User;
};

export function VoiceChannel({ channelId, channelName, currentUser }: Props) {
  const { send } = useWebSocket({});

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
        <span className="voice-channel-icon">🎤</span>
        <div className="voice-channel-title">
          <span className="voice-channel-name">{channelName}</span>
          <span className="voice-channel-subtitle">Voice Channel</span>
        </div>
        {isJoined && <span className="voice-live-badge">● Live</span>}
      </div>

      <div className="voice-channel-body">
        {!isJoined ? (
          <div className="voice-join-prompt">
            <div className="voice-join-icon">🎤</div>
            <p className="voice-join-title">Voice Channel</p>
            <p className="voice-join-subtitle">
              Click join to connect your microphone and talk with others.
            </p>
            <button className="voice-join-btn" onClick={join}>
              Join Voice
            </button>
          </div>
        ) : (
          <ParticipantList
            participants={participants}
            currentUserId={currentUser.id}
            currentUserName={currentUser.displayName}
            isMuted={isMuted}
            isDeafened={isDeafened}
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