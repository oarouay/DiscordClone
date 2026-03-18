"use client";

import { useState } from "react";
import type { Channel } from "@/types";
import { ChannelItem } from "./ChannelItem";
import { CreateChannelModal } from "./CreateChannelModal";

type ChannelListProps = {
  channels: Channel[];
  guildId: string;
  guildName: string;
  currentChannelId?: string;
  onCreateChannel: (name: string, type: "TEXT" | "VOICE", category: string) => Promise<void>;
};

export function ChannelList({
  channels,
  guildId,
  guildName,
  currentChannelId,
  onCreateChannel,
}: ChannelListProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Group channels by category
  const roomsChannels = channels.filter((c) => c.category === "Rooms");
  const callsChannels = channels.filter((c) => c.category === "Calls");

  return (
    <>
      <div className="w-80 bg-bg-secondary border-r border-border flex flex-col h-screen">
        {/* Header */}
        <div className="px-6 py-6 border-b border-border">
          <h2 className="text-xl font-bold text-text-primary">
            {guildName}
          </h2>
        </div>

        {/* Channels */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-10">
          {/* Text Channels (Rooms) */}
          {roomsChannels.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-text-muted uppercase px-4 mb-5 tracking-widest">
                🏠 Rooms
              </h3>
              <div className="space-y-2">
                {roomsChannels.map((channel) => (
                  <ChannelItem
                    key={channel.id}
                    channel={channel}
                    isSelected={currentChannelId === channel.id}
                    guildId={guildId}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Voice Channels (Calls) */}
          {callsChannels.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-text-muted uppercase px-4 mb-5 tracking-widest">
                📞 Calls
              </h3>
              <div className="space-y-2">
                {callsChannels.map((channel) => (
                  <ChannelItem
                    key={channel.id}
                    channel={channel}
                    isSelected={currentChannelId === channel.id}
                    guildId={guildId}
                  />
                ))}
              </div>
            </div>
          )}

          {/* No channels message */}
          {channels.length === 0 && (
            <p className="text-sm text-text-muted text-center py-12">
              No channels yet
            </p>
          )}
        </div>

        {/* Create Channel Button */}
        <div className="px-6 py-6 border-t border-border">
          <button
            onClick={() => setShowCreateModal(true)}
            className="
              w-full px-6 py-3 rounded-lg font-semibold
              bg-bg-hover hover:bg-accent/20 text-text-primary
              transition-colors text-base
            "
          >
            + Add Channel
          </button>
        </div>
      </div>

      {showCreateModal && (
        <CreateChannelModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={onCreateChannel}
        />
      )}
    </>
  );
}
