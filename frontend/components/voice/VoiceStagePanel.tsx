"use client";

import { useState, useEffect } from "react";
import { Mic, Headphones, Share2, PhoneOff } from "lucide-react";
import type { Member } from "@/types";
import { Avatar } from "@/components/shared/Avatar";
import { useMockData } from "@/context/MockDataProvider";

interface VoiceStagePanelProps {
  members: Member[];
  currentUserId: string;
  onDisconnect: () => void;
}

export function VoiceStagePanel({
  members,
  currentUserId,
  onDisconnect,
}: VoiceStagePanelProps) {
  const mockData = useMockData();
  const [speakingUsers, setSpeakingUsers] = useState<Set<string>>(new Set());

  // Simulate speaking status changes
  useEffect(() => {
    const interval = setInterval(() => {
      setSpeakingUsers((prev) => {
        const updated = new Set(prev);
        members.forEach((member) => {
          if (Math.random() > 0.7) {
            if (updated.has(member.userId)) {
              updated.delete(member.userId);
            } else {
              updated.add(member.userId);
            }
          }
        });
        return updated;
      });
    }, 2000 + Math.random() * 2000);

    return () => clearInterval(interval);
  }, [members]);

  const currentUser = members.find((m) => m.userId === currentUserId);
  const otherMembers = members.filter((m) => m.userId !== currentUserId);
  const voiceState = mockData.memberVoiceStates[currentUserId];

  return (
    <div className="voice-stage-container">
      {/* Participant Grid */}
      <div className="voice-stage-grid">
        {/* Current user card */}
        {currentUser && (
          <ParticipantCard
            member={currentUser}
            isSpeaking={speakingUsers.has(currentUser.userId)}
            voiceState={voiceState}
          />
        )}

        {/* Other members */}
        {otherMembers.map((member) => (
          <ParticipantCard
            key={member.userId}
            member={member}
            isSpeaking={speakingUsers.has(member.userId)}
            voiceState={mockData.memberVoiceStates[member.userId]}
          />
        ))}
      </div>

      {/* Voice Controls Bar */}
      <div className="voice-stage-controls-bar">
        {/* Mute Button */}
        <VCButton
          icon={<Mic size={20} />}
          active={!voiceState?.isMuted}
          onClick={() => {
            mockData.setMemberVoiceState(currentUserId, {
              isMuted: !voiceState?.isMuted,
            });
          }}
          label="Mute"
        />

        {/* Deafen Button */}
        <VCButton
          icon={<Headphones size={20} />}
          active={!voiceState?.isDeafened}
          onClick={() => {
            mockData.setMemberVoiceState(currentUserId, {
              isDeafened: !voiceState?.isDeafened,
            });
          }}
          label="Deafen"
        />

        {/* Screenshare Button (inactive) */}
        <VCButton
          icon={<Share2 size={20} />}
          active={false}
          onClick={() => {}}
          label="Screenshare"
          disabled={true}
        />

        {/* Disconnect Button */}
        <VCButton
          icon={<PhoneOff size={20} />}
          active={false}
          onClick={onDisconnect}
          label="Disconnect"
          danger={true}
        />
      </div>
    </div>
  );
}

function ParticipantCard({
  member,
  isSpeaking,
  voiceState,
}: {
  member: Member;
  isSpeaking: boolean;
  voiceState?: {
    isMuted?: boolean;
    isDeafened?: boolean;
    serverMuted?: boolean;
    serverDeafened?: boolean;
  };
}) {
  return (
    <div className={`voice-participant-card ${isSpeaking ? "voice-participant-card-speaking" : ""}`}>
      {/* Avatar with speaking ring */}
      <div className="voice-participant-avatar-wrapper">
        {isSpeaking && <div className="voice-speaking-ring" />}
        <Avatar user={member.user} size="lg" />
      </div>

      {/* Display name */}
      <div className="voice-participant-name">
        {member.user.displayName}
      </div>

      {/* Username */}
      <div className="voice-participant-username">
        @{member.user.username}
      </div>

      {/* Mute/Deafen badges */}
      {(voiceState?.isMuted || voiceState?.serverMuted || voiceState?.isDeafened || voiceState?.serverDeafened) && (
        <div className="voice-participant-badges">
          {(voiceState?.isMuted || voiceState?.serverMuted) && (
            <span className="voice-mute-badge" aria-label="User is muted">
              🔇
            </span>
          )}
          {(voiceState?.isDeafened || voiceState?.serverDeafened) && (
            <span className="voice-deafen-badge" aria-label="User is deafened">
              🔕
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function VCButton({
  icon,
  active,
  onClick,
  label,
  disabled = false,
  danger = false,
}: {
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
  label: string;
  disabled?: boolean;
  danger?: boolean;
}) {
  const className = danger
    ? "voice-stage-button voice-stage-button-danger"
    : active
    ? "voice-stage-button voice-stage-button-active"
    : "voice-stage-button";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label}
      className={className}
      aria-label={label}
    >
      {icon}
    </button>
  );
}
