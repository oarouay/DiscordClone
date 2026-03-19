"use client";

import { PhoneOff, Wifi } from "lucide-react";

type Props = { channelName: string; guildName: string; onLeave: () => void; };

export function VoiceStatusBar({ channelName, guildName, onLeave }: Props) {
  return (
    <div className="voice-status-bar">
      <div className="voice-status-bar-header">
        <div className="voice-status-bar-connected">
          <Wifi size={12} color="var(--success)" />
          <span className="voice-status-bar-label">Voice Connected</span>
        </div>
        <button onClick={onLeave} title="Disconnect from voice" aria-label="Leave voice channel" className="voice-status-bar-leave">
          <PhoneOff size={13} />
        </button>
      </div>
      <p className="voice-status-bar-channel">🔊 {channelName}</p>
      <p className="voice-status-bar-guild">{guildName}</p>
    </div>
  );
}