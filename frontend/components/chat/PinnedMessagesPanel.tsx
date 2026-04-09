"use client";

import { useState } from "react";
import { ChevronDown, X } from "lucide-react";
import type { Message } from "@/types";

interface PinnedMessagesProps {
  pinned: Message[];
  onUnpin: (messageId: string) => void;
}

export function PinnedMessagesPanel({
  pinned,
  onUnpin,
}: PinnedMessagesProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (pinned.length === 0) return null;

  return (
    <div className="pinned-messages-panel">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="pinned-messages-header"
        aria-label={isExpanded ? "Collapse pinned messages" : "Expand pinned messages"}
      >
        <ChevronDown
          size={16}
          style={{
            transform: isExpanded ? "rotate(0deg)" : "rotate(-90deg)",
            transition: "transform 200ms ease",
          }}
        />
        <span className="pinned-messages-title">
          📌 Pinned Messages ({pinned.length})
        </span>
      </button>

      {isExpanded && (
        <div className="pinned-messages-list">
          {pinned.map((message) => (
            <div key={message.id} className="pinned-message-item">
              <div className="pinned-message-author">
                {message.author.displayName}
              </div>
              <div className="pinned-message-content">
                {message.content.substring(0, 100)}
                {message.content.length > 100 ? "..." : ""}
              </div>
              <button
                onClick={() => onUnpin(message.id)}
                className="pinned-message-unpin"
                title="Unpin message"
                aria-label="Unpin message"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
