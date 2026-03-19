"use client";

import { getInitials } from "@/lib/utils";

type Participant = {
  userId: string;
  displayName: string;
  isMuted: boolean;
  isDeafened: boolean;
  isSpeaking: boolean;
};

type Props = {
  participants: Participant[];
  currentUserId: string;
  currentUserName: string;
  isMuted: boolean;
  isDeafened: boolean;
};

export function ParticipantList({
  participants,
  currentUserId,
  currentUserName,
  isMuted,
  isDeafened,
}: Props) {
  const allParticipants = [
    {
      userId: currentUserId,
      displayName: currentUserName,
      isMuted,
      isDeafened,
      isSpeaking: false,
    },
    ...participants,
  ];

  return (
    <div className="participant-list">
      <p className="participant-list-label">
        {allParticipants.length} in voice
      </p>
      <div className="participant-grid">
        {allParticipants.map((p) => (
          <div
            key={p.userId}
            className={`participant-card ${p.isSpeaking ? "participant-card-speaking" : ""}`}
          >
            <div className="participant-avatar">
              {getInitials(p.displayName)}
              {p.isSpeaking && <span className="participant-speaking-ring" />}
            </div>
            <p className="participant-name">
              {p.userId === currentUserId ? "You" : p.displayName}
            </p>
            <div className="participant-indicators">
              {p.isMuted && <span title="Muted">🔇</span>}
              {p.isDeafened && <span title="Deafened">🔕</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}