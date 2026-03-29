"use client";

import { useCallback } from "react";
import { Mic } from "lucide-react";
import { useWebRTC } from "@/hooks/useWebRTC";
import { useWebSocket } from "@/hooks/useWebSocket";
import { VoiceControls } from "./VoiceControls";
import { ParticipantList } from "./ParticipantList";
import { Avatar } from "@/components/shared/Avatar";
import type { User, VoiceChannelUser } from "@/types";

type Props = {
  channelId: string;
  channelName: string;
  currentUser: User;
  connectedUsers?: VoiceChannelUser[];
};

export function VoiceChannel({ channelId, channelName, currentUser, connectedUsers = [] }: Props) {
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
      <div className="voice-channel-body">
        {!isJoined ? (
          <div className="voice-channel-not-joined">
            {/* Grid of Connected Users */}
            <div className="voice-channel-users-grid">
              {connectedUsers.map((voiceUser) => (
                <div key={voiceUser.userId} className="voice-user-card">
                  <div style={{ position: "relative" }}>
                    <Avatar user={voiceUser.user} size="lg" />
                    {voiceUser.isMuted && (
                      <div className="voice-user-card-mute-badge">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                          <line x1="1" y1="1" x2="23" y2="23" />
                          <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
                          <path d="M17 16.95A7 7 0 0 1 5 12m14 0a7 7 0 0 1-13.12 2.12" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="voice-user-card-name">{voiceUser.user.displayName}</div>
                </div>
              ))}
            </div>

            <button className="voice-join-btn" onClick={join}>
              🎤 Join Voice
            </button>
          </div>
        ) : (
          <div className="voice-channel-joined">
            {/* Main Voice Channel Area */}
            <div className="voice-channel-content">
              <ParticipantList
                participants={participants}
                currentUserId={currentUser.id}
                currentUserName={currentUser.displayName}
                isMuted={isMuted}
                isDeafened={isDeafened}
              />
            </div>

            {/* Members Sidebar */}
            <div className="voice-members-sidebar">
              <div className="voice-members-header">
                <div className="voice-members-header-text">Members — {participants.length + 1}</div>
              </div>

              {/* Members List */}
              <div className="voice-members-list">
                {/* Current User */}
                <div className="voice-member-entry voice-member-current">
                  <Avatar user={currentUser} size="sm" />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="voice-member-name">You</div>
                    <div className="voice-member-status">
                      {isMuted && <span>🔇</span>}
                      {isDeafened && <span>🔕</span>}
                      {!isMuted && !isDeafened && <span>🔊</span>}
                    </div>
                  </div>
                </div>

                {/* Other Participants */}
                {participants.map((participant) => (
                  <div
                    key={participant.userId}
                    className={`voice-member-entry ${participant.isSpeaking ? "voice-member-speaking" : "voice-member-idle"}`}
                  >
                    <div style={{ position: "relative" }}>
                      <Avatar user={{ 
                        id: participant.userId,
                        username: participant.displayName,
                        displayName: participant.displayName,
                        email: "",
                        status: "online",
                      }} size="sm" />
                      {participant.isSpeaking && (
                        <span style={{
                          position: "absolute",
                          bottom: "-2px",
                          right: "-2px",
                          width: "14px",
                          height: "14px",
                          backgroundColor: "var(--success)",
                          borderRadius: "50%",
                          border: "2px solid var(--bg-secondary)",
                          animation: "speaking-pulse 1s infinite",
                        }} />
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="voice-member-name">{participant.displayName}</div>
                      <div className="voice-member-status">
                        {participant.isMuted && <span>🔇</span>}
                        {participant.isDeafened && <span>🔕</span>}
                        {!participant.isMuted && !participant.isDeafened && <span>🔊</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
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