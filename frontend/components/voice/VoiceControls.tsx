"use client";

type Props = {
  isMuted: boolean;
  isDeafened: boolean;
  onToggleMute: () => void;
  onToggleDeafen: () => void;
  onLeave: () => void;
};

export function VoiceControls({
  isMuted,
  isDeafened,
  onToggleMute,
  onToggleDeafen,
  onLeave,
}: Props) {
  return (
    <div className="voice-controls">
      <button
        className={`voice-ctrl-btn ${isMuted ? "voice-ctrl-btn-active" : ""}`}
        onClick={onToggleMute}
        title={isMuted ? "Unmute" : "Mute"}
      >
        {isMuted ? "🔇" : "🎙️"}
      </button>

      <button
        className={`voice-ctrl-btn ${isDeafened ? "voice-ctrl-btn-active" : ""}`}
        onClick={onToggleDeafen}
        title={isDeafened ? "Undeafen" : "Deafen"}
      >
        {isDeafened ? "🔕" : "🔊"}
      </button>

      <button
        className="voice-ctrl-btn voice-ctrl-btn-leave"
        onClick={onLeave}
        title="Leave voice channel"
      >
        ✕ Leave
      </button>
    </div>
  );
}